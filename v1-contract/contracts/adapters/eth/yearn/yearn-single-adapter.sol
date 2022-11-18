// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorEth.sol";
import "../../../interfaces/IHedgepieAdapterInfoEth.sol";

interface IStrategy {
    function deposit(uint256 _amount) external;

    function withdraw(uint256 _amount) external;

    function totalAssets() external view returns (uint256);

    function totalSupply() external view returns (uint256);
}

contract YearnSingleAdapter is BaseAdapterEth {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _swapRouter swapRouter for swapping tokens
     * @param _weth  weth address
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _swapRouter,
        address _weth,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        repayToken = _strategy;
        strategy = _strategy;
        swapRouter = _swapRouter;
        name = _name;
        weth = _weth;
    }

    /**
     * @notice Deposit to yearn adapter
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     * @param _amountIn  amount of eth
     */
    function deposit(
        uint256 _tokenId,
        address _account,
        uint256 _amountIn
    ) external payable override onlyInvestor returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");

        amountOut = HedgepieLibraryEth.swapOnRouter(
            address(this),
            _amountIn,
            stakingToken,
            swapRouter,
            weth
        );

        uint256 repayAmt = IBEP20(repayToken).balanceOf(address(this));

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).deposit(amountOut);

        repayAmt = IBEP20(repayToken).balanceOf(address(this)) - repayAmt;

        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];
        unchecked {
            // update adapter info
            adapterInfos[_tokenId].totalStaked += amountOut;

            // update user info
            userInfo.amount += amountOut;
            userInfo.invested += _amountIn;
            userInfo.userShares += repayAmt;
        }

        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateParticipantInfo(
            _tokenId,
            _account,
            true
        );
    }

    /**
     * @notice Withdraw to yearn adapter
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     */
    function withdraw(uint256 _tokenId, address _account)
        external
        payable
        override
        onlyInvestor
        returns (uint256 amountOut)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        IStrategy(strategy).withdraw(userInfo.userShares);

        amountOut = IBEP20(stakingToken).balanceOf(address(this)) - amountOut;
        amountOut = HedgepieLibraryEth.swapforEth(
            address(this),
            amountOut,
            stakingToken,
            swapRouter,
            weth
        );

        if (amountOut != 0) {
            uint256 taxAmount;
            bool success;

            if (userInfo.invested <= amountOut) {
                taxAmount =
                    ((amountOut - userInfo.invested) *
                        IYBNFT(IHedgepieInvestorEth(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorEth(investor).treasury())
                    .call{value: taxAmount}("");
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }

        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateParticipantInfo(
            _tokenId,
            _account,
            false
        );

        unchecked {
            // update adapter info
            adapterInfos[_tokenId].totalStaked -= userInfo.amount;

            // update user info
            userInfo.amount = 0;
            userInfo.invested = 0;
            userInfo.userShares = 0;
        }
    }

    /**
     * @notice Return the pending reward by ETH
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

        uint256 _vAmount = ((userInfo.userShares *
            IStrategy(strategy).totalAssets()) /
            IStrategy(strategy).totalSupply());

        if (_vAmount <= userInfo.amount) return 0;

        reward = IPancakeRouter(swapRouter).getAmountsOut(
            _vAmount - userInfo.amount,
            getPaths(stakingToken, weth)
        )[1];
    }

    receive() external payable {}
}
