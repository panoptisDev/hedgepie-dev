// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterBsc.sol";

import "../../../libraries/HedgepieLibraryBsc.sol";
import "../../../interfaces/IHedgepieInvestorBsc.sol";
import "../../../interfaces/IHedgepieAdapterInfoBsc.sol";

interface IStrategy {
    function deposit(uint256) external payable;

    function deposit(uint256, uint256) external;

    function withdraw(uint256, uint256) external;

    function withdrawBNB(uint256, uint256) external;

    function balance() external view returns(uint256);

    function totalSupply() external view returns(uint256);
}

contract BeltVaultAdapter is BaseAdapterBsc {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _repayToken  address of reward token
     * @param _swapRouter  address of swap router
     * @param _wbnb  address of wbnb
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _repayToken,
        address _swapRouter,
        address _wbnb,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        repayToken = _repayToken;
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

        // get stakingToken
        amountOut = HedgepieLibraryBsc.swapOnRouter(
            _amountIn,
            address(this),
            stakingToken,
            swapRouter,
            wbnb
        );

        // deposit
        uint256 repayAmt = IBEP20(repayToken).balanceOf(
            address(this)
        );

        if(stakingToken == wbnb) {
            IStrategy(strategy).deposit {
                value: amountOut
            } (0);
        } else {
            IBEP20(stakingToken).approve(strategy, amountOut);
            IStrategy(strategy).deposit(amountOut, 0);
        }

        unchecked {
            repayAmt = IBEP20(repayToken).balanceOf(address(this))
                - repayAmt;

            adapterInfo.totalStaked += amountOut;

            userInfo.amount += amountOut;
            userInfo.invested += _amountIn;
            userInfo.userShares += repayAmt;
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
        if(isBNB) {
            IStrategy(strategy).withdrawBNB(userInfo.userShares, 0);
        } else {
            IStrategy(strategy).withdraw(userInfo.userShares, 0);
        }

        unchecked {
            amountOut = (isBNB ? address(this).balance
                : IBEP20(stakingToken).balanceOf(address(this)))
                - amountOut;
        }

        amountOut = HedgepieLibraryBsc.swapforBnb(
            amountOut,
            address(this),
            stakingToken,
            swapRouter,
            wbnb
        );

        address adapterInfoEthAddr = IHedgepieInvestorBsc(investor)
            .adapterInfo();

        uint256 reward;
        if (amountOut > userInfo.invested) {
            reward = amountOut - userInfo.invested;

            IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateProfitInfo(
                _tokenId,
                reward,
                true
            );
        }        

        // Update adapterInfo contract
        IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateParticipantInfo(
            _tokenId,
            _account,
            false
        );

        unchecked {
            adapterInfo.totalStaked -= userInfo.amount;
        }

        delete userAdapterInfos[_account][_tokenId];

        if (amountOut != 0) {
            bool success;
            if (reward != 0) {
                reward =
                    (reward *
                        IYBNFT(IHedgepieInvestorBsc(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorBsc(investor).treasury())
                    .call{value: reward}("");
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - reward}("");
            require(success, "Failed to send ether");
        }
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

        uint256 _reward = userInfo.userShares *
            (IStrategy(strategy).balance()) / 
            (IStrategy(strategy).totalSupply());

        if(_reward < userInfo.amount) return 0;

        address token0 = IPancakePair(stakingToken).token0();
        address token1 = IPancakePair(stakingToken).token1();
        (uint112 reserve0, uint112 reserve1, ) = IPancakePair(stakingToken)
            .getReserves();

        uint256 amount0 = (reserve0 * (_reward - userInfo.amount)) /
            IPancakePair(stakingToken).totalSupply();
        uint256 amount1 = (reserve1 * (_reward - userInfo.amount)) /
            IPancakePair(stakingToken).totalSupply();

        if (token0 == wbnb) reward += amount0;
        else
            reward += IPancakeRouter(swapRouter).getAmountsOut(
                amount0,
                getPaths(token0, wbnb)
            )[1];

        if (token1 == wbnb) reward += amount1;
        else
            reward += IPancakeRouter(swapRouter).getAmountsOut(
                amount1,
                getPaths(token1, wbnb)
            )[1];
    }

    receive() external payable {}
}
