// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterBsc.sol";

import "../../../libraries/HedgepieLibraryBsc.sol";
import "../../../interfaces/IHedgepieInvestorBsc.sol";
import "../../../interfaces/IHedgepieAdapterInfoBsc.sol";

interface IStrategy {
    function deposit(uint256) external payable;

    function withdraw(uint256) external;

    function totalSupply() external view returns(uint256);

    function totalToken() external view returns(uint256);

    function balanceOf(address) external view returns(uint256);
}

contract AlpacaLendAdapter is BaseAdapterBsc {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _swapRouter  address of swap router
     * @param _wbnb  address of wbnb
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _swapRouter,
        address _wbnb,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        repayToken = _strategy;
        strategy = _strategy;
        swapRouter = _swapRouter;
        wbnb = _wbnb;
        name = _name;
    }

    /**
     * @notice Deposit with BNB
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     * @param _amountIn BNB amount
     */
    function deposit(
        uint256 _tokenId,
        uint256 _amountIn,
        address _account
    ) external payable override onlyInvestor returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        // get token
        bool isBNB = stakingToken == wbnb;
        if(isBNB) {
            amountOut = _amountIn;
        } else {
            amountOut = HedgepieLibraryBsc.swapOnRouter(
                _amountIn,
                address(this),
                stakingToken,
                swapRouter,
                wbnb
            );
        }

        // stake
        uint256 repayAmt = IBEP20(repayToken).balanceOf(
            address(this)
        );

        if(isBNB) {
            IStrategy(strategy).deposit {
                value: amountOut
            } (amountOut);
        } else {
            IBEP20(stakingToken).approve(strategy, amountOut);
            IStrategy(strategy).deposit(amountOut);
        }

        unchecked {
            repayAmt = IBEP20(repayToken).balanceOf(address(this)) - repayAmt;

            adapterInfo.totalStaked += amountOut;
            if (repayAmt != 0) {
                adapterInfo.accTokenPerShare +=
                    (repayAmt * 1e12) /
                    adapterInfo.totalStaked;
            }

            if (userInfo.amount == 0) {
                userInfo.userShares = adapterInfo.accTokenPerShare;
            }
            userInfo.amount += amountOut;
            userInfo.invested += _amountIn;
            userInfo.userShares1 += repayAmt;
        }

        // Update adapterInfo contract
        address adapterInfoBscAddr = IHedgepieInvestorBsc(investor)
            .adapterInfo();
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateTVLInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateTradedInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateParticipantInfo(
            _tokenId,
            _account,
            true
        );
    }

    /**
     * @notice Withdraw the deposited BNB
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     */
    function withdraw(uint256 _tokenId, address _account)
        external
        payable
        override
        onlyInvestor
        returns (uint256 amountOut)
    {
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo memory userInfo = userAdapterInfos[_account][_tokenId];

        bool isBNB = stakingToken == wbnb;
        amountOut = isBNB ? address(this).balance
            : IBEP20(stakingToken).balanceOf(address(this));

        // withdraw
        IStrategy(strategy).withdraw(userInfo.userShares1);

        unchecked {
            amountOut = (isBNB ? address(this).balance
                : IBEP20(stakingToken).balanceOf(address(this)))
                - amountOut;
        }

        // swap wraptoken to BNB
        if(stakingToken != wbnb) {
            amountOut = HedgepieLibraryBsc.swapforBnb(
                amountOut,
                address(this),
                stakingToken,
                swapRouter,
                wbnb
            );
        }

        address adapterInfoBscAddr = IHedgepieInvestorBsc(investor)
            .adapterInfo();

        uint256 rewardAmt;
        if(amountOut > userInfo.invested) {
            unchecked {
                rewardAmt = amountOut - userInfo.invested;
            }

            IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateProfitInfo(
                _tokenId,
                rewardAmt,
                true
            );
        }

        if (amountOut != 0) {
            bool success;
            if (rewardAmt != 0) {
                rewardAmt =
                    (rewardAmt *
                        IYBNFT(IHedgepieInvestorBsc(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorBsc(investor).treasury())
                    .call{value: rewardAmt}("");
                require(success, "Failed to send bnb to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - rewardAmt}("");
            require(success, "Failed to send bnb");
        }

        // Update adapterInfo contract
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateParticipantInfo(
            _tokenId,
            _account,
            false
        );

        unchecked {
            adapterInfo.totalStaked -= userInfo.amount;
        }

        delete userAdapterInfos[_account][_tokenId];
    }

    /**
     * @notice Return the pending reward by BNB
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     */
    function pendingReward(uint256 _tokenId, address _account)
        external
        view
        override
        returns (uint256 reward)
    {
        UserAdapterInfo memory userInfo = userAdapterInfos[_account][_tokenId];
        AdapterInfo memory adapterInfo = adapterInfos[_tokenId];

        uint256 _reward = IStrategy(strategy).balanceOf(address(this)) *
            (IStrategy(strategy).totalToken()) / 
            (IStrategy(strategy).totalSupply());

        uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
            ((_reward * 1e12) / adapterInfo.totalStaked);

        uint256 tokenRewards = ((updatedAccTokenPerShare -
            userInfo.userShares) * userInfo.amount) / 1e12;

        if (tokenRewards != 0)
            reward = stakingToken == wbnb
                ? tokenRewards
                : IPancakeRouter(swapRouter).getAmountsOut(
                    tokenRewards,
                    getPaths(stakingToken, wbnb)
                )[1];
    }

    receive() external payable {}
}
