// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../../libraries/HedgepieLibraryMatic.sol";
import "../../../interfaces/IHedgepieInvestorMatic.sol";
import "../../../interfaces/IHedgepieAdapterInfoMatic.sol";

interface IAsset {}

interface IStrategy {
    function deposit(uint256) external;

    function withdraw(uint256) external;

    function balance() external view returns (uint256);

    function totalSupply() external view returns (uint256);
}

interface IBalancerVault {
    struct JoinPoolRequest {
        IAsset[] assets;
        uint256[] maxAmountsIn;
        bytes userData;
        bool fromInternalBalance;
    }

    struct ExitPoolRequest {
        IAsset[] assets;
        uint256[] minAmountsOut;
        bytes userData;
        bool toInternalBalance;
    }

    function getPoolTokens(bytes32)
        external
        view
        returns (
            IERC20[] memory,
            uint256[] memory,
            uint256
        );

    function joinPool(
        bytes32,
        address,
        address,
        JoinPoolRequest memory
    ) external;

    function exitPool(
        bytes32,
        address,
        address,
        ExitPoolRequest memory
    ) external;
}

contract BeefyBalancerAdapter is BaseAdapterMatic {
    BPool public bPool;

    struct BPool {
        uint256 lpCnt;
        uint256 lpOrder;
        bytes32 poolId;
    }

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _liquidityToken  address of deposit token to get lp
     * @param _router  address of router for LP
     * @param _swapRouter  address of swap router
     * @param _wmatic  address of wmatic
     * @param _bpool  info of balancer pool
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _liquidityToken,
        address _router,
        address _swapRouter,
        address _wmatic,
        BPool memory _bpool,
        string memory _name
    ) {
        strategy = _strategy;
        stakingToken = _stakingToken;
        liquidityToken = _liquidityToken;
        repayToken = _strategy;
        router = _router;
        swapRouter = _swapRouter;
        wmatic = _wmatic;
        name = _name;
        bPool = _bpool;
    }

    /**
     * @notice Get Balancer LP
     * @param _amountIn liquidity token amount
     */
    function _getBalancerLP(
        uint256 _amountIn
    ) internal returns(uint256 amountOut) {
        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        (IERC20[] memory tokens, ,) = IBalancerVault(router).getPoolTokens(
            bPool.poolId
        );

        uint256[] memory amountsIn = new uint256[](bPool.lpCnt);
        IAsset[] memory assets = new IAsset[](bPool.lpCnt);
        for(uint256 i = 0 ; i < bPool.lpCnt; ++i) {
            assets[i] = IAsset(address(tokens[i]));
            amountsIn[i] = address(tokens[i]) == liquidityToken ? _amountIn : 0;
        }

        IBEP20(liquidityToken).approve(router, _amountIn);
        IBalancerVault(router).joinPool(
            bPool.poolId,
            address(this),
            address(this),
            IBalancerVault.JoinPoolRequest({
                assets: assets,
                maxAmountsIn: amountsIn,
                userData: abi.encode(1, amountsIn, 0), // joinKind = 1
                fromInternalBalance: false
            })
        );

        unchecked {
            amountOut = IBEP20(stakingToken).balanceOf(address(this))
                - amountOut;
        }
    }

    /**
     * @notice Withdraw Balancer LP
     * @param _amountIn LP token amount
     */
    function _removeBalancerLP(
        uint256 _amountIn
    ) internal returns(uint256 amountOut) {
        amountOut = IBEP20(liquidityToken).balanceOf(address(this));

        (IERC20[] memory tokens, ,) = IBalancerVault(router).getPoolTokens(
            bPool.poolId
        );

        uint256[] memory amountsOut = new uint256[](bPool.lpCnt);
        IAsset[] memory assets = new IAsset[](bPool.lpCnt);
        for(uint256 i = 0 ; i < bPool.lpCnt; ++i) {
            assets[i] = IAsset(address(tokens[i]));
        }

        IBalancerVault(router).exitPool(
            bPool.poolId,
            address(this),
            address(this),
            IBalancerVault.ExitPoolRequest({
                assets: assets,
                minAmountsOut: amountsOut,
                userData: abi.encode(0, _amountIn, bPool.lpOrder), // exitKind = EXACT_BPT_IN_FOR_ONE_TOKEN_OUT
                toInternalBalance: false
            })
        );

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
        amountOut = _getBalancerLP(amountOut);

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
        amountOut = _removeBalancerLP(amountOut);
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

        uint256 lpReward = userInfo.userShares *
            (IStrategy(strategy).balance()) / 
            (IStrategy(strategy).totalSupply());

        (, uint256[] memory balances,) = IBalancerVault(router).getPoolTokens(
            bPool.poolId
        );

        lpReward = balances[bPool.lpOrder] * lpReward
            / IBEP20(stakingToken).totalSupply();

        if(lpReward < userInfo.amount) return 0;

        if(lpReward != 0)
            reward = IPancakeRouter(swapRouter).getAmountsOut(
                lpReward,
                getPaths(liquidityToken, wmatic)
            )[1];

            reward = reward <= userInfo.invested ? 0
                : (reward - userInfo.invested);
    }

    receive() external payable {}
}