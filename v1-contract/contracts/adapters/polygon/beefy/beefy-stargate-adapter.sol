// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../../libraries/HedgepieLibraryMatic.sol";
import "../../../interfaces/IHedgepieInvestorMatic.sol";
import "../../../interfaces/IHedgepieAdapterInfoMatic.sol";

interface IStrategy {
    function deposit(uint256) external;

    function withdraw(uint256) external;

    function balance() external view returns (uint256);

    function totalSupply() external view returns (uint256);
}

interface IStargate {
    function addLiquidity(uint256,uint256,address) external;

    function instantRedeemLocal(uint16,uint256,address) external;

    function totalSupply() external view returns(uint256);

    function totalLiquidity() external view returns(uint256);
}

contract BeefyStargateAdapter is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _pid  pid of stargate poolid
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _liquidityToken  address of liquidity token
     * @param _router  address of router for LP
     * @param _swapRouter  address of swap router
     * @param _wmatic  address of wmatic
     * @param _name  adatper name
     */
    constructor(
        uint256 _pid,
        address _strategy,
        address _stakingToken,
        address _liquidityToken,
        address _router,
        address _swapRouter,
        address _wmatic,
        string memory _name
    ) {
        pid = _pid;
        strategy = _strategy;
        stakingToken = _stakingToken;
        repayToken = _strategy;
        swapRouter = _swapRouter;
        liquidityToken = _liquidityToken;
        router = _router;
        wmatic = _wmatic;
        name = _name;
    }

    /**
     * @notice Get Stargate LP
     * @param _amountIn liquidity token amount
     */
    function _getStargate(
        uint256 _amountIn
    ) internal returns(uint256 amountOut) {
        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        IBEP20(liquidityToken).approve(router, _amountIn);
        IStargate(router).addLiquidity(pid, _amountIn, address(this));

        unchecked {
            amountOut = IBEP20(stakingToken).balanceOf(address(this))
                - amountOut;
        }
    }

    /**
     * @notice Remove Stargate LP
     * @param _amountIn LP amount
     */
    function _removeStargate(
        uint256 _amountIn
    ) internal returns(uint256 amountOut) {
        amountOut = IBEP20(liquidityToken).balanceOf(address(this));

        IStargate(router).instantRedeemLocal(uint16(pid), _amountIn, address(this));

        unchecked {
            amountOut = IBEP20(liquidityToken).balanceOf(address(this))
                - amountOut;
        }
    }

    /**
     * @notice Deposit with Matic
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     * @param _amountIn Matic amount
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
        amountOut = HedgepieLibraryMatic.swapOnRouter(
            _amountIn,
            address(this),
            liquidityToken,
            swapRouter,
            wmatic
        );

        // get stargate lp
        amountOut = _getStargate(amountOut);

        // deposit
        uint256 repayAmt = IBEP20(repayToken).balanceOf(
            address(this)
        );

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).deposit(amountOut);

        unchecked {
            repayAmt = IBEP20(repayToken).balanceOf(address(this))
                - repayAmt;

            adapterInfo.totalStaked += amountOut;

            userInfo.amount += amountOut;
            userInfo.invested += _amountIn;
            userInfo.userShares += repayAmt;
        }

        // Update adapterInfo contract
        address adapterInfoMaticAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateTVLInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateTradedInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateParticipantInfo(
            _tokenId,
            _account,
            true
        );
    }

    /**
     * @notice Withdraw the deposited Matic
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

        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        // withdraw
        IStrategy(strategy).withdraw(userInfo.userShares);

        unchecked {
            amountOut = IBEP20(stakingToken).balanceOf(address(this))
                - amountOut;
        }

        // remove from stargate
        amountOut = _removeStargate(amountOut);
        amountOut = HedgepieLibraryMatic.swapforMatic(
            amountOut,
            address(this),
            liquidityToken,
            swapRouter,
            wmatic
        );

        address adapterInfoMaticAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();

        uint256 reward;
        if (amountOut > userInfo.invested) {
            reward = amountOut - userInfo.invested;

            IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateProfitInfo(
                _tokenId,
                reward,
                true
            );
        }

        // Update adapterInfo contract
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateParticipantInfo(
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
                        IYBNFT(IHedgepieInvestorMatic(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorMatic(investor).treasury())
                    .call{value: reward}("");
                require(success, "Failed to send matic to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - reward}("");
            require(success, "Failed to send matic");
        }
    }

    /**
     * @notice Return the pending reward by Matic
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

        _reward = _reward * IStargate(stakingToken).totalLiquidity()
            / IStargate(stakingToken).totalSupply();

        if(_reward != 0)
            reward = IPancakeRouter(swapRouter).getAmountsOut(
                _reward,
                getPaths(liquidityToken, wmatic)
            )[1];

            reward = reward <= userInfo.invested ? 0
                : (reward - userInfo.invested);
    }

    receive() external payable {}
}
