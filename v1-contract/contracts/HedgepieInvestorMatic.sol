// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "./libraries/SafeBEP20.sol";
import "./libraries/Ownable.sol";
import "./libraries/TickMath.sol";

import "./interfaces/IYBNFT.sol";
import "./interfaces/IAdapter.sol";
import "./interfaces/IVaultStrategy.sol";
import "./interfaces/IAdapterManager.sol";
import "./interfaces/IPancakePair.sol";
import "./interfaces/IPancakeRouter.sol";

contract HedgepieInvestorMatic is Ownable, ReentrancyGuard, IERC721Receiver {
    using SafeBEP20 for IBEP20;

    struct UserAdapterInfo {
        uint256 amount;
        uint256 userShares;
        uint256 userShares1;
    }

    struct AdapterInfo {
        uint256 accTokenPerShare;
        uint256 accTokenPerShare1;
        uint256 totalStaked;
    }

    struct NFTInfo {
        uint256 tvl;
        uint256 totalParticipant;
    }

    // ybnft => nft id => NFTInfo
    mapping(address => mapping(uint256 => NFTInfo)) public nftInfo;

    // user => ybnft => nft id => amount(Invested WMATIC)
    mapping(address => mapping(address => mapping(uint256 => uint256)))
        public userInfo;

    // user => nft id => adapter => UserAdapterInfo
    mapping(address => mapping(uint256 => mapping(address => UserAdapterInfo)))
        public userAdapterInfos;

    // nft id => adapter => AdapterInfo
    mapping(uint256 => mapping(address => AdapterInfo)) public adapterInfos;

    // ybnft address
    address public ybnft;

    // swap router address
    address public swapRouter;

    // wrapped matic address
    address public wmatic;

    // strategy manager
    address public adapterManager;

    address public treasuryAddr;

    event DepositMATIC(
        address indexed user,
        address nft,
        uint256 nftId,
        uint256 amount
    );
    event WithdrawMATIC(
        address indexed user,
        address nft,
        uint256 nftId,
        uint256 amount
    );
    event Claimed(address indexed user, uint256 amount);
    event AdapterManagerChanged(address indexed user, address adapterManager);

    /**
     * @notice Construct
     * @param _ybnft  address of YBNFT
     * @param _swapRouter  address of pancakeswap router
     * @param _wmatic  address of Wrapped MATIC address
     */
    constructor(
        address _ybnft,
        address _swapRouter,
        address _wmatic
    ) {
        require(_ybnft != address(0), "Error: YBNFT address missing");
        require(_swapRouter != address(0), "Error: swap router missing");
        require(_wmatic != address(0), "Error: wmatic missing");

        ybnft = _ybnft;
        swapRouter = _swapRouter;
        wmatic = _wmatic;
    }

    /**
     * @notice Set treasury address and percent
     * @param _treasury  treasury address
     */
    /// #if_succeeds {:msg "Treasury not updated"} treasuryAddr == _treasury;
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasuryAddr = _treasury;
    }

    /**
     * @notice Deposit with MATIC
     * @param _user  user address
     * @param _tokenId  YBNft token id
     * @param _amount  MATIC amount
     */
    /// #if_succeeds {:msg "userInfo not increased"} userInfo[_user][ybnft][_tokenId] > old(userInfo[_user][ybnft][_tokenId]);
    function depositMATIC(
        address _user,
        uint256 _tokenId,
        uint256 _amount
    ) external payable nonReentrant {
        require(_amount != 0, "Error: Amount can not be 0");
        require(msg.value == _amount, "Error: Insufficient MATIC");
        require(
            IYBNFT(ybnft).exists(_tokenId),
            "Error: nft tokenId is invalid"
        );

        IYBNFT.Adapter[] memory adapterInfo = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );

        uint256 beforeBalance = address(this).balance;

        for (uint8 i = 0; i < adapterInfo.length; i++) {
            IYBNFT.Adapter memory adapter = adapterInfo[i];

            uint256 amountIn = (_amount * adapter.allocation) / 1e4;
            uint256 amountOut;
            address routerAddr = IAdapter(adapter.addr).router();
            if (routerAddr == address(0)) {
                if (adapter.token == wmatic) {
                    amountOut = amountIn;
                } else {
                    // swap
                    amountOut = _swapOnRouterMATIC(
                        adapter.addr,
                        amountIn,
                        adapter.token,
                        swapRouter
                    );
                }
            } else {
                // get lp
                amountOut = _getLP(
                    adapter.addr,
                    adapter.token,
                    routerAddr,
                    amountIn,
                    _tokenId
                );
            }

            if(IAdapter(adapter.addr).noDeposit()) {
                IAdapter(adapter.addr).increaseWithdrawalAmount(
                    msg.sender,
                    _tokenId,
                    amountOut
                );
            } else {
                // deposit to adapter
                _depositToAdapter(adapter.token, adapter.addr, _tokenId, amountOut);
            }

            userAdapterInfos[_user][_tokenId][adapter.addr].amount += amountOut;
            adapterInfos[_tokenId][adapter.addr].totalStaked += amountOut;
        }

        nftInfo[ybnft][_tokenId].tvl += _amount;
        if (userInfo[_user][ybnft][_tokenId] == 0) {
            nftInfo[ybnft][_tokenId].totalParticipant++;
        }
        userInfo[_user][ybnft][_tokenId] += _amount;

        uint256 afterBalance = address(this).balance;
        if (afterBalance > beforeBalance) {
            (bool success, ) = payable(_user).call{
                value: afterBalance - beforeBalance
            }("");
            require(success, "Error: Failed to send remained MATIC");
        }

        emit DepositMATIC(_user, ybnft, _tokenId, _amount);
    }

    /**
     * @notice Withdraw by MATIC
     * @param _user  user address
     * @param _tokenId  YBNft token id
     */
    /// #if_succeeds {:msg "userInfo not decreased"} userInfo[_user][ybnft][_tokenId] < old(userInfo[_user][ybnft][_tokenId]);
    function withdrawMATIC(address _user, uint256 _tokenId)
        external
        nonReentrant
    {
        require(
            IYBNFT(ybnft).exists(_tokenId),
            "Error: nft tokenId is invalid"
        );
        uint256 userAmount = userInfo[_user][ybnft][_tokenId];
        require(userAmount != 0, "Error: Amount should be greater than 0");

        IYBNFT.Adapter[] memory adapterInfo = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );

        uint256 amountOut;
        uint256 balanceDiff;
        uint256[2] memory balances;

        for (uint8 i = 0; i < adapterInfo.length; i++) {
            IYBNFT.Adapter memory adapter = adapterInfo[i];
            UserAdapterInfo storage userAdapter = userAdapterInfos[msg.sender][
                _tokenId
            ][adapter.addr];

            if(IAdapter(adapter.addr).noDeposit()) {
                balanceDiff = IAdapter(adapter.addr).getWithdrawalAmount(msg.sender, _tokenId);
                IAdapter(adapter.addr).setWithdrawalAmount(msg.sender, _tokenId, 0);
            } else {
                balances[0] = adapter.token == wmatic
                    ? address(this).balance
                    : IBEP20(adapter.token).balanceOf(address(this));

                _withdrawFromAdapter(
                    adapter.addr,
                    _tokenId,
                    IAdapter(adapter.addr).getWithdrawalAmount(msg.sender, _tokenId)
                );

                balances[1] = adapter.token == wmatic
                    ? address(this).balance
                    : IBEP20(adapter.token).balanceOf(address(this));

                unchecked {
                    balanceDiff = balances[1] - balances[0];
                }
            }

            if (IAdapter(adapter.addr).router() == address(0)) {
                if (adapter.token == wmatic) {
                    unchecked {
                        amountOut += balanceDiff;
                    }
                } else {
                    // swap
                    amountOut += _swapforMATIC(
                        adapter.addr,
                        balanceDiff,
                        adapter.token,
                        swapRouter
                    );
                }
            } else {
                uint256 taxAmount;
                amountOut += _withdrawLP(
                    adapter.addr,
                    adapter.token,
                    IAdapter(adapter.addr).router(),
                    balanceDiff,
                    _tokenId
                );

                if (IAdapter(adapter.addr).rewardToken() != address(0)) {
                    // Convert rewards to MATIC
                    (uint256 rewards, uint256 rewards1) = _getRewards(
                        _tokenId,
                        msg.sender,
                        adapter.addr
                    );
                    if (
                        rewards >
                        IBEP20(IAdapter(adapter.addr).rewardToken()).balanceOf(
                            address(this)
                        )
                    )
                        rewards = IBEP20(IAdapter(adapter.addr).rewardToken())
                            .balanceOf(address(this));

                    userAdapter.userShares = 0;

                    taxAmount =
                        (rewards * IYBNFT(ybnft).performanceFee(_tokenId)) /
                        1e4;

                    if (taxAmount != 0) {
                        IBEP20(IAdapter(adapter.addr).rewardToken()).transfer(
                            treasuryAddr,
                            taxAmount
                        );
                    }

                    if (rewards != 0) {
                        amountOut += _swapforMATIC(
                            adapter.addr,
                            rewards - taxAmount,
                            IAdapter(adapter.addr).rewardToken(),
                            swapRouter
                        );
                    }

                    userAdapter.userShares1 = 0;

                    if(rewards1 != 0) {
                        taxAmount =
                            (rewards1 * IYBNFT(ybnft).performanceFee(_tokenId)) /
                            1e4;

                        if (taxAmount != 0) {
                            IBEP20(IAdapter(adapter.addr).rewardToken1()).transfer(
                                treasuryAddr,
                                taxAmount
                            );
                        }

                        if (rewards != 0) {
                            amountOut += _swapforMATIC(
                                adapter.addr,
                                rewards1 - taxAmount,
                                IAdapter(adapter.addr).rewardToken1(),
                                swapRouter
                            );
                        }
                    }
                }
            }

            adapterInfos[_tokenId][adapter.addr]
                .totalStaked -= userAdapterInfos[_user][_tokenId][adapter.addr]
                .amount;
            userAdapterInfos[_user][_tokenId][adapter.addr].amount = 0;
        }

        if (nftInfo[ybnft][_tokenId].tvl < userAmount)
            nftInfo[ybnft][_tokenId].tvl = 0;
        else nftInfo[ybnft][_tokenId].tvl -= userAmount;

        if (nftInfo[ybnft][_tokenId].totalParticipant > 0)
            nftInfo[ybnft][_tokenId].totalParticipant--;

        userInfo[_user][ybnft][_tokenId] -= userAmount;

        if (amountOut != 0) {
            (bool success, ) = payable(_user).call{value: amountOut}("");
            require(success, "Error: Failed to send MATIC");
        }
        emit WithdrawMATIC(_user, ybnft, _tokenId, userAmount);
    }

    /**
     * @notice Claim
     * @param _tokenId  YBNft token id
     */
    function claim(uint256 _tokenId) external nonReentrant {
        require(
            IYBNFT(ybnft).exists(_tokenId),
            "Error: nft tokenId is invalid"
        );
        uint256 userAmount = userInfo[msg.sender][ybnft][_tokenId];
        require(userAmount != 0, "Error: Amount should be greater than 0");

        IYBNFT.Adapter[] memory adapterInfo = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );

        uint256 amountOut;
        for (uint8 i = 0; i < adapterInfo.length; i++) {
            IYBNFT.Adapter memory adapter = adapterInfo[i];
            UserAdapterInfo storage userAdapter = userAdapterInfos[msg.sender][
                _tokenId
            ][adapter.addr];

            (uint256 rewards, uint256 rewards1) = _getRewards(_tokenId, msg.sender, adapter.addr);
            userAdapter.userShares = adapterInfos[_tokenId][adapter.addr]
                .accTokenPerShare;
            userAdapter.userShares1 = adapterInfos[_tokenId][adapter.addr]
                .accTokenPerShare1;

            if (rewards != 0) {
                amountOut += _swapforMATIC(
                    adapter.addr,
                    rewards,
                    IAdapter(adapter.addr).rewardToken(),
                    swapRouter
                );
            }

            if (rewards1 != 0) {
                amountOut += _swapforMATIC(
                    adapter.addr,
                    rewards1,
                    IAdapter(adapter.addr).rewardToken1(),
                    swapRouter
                );
            }
        }

        if (amountOut != 0) {
            uint256 taxAmount = (amountOut *
                IYBNFT(ybnft).performanceFee(_tokenId)) / 1e4;
            (bool success, ) = payable(treasuryAddr).call{value: taxAmount}("");
            require(success, "Error: Failed to send MATIC to Treasury");

            (success, ) = payable(msg.sender).call{
                value: amountOut - taxAmount
            }("");
            require(success, "Error: Failed to send MATIC");
            emit Claimed(msg.sender, amountOut);
        }
    }

    /**
     * @notice Set strategy manager contract
     * @param _adapterManager  nft address
     */
    /// #if_succeeds {:msg "Adapter manager not set"} adapterManager == _adapterManager;
    function setAdapterManager(address _adapterManager) external onlyOwner {
        require(_adapterManager != address(0), "Error: Invalid NFT address");

        adapterManager = _adapterManager;

        emit AdapterManagerChanged(msg.sender, _adapterManager);
    }

    /**
     * @notice deposit fund to adapter
     * @param _adapterAddr  adapter address
     * @param _amount  token amount
     */
    function _depositToAdapter(
        address _token,
        address _adapterAddr,
        uint256 _tokenId,
        uint256 _amount
    ) internal {
        uint256[2] memory amounts;
        address[3] memory addrs;
        addrs[0] = IAdapter(_adapterAddr).stakingToken();
        addrs[1] = IAdapter(_adapterAddr).repayToken();
        addrs[2] = IAdapter(_adapterAddr).rewardToken();
        bool isReward = IAdapter(_adapterAddr).isReward();

        amounts[0] = addrs[1] != address(0)
            ? IBEP20(addrs[1]).balanceOf(address(this))
            : (
                isReward ? IAdapter(_adapterAddr).pendingShares() :
                    addrs[2] != address(0)
                        ? IBEP20(addrs[2]).balanceOf(address(this))
                        : 0
            );

        IBEP20(_token).approve(
            IAdapterManager(adapterManager).getAdapterStrat(_adapterAddr),
            _amount
        );

        (address to, uint256 value, bytes memory callData) = IAdapterManager(
            adapterManager
        ).getDepositCallData(_adapterAddr, _amount);

        (bool success,) = to.call{value: value}(callData);
        require(success, "Error: Deposit internal issue");

        amounts[1] = addrs[1] != address(0)
            ? IBEP20(addrs[1]).balanceOf(address(this))
            : (
                isReward ? IAdapter(_adapterAddr).pendingShares() :
                    addrs[2] != address(0)
                        ? IBEP20(addrs[2]).balanceOf(address(this))
                        : 0
            );

        
        if (addrs[1] != address(0)) {
            require(amounts[1] > amounts[0], "Error: Deposit failed");
            IAdapter(_adapterAddr).increaseWithdrawalAmount(
                msg.sender,
                _tokenId,
                amounts[1] - amounts[0]
            );
        } else if (isReward) {
            require(amounts[1] > amounts[0], "Error: Deposit failed");

            userAdapterInfos[msg.sender][_tokenId][_adapterAddr]
                .userShares += amounts[1] - amounts[0];
            userAdapterInfos[msg.sender][_tokenId][_adapterAddr]
                .userShares1 += amounts[1] - amounts[0];

            IAdapter(_adapterAddr).increaseWithdrawalAmount(
                msg.sender,
                _tokenId,
                amounts[1] - amounts[0]
            );
        } else if (addrs[2] != address(0)) {
            // Farm Pool
            AdapterInfo storage adapter = adapterInfos[_tokenId][
                _adapterAddr
            ];
            uint256 rewardAmount = addrs[2] == addrs[0]
                ? amounts[1] + _amount - amounts[0]
                : amounts[1] - amounts[0];

            if (rewardAmount != 0 && adapter.totalStaked != 0) {
                adapter.accTokenPerShare +=
                    (rewardAmount * 1e12) /
                    adapter.totalStaked;
                adapter.accTokenPerShare1 +=
                    (rewardAmount * 1e12) /
                    adapter.totalStaked;
            }

            if (
                userAdapterInfos[msg.sender][_tokenId][_adapterAddr]
                    .amount == 0
            ) {
                userAdapterInfos[msg.sender][_tokenId][_adapterAddr]
                    .userShares = adapterInfos[_tokenId][_adapterAddr]
                    .accTokenPerShare;
                userAdapterInfos[msg.sender][_tokenId][_adapterAddr]
                    .userShares1 = adapterInfos[_tokenId][_adapterAddr]
                    .accTokenPerShare1;
            }

            IAdapter(_adapterAddr).increaseWithdrawalAmount(
                msg.sender,
                _tokenId,
                _amount
            );
        } else {
            IAdapter(_adapterAddr).increaseWithdrawalAmount(
                msg.sender,
                _tokenId,
                _amount
            );
        }
    }

    /**
     * @notice Withdraw fund from adapter
     * @param _adapterAddr  adapter address
     * @param _amount  token amount
     */
    function _withdrawFromAdapter(
        address _adapterAddr,
        uint256 _tokenId,
        uint256 _amount
    ) internal {
        address stakingToken = IAdapter(_adapterAddr).stakingToken();
        address rewardToken = IAdapter(_adapterAddr).rewardToken();
        address rewardToken1 = IAdapter(_adapterAddr).rewardToken1();
        bool isReward = IAdapter(_adapterAddr).isReward();
        uint256[4] memory rewardTokenAmount;

        rewardTokenAmount[0] = rewardToken != address(0)
            ? IBEP20(rewardToken).balanceOf(address(this))
            : 0;
        rewardTokenAmount[2] = rewardToken1 != address(0)
            ? IBEP20(rewardToken1).balanceOf(address(this))
            : 0;

        (
            address to,
            uint256 value,
            bytes memory callData
        ) = IAdapterManager(adapterManager).getWithdrawCallData(
                _adapterAddr,
                _amount
            );

        (bool success, ) = to.call{value: value}(callData);
        require(success, "Error: Withdraw internal issue");

        if(isReward) {
            (to, value, callData) = IAdapterManager(adapterManager).getRewardCallData(_adapterAddr);
            (success, ) = to.call{value: value}(callData);
            require(success, "Error: getReward internal issue");
        }

        rewardTokenAmount[1] = rewardToken != address(0)
            ? IBEP20(rewardToken).balanceOf(address(this))
            : 0;
        rewardTokenAmount[3] = rewardToken1 != address(0)
            ? IBEP20(rewardToken1).balanceOf(address(this))
            : 0;

        if (rewardToken == stakingToken) rewardTokenAmount[1] += _amount;
        if (rewardToken1 == stakingToken) rewardTokenAmount[3] += _amount;
        if (
            rewardToken != address(0) && rewardToken != stakingToken
        ) {
            AdapterInfo storage adapter = adapterInfos[_tokenId][
                _adapterAddr
            ];

            if (rewardTokenAmount[1] - rewardTokenAmount[0] != 0 &&
                adapter.accTokenPerShare != 0
            ) {
                adapter.accTokenPerShare +=
                    ((rewardTokenAmount[1] - rewardTokenAmount[0]) * 1e12) /
                    adapter.totalStaked;
            }

            if(rewardToken1 != address(0) && 
                rewardTokenAmount[3] - rewardTokenAmount[2] != 0 &&
                adapter.accTokenPerShare1 != 0
            ) {
                adapter.accTokenPerShare1 +=
                    ((rewardTokenAmount[3] - rewardTokenAmount[2]) * 1e12) /
                    adapter.totalStaked;
            }
        }

        // update storage data on adapter
        IAdapter(_adapterAddr).setWithdrawalAmount(msg.sender, _tokenId, 0);
    }

    /**
     * @notice Get path via pancakeswap router from inToken and outToken
     * @param _adapter  address of adapter
     * @param _inToken  address of inToken
     * @param _outToken  address of outToken
     */
    function _getPaths(
        address _adapter,
        address _inToken,
        address _outToken
    ) internal view returns (address[] memory path) {
        return IAdapter(_adapter).getPaths(_inToken, _outToken);
    }

    /**
     * @notice Swap token via pancakeswap router
     * @param _adapter  address of adapter
     * @param _amountIn  amount of inToken
     * @param _inToken  address of inToken
     * @param _outToken  address of outToken
     */
    function _swapOnPKS(
        address _adapter,
        uint256 _amountIn,
        address _inToken,
        address _outToken
    ) internal returns (uint256 amountOut) {
        IBEP20(_inToken).approve(swapRouter, _amountIn);
        address[] memory path = _getPaths(_adapter, _inToken, _outToken);
        uint256[] memory amounts = IPancakeRouter(swapRouter)
            .swapExactTokensForTokens(
                _amountIn,
                0,
                path,
                address(this),
                block.timestamp + 2 hours
            );

        amountOut = amounts[amounts.length - 1];
    }

    /**
     * @notice Swap MATIC to _outToken via router
     * @param _adapter  address of adapter
     * @param _amountIn  amount of inToken
     * @param _outToken  address of outToken
     * @param _router  address of router
     */
    function _swapOnRouterMATIC(
        address _adapter,
        uint256 _amountIn,
        address _outToken,
        address _router
    ) internal returns (uint256 amountOut) {
        address[] memory path = _getPaths(_adapter, wmatic, _outToken);
        uint256 beforeBalance = IBEP20(_outToken).balanceOf(address(this));

        IPancakeRouter(_router)
            .swapExactETHForTokensSupportingFeeOnTransferTokens{
            value: _amountIn
        }(0, path, address(this), block.timestamp + 2 hours);

        uint256 afterBalance = IBEP20(_outToken).balanceOf(address(this));
        amountOut = afterBalance - beforeBalance;
    }

    /**
     * @notice Swap tokens to MATIC
     * @param _adapter  address of adapter
     * @param _amountIn  amount of inToken
     * @param _inToken  address of inToken
     * @param _router  address of swap router
     */
    function _swapforMATIC(
        address _adapter,
        uint256 _amountIn,
        address _inToken,
        address _router
    ) internal returns (uint256 amountOut) {
        address[] memory path = _getPaths(_adapter, _inToken, wmatic);
        uint256 beforeBalance = address(this).balance;

        IBEP20(_inToken).approve(address(_router), _amountIn);

        IPancakeRouter(_router)
            .swapExactTokensForETHSupportingFeeOnTransferTokens(
                _amountIn,
                0,
                path,
                address(this),
                block.timestamp + 2 hours
            );

        uint256 afterBalance = address(this).balance;
        amountOut = afterBalance - beforeBalance;
    }

    /**
     * @notice GET LP using MATIC
     * @param _adapter  address of adapter
     * @param _pairToken  address of pairToken
     * @param _router  address of router
     * @param _amountIn  amount of inToken
     * @param _tokenId  uint256 of tokenId
     */
    function _getLP(
        address _adapter,
        address _pairToken,
        address _router,
        uint256 _amountIn,
        uint256 _tokenId
    ) internal returns (uint256 amountOut) {
        address token0 = IPancakePair(_pairToken).token0();
        address token1 = IPancakePair(_pairToken).token1();

        uint256 token0Amount = _amountIn / 2;
        uint256 token1Amount = _amountIn / 2;
        if (token0 != wmatic) {
            token0Amount = _swapOnRouterMATIC(
                _adapter,
                token0Amount,
                token0,
                _router
            );
            IBEP20(token0).approve(_router, token0Amount);
        }

        if (token1 != wmatic) {
            token1Amount = _swapOnRouterMATIC(
                _adapter,
                token1Amount,
                token1,
                _router
            );
            IBEP20(token1).approve(_router, token1Amount);
        }

        if(IAdapter(_adapter).noDeposit()) {
            // wrap to wmatic
            if(token0 == wmatic) {
                IWrap(wmatic).deposit(token0Amount);
                IBEP20(wmatic).approve(_router, token0Amount);
            }

            if(token1 == wmatic) {
                IWrap(wmatic).deposit(token1Amount);
            }

            uint256 tokenId = IAdapter(_adapter).getLiquidityToken(msg.sender, _tokenId);
            address _strategy = IAdapter(_adapter).strategy();
            if(tokenId != 0) {
                INonfungiblePositionManager.IncreaseLiquidityParams memory params = 
                    INonfungiblePositionManager.IncreaseLiquidityParams({
                        tokenId: tokenId,
                        amount0Desired: token0Amount,
                        amount1Desired: token1Amount,
                        amount0Min: 0,
                        amount1Min: 0,
                        deadline: block.timestamp + 2 hours
                    });

                (amountOut, , ) = INonfungiblePositionManager(_strategy).increaseLiquidity(params);
            } else {
                INonfungiblePositionManager.MintParams memory params =
                    INonfungiblePositionManager.MintParams({
                        token0: token0,
                        token1: token1,
                        fee: 3000,
                        tickLower: TickMath.MIN_TICK,
                        tickUpper: TickMath.MAX_TICK,
                        amount0Desired: token0Amount,
                        amount1Desired: token1Amount,
                        amount0Min: 0,
                        amount1Min: 0,
                        recipient: address(this),
                        deadline: block.timestamp + 2 hours
                    });

                (tokenId, amountOut, , ) = INonfungiblePositionManager(_strategy).mint(params);
                IAdapter(_adapter).setLiquidityToken(msg.sender, _tokenId, tokenId);
            }
        } else {
            if (token0Amount != 0 && token1Amount != 0) {
                if (token0 == wmatic || token1 == wmatic) {
                    (, , amountOut) = IPancakeRouter(_router).addLiquidityETH{
                        value: token0 == wmatic ? token0Amount : token1Amount
                    }(
                        token0 == wmatic ? token1 : token0,
                        token0 == wmatic ? token1Amount : token0Amount,
                        0,
                        0,
                        address(this),
                        block.timestamp + 2 hours
                    );
                } else {
                    (, , amountOut) = IPancakeRouter(_router).addLiquidity(
                        token0,
                        token1,
                        token0Amount,
                        token1Amount,
                        0,
                        0,
                        address(this),
                        block.timestamp + 2 hours
                    );
                }
            }
        }
    }

    /**
     * @notice Withdraw LP then swap pair tokens to MATIC
     * @param _adapter  address of adapter
     * @param _pairToken  address of pairToken
     * @param _router  address of router
     * @param _amountIn  amount of inToken
     * @param _router  tokenId
     */
    function _withdrawLP(
        address _adapter,
        address _pairToken,
        address _router,
        uint256 _amountIn,
        uint256 _tokenId
    ) internal returns (uint256 amountOut) {
        address token0 = IPancakePair(_pairToken).token0();
        address token1 = IPancakePair(_pairToken).token1();

        if(IAdapter(_adapter).noDeposit()) {
            uint256 tokenId = IAdapter(_adapter).getLiquidityToken(msg.sender, _tokenId);
            require(tokenId != 0, "Invalid request");

            INonfungiblePositionManager.DecreaseLiquidityParams memory params =
                INonfungiblePositionManager.DecreaseLiquidityParams({
                    tokenId: tokenId,
                    liquidity: uint128(_amountIn),
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp + 2 hours
                });

            (uint256 amount0, uint256 amount1) = INonfungiblePositionManager(IAdapter(_adapter).strategy()).decreaseLiquidity(params);
            if(token0 == wmatic) {
                IWrap(token0).withdraw(amount0);
                amountOut += amount0;
            } else {
                amountOut += _swapforMATIC(_adapter, amount0, token0, _router);
            }

            if(token1 == wmatic) {
                IWrap(token1).withdraw(amount1);
                amountOut += amount1;
            } else {
                amountOut += _swapforMATIC(_adapter, amount1, token1, _router);
            }
        } else {
            IBEP20(_pairToken).approve(_router, _amountIn);

            if (token0 == wmatic || token1 == wmatic) {
                address tokenAddr = token0 == wmatic ? token1 : token0;
                (uint256 amountToken, uint256 amountETH) = IPancakeRouter(_router)
                    .removeLiquidityETH(
                        tokenAddr,
                        _amountIn,
                        0,
                        0,
                        address(this),
                        block.timestamp + 2 hours
                    );

                amountOut = amountETH;
                amountOut += _swapforMATIC(_adapter, amountToken, tokenAddr, _router);
            } else {
                (uint256 amountA, uint256 amountB) = IPancakeRouter(_router)
                    .removeLiquidity(
                        token0,
                        token1,
                        _amountIn,
                        0,
                        0,
                        address(this),
                        block.timestamp + 2 hours
                    );

                amountOut += _swapforMATIC(_adapter, amountA, token0, _router);
                amountOut += _swapforMATIC(_adapter, amountB, token1, _router);
            }
        }
    }

    /**
     * @notice Get current rewards amount in MATIC
     * @param _account user account address
     * @param _tokenId NFT token id
     */
    function pendingReward(address _account, uint256 _tokenId)
        public
        view
        returns (uint256)
    {
        IYBNFT.Adapter[] memory ybnftAapters = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );

        uint256 rewards;

        for (uint8 i = 0; i < ybnftAapters.length; i++) {
            IYBNFT.Adapter memory adapter = ybnftAapters[i];
            AdapterInfo memory adapterInfo = adapterInfos[_tokenId][
                adapter.addr
            ];
            UserAdapterInfo memory userAdapterInfo = userAdapterInfos[
                _account
            ][_tokenId][adapter.addr];

            if (
                IAdapter(adapter.addr).rewardToken() != address(0) &&
                adapterInfo.totalStaked != 0 &&
                adapterInfo.accTokenPerShare != 0
            ) {
                uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
                    ((IAdapter(adapter.addr).pendingReward() * 1e12) /
                        adapterInfo.totalStaked);

                uint256 tokenRewards = ((updatedAccTokenPerShare -
                    userAdapterInfo.userShares) * userAdapterInfo.amount) /
                    1e12;

                rewards += IPancakeRouter(swapRouter).getAmountsOut(
                    tokenRewards,
                    _getPaths(
                        adapter.addr,
                        IAdapter(adapter.addr).rewardToken(),
                        wmatic
                    )
                )[1];
            } else if(IAdapter(adapter.addr).isReward()) {
                uint256 updatedAccTokenPerShare = 
                    ((IAdapter(adapter.addr).pendingReward() * 1e12) /
                        adapterInfo.totalStaked);

                uint256 tokenRewards = ((updatedAccTokenPerShare -
                    userAdapterInfo.userShares) * userAdapterInfo.amount) /
                    1e12;

                if (IAdapter(adapter.addr).router() == address(0)) {
                    rewards += tokenRewards == 0 ? 0 : IPancakeRouter(swapRouter).getAmountsOut(
                        tokenRewards,
                        _getPaths(
                            adapter.addr,
                            IAdapter(adapter.addr).rewardToken(),
                            wmatic
                        )
                    )[1];
                } else {
                    address pairToken = IAdapter(adapter.addr).stakingToken();
                    address token0 = IPancakePair(pairToken).token0();
                    address token1 = IPancakePair(pairToken).token1();
                    (uint112 reserve0, uint112 reserve1, ) = IPancakePair(
                        pairToken
                    ).getReserves();

                    uint256 amount0 = (reserve0 * tokenRewards) /
                        IPancakePair(pairToken).totalSupply();
                    uint256 amount1 = (reserve1 * tokenRewards) /
                        IPancakePair(pairToken).totalSupply();

                    if (token0 == wmatic) rewards += reserve0;
                    else
                        rewards += IPancakeRouter(swapRouter).getAmountsOut(
                            amount0,
                            _getPaths(adapter.addr, token0, wmatic)
                        )[1];

                    if (token0 == wmatic) rewards += reserve1;
                    else
                        rewards += IPancakeRouter(swapRouter).getAmountsOut(
                            amount1,
                            _getPaths(adapter.addr, token1, wmatic)
                        )[1];
                }

                if(IAdapter(adapter.addr).rewardToken1() != address(0)) {
                    updatedAccTokenPerShare = adapterInfo.accTokenPerShare1 +
                        ((IAdapter(adapter.addr).pendingReward1() * 1e12) /
                            adapterInfo.totalStaked);

                    tokenRewards = ((updatedAccTokenPerShare -
                        userAdapterInfo.userShares1) * userAdapterInfo.amount) /
                        1e12;

                    rewards += tokenRewards == 0 ? 0 : IPancakeRouter(swapRouter).getAmountsOut(
                        tokenRewards,
                        _getPaths(
                            adapter.addr,
                            IAdapter(adapter.addr).rewardToken1(),
                            wmatic
                        )
                    )[1];
                }
            }
        }

        return rewards;
    }

    /**
     * @notice Get current rewards amount
     * @param _adapterAddr  address of Adapter
     * @param _account user account address
     */
    function _getRewards(
        uint256 _tokenId,
        address _account,
        address _adapterAddr
    ) internal view returns (uint256 _reward, uint256 _reward1) {
        AdapterInfo memory adapter = adapterInfos[_tokenId][_adapterAddr];
        UserAdapterInfo memory userAdapterInfo = userAdapterInfos[_account][
            _tokenId
        ][_adapterAddr];

        if (
            IAdapter(_adapterAddr).rewardToken() != address(0) &&
            adapter.totalStaked != 0 &&
            adapter.accTokenPerShare != 0
        ) {
            _reward = ((adapter.accTokenPerShare - userAdapterInfo.userShares) *
                userAdapterInfo.amount) / 1e12;
            _reward1 = ((adapter.accTokenPerShare1 - userAdapterInfo.userShares1) *
                userAdapterInfo.amount) / 1e12;
        }
    }

    receive() external payable {}

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external override pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
