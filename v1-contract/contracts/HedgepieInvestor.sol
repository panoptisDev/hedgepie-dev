// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./libraries/HedgepieLibrary.sol";

contract HedgepieInvestor is Ownable, ReentrancyGuard {
    using SafeBEP20 for IBEP20;

    struct UserAdapterInfo {
        uint256 amount;
        uint256 userShares;
    }

    struct AdapterInfo {
        uint256 accTokenPerShare;
        uint256 totalStaked;
    }

    struct NFTInfo {
        uint256 tvl;
        uint256 totalParticipant;
    }

    // ybnft => nft id => NFTInfo
    mapping(address => mapping(uint256 => NFTInfo)) public nftInfo;

    // user => ybnft => nft id => amount(Invested WBNB)
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

    // wrapped bnb address
    address public wbnb;

    // strategy manager
    address public adapterManager;

    address public treasuryAddr;

    event DepositBNB(
        address indexed user,
        address nft,
        uint256 nftId,
        uint256 amount
    );
    event WithdrawBNB(
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
     * @param _wbnb  address of Wrapped BNB address
     */
    constructor(
        address _ybnft,
        address _swapRouter,
        address _wbnb
    ) {
        require(_ybnft != address(0), "Error: YBNFT address missing");
        require(_swapRouter != address(0), "Error: swap router missing");
        require(_wbnb != address(0), "Error: WBNB missing");

        ybnft = _ybnft;
        swapRouter = _swapRouter;
        wbnb = _wbnb;
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
     * @notice Deposit with BNB
     * @param _user  user address
     * @param _tokenId  YBNft token id
     * @param _amount  BNB amount
     */
    /// #if_succeeds {:msg "userInfo not increased"} userInfo[_user][ybnft][_tokenId] > old(userInfo[_user][ybnft][_tokenId]);
    function depositBNB(
        address _user,
        uint256 _tokenId,
        uint256 _amount
    ) external payable nonReentrant {
        require(_amount != 0, "Error: Amount can not be 0");
        require(msg.value == _amount, "Error: Insufficient BNB");
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
            if (IAdapter(adapter.addr).router() == address(0)) {
                if (adapter.token == wbnb) {
                    amountOut = amountIn;
                } else {
                    address wrapToken = IAdapter(adapter.addr).wrapToken();
                    if (wrapToken == address(0)) {
                        // swap
                        amountOut = HedgepieLibrary.swapOnRouter(
                            adapter.addr,
                            amountIn,
                            adapter.token,
                            swapRouter,
                            wbnb
                        );
                    } else {
                        // swap
                        amountOut = HedgepieLibrary.swapOnRouter(
                            adapter.addr,
                            amountIn,
                            wrapToken,
                            swapRouter,
                            wbnb
                        );

                        // wrap
                        uint256 beforeWrap = IBEP20(adapter.token).balanceOf(
                            address(this)
                        );
                        IBEP20(wrapToken).approve(adapter.token, amountOut);
                        IWrap(adapter.token).deposit(amountOut);
                        unchecked {
                            amountOut =
                                IBEP20(adapter.token).balanceOf(address(this)) -
                                beforeWrap;
                        }
                    }
                }
            } else {
                // get lp
                amountOut = HedgepieLibrary.getLP(adapter, wbnb, amountIn);
            }

            // deposit to adapter
            UserAdapterInfo storage _userAdapterInfo = userAdapterInfos[
                msg.sender
            ][_tokenId][adapter.addr];

            AdapterInfo storage _adapterInfo = adapterInfos[_tokenId][
                adapter.addr
            ];

            HedgepieLibrary.depositToAdapter(
                adapterManager,
                adapter.token,
                adapter.addr,
                _tokenId,
                amountOut,
                msg.sender,
                _userAdapterInfo,
                _adapterInfo
            );

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
            require(success, "Error: Failed to send remained BNB");
        }

        emit DepositBNB(_user, ybnft, _tokenId, _amount);
    }

    /**
     * @notice Withdraw by BNB
     * @param _user  user address
     * @param _tokenId  YBNft token id
     */
    /// #if_succeeds {:msg "userInfo not decreased"} userInfo[_user][ybnft][_tokenId] < old(userInfo[_user][ybnft][_tokenId]);
    function withdrawBNB(address _user, uint256 _tokenId)
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
        uint256[2] memory balances;

        for (uint8 i = 0; i < adapterInfo.length; i++) {
            IYBNFT.Adapter memory adapter = adapterInfo[i];
            balances[0] = adapter.token == wbnb
                ? address(this).balance
                : IBEP20(adapter.token).balanceOf(address(this));

            UserAdapterInfo storage userAdapter = userAdapterInfos[msg.sender][
                _tokenId
            ][adapter.addr];

            _withdrawFromAdapter(
                adapter.addr,
                _tokenId,
                IAdapter(adapter.addr).getWithdrawalAmount(msg.sender, _tokenId)
            );

            balances[1] = adapter.token == wbnb
                ? address(this).balance
                : IBEP20(adapter.token).balanceOf(address(this));

            if (IAdapter(adapter.addr).router() == address(0)) {
                if (adapter.token == wbnb) {
                    unchecked {
                        amountOut += balances[1] - balances[0];
                    }
                } else {
                    address wrapToken = IAdapter(adapter.addr).wrapToken();
                    if (wrapToken == address(0)) {
                        // swap
                        amountOut += HedgepieLibrary.swapforBNB(
                            adapter.addr,
                            balances[1] - balances[0],
                            adapter.token,
                            swapRouter,
                            wbnb
                        );
                    } else {
                        // unwrap
                        uint256 beforeUnwrap = IBEP20(wrapToken).balanceOf(
                            address(this)
                        );
                        IWrap(adapter.token).withdraw(
                            balances[1] - balances[0]
                        );
                        unchecked {
                            beforeUnwrap =
                                IBEP20(wrapToken).balanceOf(address(this)) -
                                beforeUnwrap;
                        }

                        // swap
                        amountOut += HedgepieLibrary.swapforBNB(
                            adapter.addr,
                            beforeUnwrap,
                            wrapToken,
                            swapRouter,
                            wbnb
                        );
                    }
                }
            } else {
                uint256 taxAmount;
                // withdraw lp and get BNB
                if (IAdapter(adapter.addr).isVault()) {
                    // Get fee to BNB
                    uint256 _vAmount = (userAdapter.userShares *
                        IVaultStrategy(IAdapter(adapter.addr).vStrategy())
                            .wantLockedTotal()) /
                        IVaultStrategy(IAdapter(adapter.addr).vStrategy())
                            .sharesTotal();

                    if (
                        _vAmount >
                        IAdapter(adapter.addr).getWithdrawalAmount(
                            msg.sender,
                            _tokenId
                        )
                    ) {
                        taxAmount =
                            ((_vAmount -
                                IAdapter(adapter.addr).getWithdrawalAmount(
                                    _user,
                                    _tokenId
                                )) * IYBNFT(ybnft).performanceFee(_tokenId)) /
                            1e4;

                        if (taxAmount != 0) {
                            IBEP20(adapter.token).transfer(
                                treasuryAddr,
                                taxAmount
                            );
                        }
                    }

                    userAdapter.userShares = 0;
                }

                amountOut += HedgepieLibrary.withdrawLP(
                    adapter,
                    wbnb,
                    balances[1] - balances[0] - taxAmount
                );

                if (IAdapter(adapter.addr).rewardToken() != address(0)) {
                    // Convert rewards to BNB
                    uint256 rewards = HedgepieLibrary.getRewards(
                        adapterInfos[_tokenId][adapter.addr],
                        userAdapterInfos[msg.sender][_tokenId][adapter.addr],
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
                        amountOut += HedgepieLibrary.swapforBNB(
                            adapter.addr,
                            rewards - taxAmount,
                            IAdapter(adapter.addr).rewardToken(),
                            swapRouter,
                            wbnb
                        );
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
            require(success, "Error: Failed to send BNB");
        }
        emit WithdrawBNB(_user, ybnft, _tokenId, userAmount);
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
        require(
            userInfo[msg.sender][ybnft][_tokenId] != 0,
            "Error: Amount should be greater than 0"
        );

        IYBNFT.Adapter[] memory adapterInfo = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );

        uint256 amountOut;
        for (uint8 i = 0; i < adapterInfo.length; i++) {
            IYBNFT.Adapter memory adapter = adapterInfo[i];
            UserAdapterInfo storage userAdapter = userAdapterInfos[msg.sender][
                _tokenId
            ][adapter.addr];

            uint256 rewards = HedgepieLibrary.getRewards(
                adapterInfos[_tokenId][adapter.addr],
                userAdapterInfos[msg.sender][_tokenId][adapter.addr],
                adapter.addr
            );
            userAdapter.userShares = adapterInfos[_tokenId][adapter.addr]
                .accTokenPerShare;

            if (rewards != 0) {
                amountOut += HedgepieLibrary.swapforBNB(
                    adapter.addr,
                    rewards,
                    IAdapter(adapter.addr).rewardToken(),
                    swapRouter,
                    wbnb
                );
            }
        }

        if (amountOut != 0) {
            uint256 taxAmount = (amountOut *
                IYBNFT(ybnft).performanceFee(_tokenId)) / 1e4;
            (bool success, ) = payable(treasuryAddr).call{value: taxAmount}("");
            require(success, "Error: Failed to send BNB to Treasury");

            (success, ) = payable(msg.sender).call{
                value: amountOut - taxAmount
            }("");
            require(success, "Error: Failed to send BNB");
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
     * @notice Withdraw fund from adapter
     * @param _adapterAddr  adapter address
     * @param _amount  token amount
     */
    function _withdrawFromAdapter(
        address _adapterAddr,
        uint256 _tokenId,
        uint256 _amount
    ) internal {
        address vStrategy = IAdapter(_adapterAddr).vStrategy();
        address stakingToken = IAdapter(_adapterAddr).stakingToken();
        address rewardToken = IAdapter(_adapterAddr).rewardToken();
        uint256[2] memory rewardTokenAmount;
        UserAdapterInfo memory userAdapter = userAdapterInfos[msg.sender][
            _tokenId
        ][_adapterAddr];

        rewardTokenAmount[0] = rewardToken != address(0)
            ? IBEP20(rewardToken).balanceOf(address(this))
            : 0;

        // Vault case - recalculate want token withdrawal amount for user
        uint256 _vAmount;
        if (IAdapter(_adapterAddr).isVault()) {
            _vAmount =
                (userAdapter.userShares *
                    IVaultStrategy(vStrategy).wantLockedTotal()) /
                IVaultStrategy(vStrategy).sharesTotal();
        }

        if (IAdapter(_adapterAddr).isLeverage()) {
            HedgepieLibrary.repayAsset(
                adapterManager,
                _adapterAddr,
                _tokenId,
                msg.sender
            );
        } else {
            (
                address to,
                uint256 value,
                bytes memory callData
            ) = IAdapterManager(adapterManager).getWithdrawCallData(
                    _adapterAddr,
                    _vAmount == 0 ? _amount : _vAmount
                );

            (bool success, ) = to.call{value: value}(callData);
            require(success, "Error: Withdraw internal issue");
        }

        rewardTokenAmount[1] = rewardToken != address(0)
            ? IBEP20(rewardToken).balanceOf(address(this))
            : 0;

        if (rewardToken == stakingToken) rewardTokenAmount[1] += _amount;
        if (
            (rewardToken != address(0) && rewardToken != stakingToken) ||
            vStrategy == address(0)
        ) {
            if (rewardTokenAmount[1] - rewardTokenAmount[0] != 0) {
                AdapterInfo storage adapter = adapterInfos[_tokenId][
                    _adapterAddr
                ];

                if (adapter.accTokenPerShare != 0)
                    adapter.accTokenPerShare +=
                        ((rewardTokenAmount[1] - rewardTokenAmount[0]) * 1e12) /
                        adapter.totalStaked;
            }
        }

        // update storage data on adapter
        IAdapter(_adapterAddr).setWithdrawalAmount(msg.sender, _tokenId, 0);
    }

    /**
     * @notice Get current rewards amount in BNB
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
            UserAdapterInfo memory userAdapter = userAdapterInfos[_account][
                _tokenId
            ][adapter.addr];
            AdapterInfo memory adapterInfo = adapterInfos[_tokenId][
                adapter.addr
            ];

            if (
                IAdapter(adapter.addr).rewardToken() != address(0) &&
                adapterInfo.totalStaked != 0 &&
                adapterInfo.accTokenPerShare != 0
            ) {
                uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
                    ((IAdapter(adapter.addr).getReward(address(this)) * 1e12) /
                        adapterInfo.totalStaked);

                uint256 tokenRewards = ((updatedAccTokenPerShare -
                    userAdapter.userShares) * userAdapter.amount) / 1e12;

                if (tokenRewards != 0)
                    rewards += IPancakeRouter(swapRouter).getAmountsOut(
                        tokenRewards,
                        HedgepieLibrary.getPaths(
                            adapter.addr,
                            IAdapter(adapter.addr).rewardToken(),
                            wbnb
                        )
                    )[1];
            } else if (IAdapter(adapter.addr).isVault()) {
                uint256 _vAmount = (userAdapter.userShares *
                    IVaultStrategy(IAdapter(adapter.addr).vStrategy())
                        .wantLockedTotal()) /
                    IVaultStrategy(IAdapter(adapter.addr).vStrategy())
                        .sharesTotal();

                if (_vAmount < userAdapter.amount) continue;

                if (IAdapter(adapter.addr).router() == address(0)) {
                    rewards += IPancakeRouter(swapRouter).getAmountsOut(
                        _vAmount - userAdapter.amount,
                        HedgepieLibrary.getPaths(
                            adapter.addr,
                            IAdapter(adapter.addr).rewardToken(),
                            wbnb
                        )
                    )[1];
                } else {
                    address pairToken = IAdapter(adapter.addr).stakingToken();
                    address token0 = IPancakePair(pairToken).token0();
                    address token1 = IPancakePair(pairToken).token1();
                    (uint112 reserve0, uint112 reserve1, ) = IPancakePair(
                        pairToken
                    ).getReserves();

                    uint256 amount0 = (reserve0 *
                        (_vAmount - userAdapter.amount)) /
                        IPancakePair(pairToken).totalSupply();
                    uint256 amount1 = (reserve1 *
                        (_vAmount - userAdapter.amount)) /
                        IPancakePair(pairToken).totalSupply();

                    if (token0 == wbnb) rewards += amount0;
                    else
                        rewards += IPancakeRouter(swapRouter).getAmountsOut(
                            amount0,
                            HedgepieLibrary.getPaths(adapter.addr, token0, wbnb)
                        )[1];

                    if (token1 == wbnb) rewards += amount1;
                    else
                        rewards += IPancakeRouter(swapRouter).getAmountsOut(
                            amount1,
                            HedgepieLibrary.getPaths(adapter.addr, token1, wbnb)
                        )[1];
                }
            }
        }

        return rewards;
    }

    receive() external payable {}
}
