// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorEth.sol";
import "../../../interfaces/IHedgepieAdapterInfoEth.sol";

struct JoinPoolRequest {
    address[] assets;
    uint256[] maxAmountsIn;
    bytes userData;
    bool fromInternalBalance;
}

interface IStrategy {
    function joinPool(
        bytes32 _pid,
        address _sender,
        address _recipient,
        JoinPoolRequest memory _request
    ) external payable;

    function exitPool(
        bytes32 _pid,
        address _sender,
        address _recipient,
        JoinPoolRequest memory _request
    ) external payable;
}

contract BalancerVaultAdapterEth is BaseAdapterEth {
    // Balancer Vault pool id
    bytes32 public immutable poolId;

    // Token array length
    uint256 public immutable tokenLength;

    // Reward token includes weth
    bool public isWETH;

    // Reward tokens on Balancer
    address[] public rewardTokens;

    /**
     * @notice Construct
     * @param _pid  strategy pool id
     * @param _strategy  address of strategy
     * @param _rewardTokens  address of reward token
     * @param _repayToken  address of repay token
     * @param _swapRouter swapRouter for swapping tokens
     * @param _name  adatper name
     * @param _weth  weth address
     */
    constructor(
        bytes32 _pid,
        address _strategy,
        address _repayToken,
        address _swapRouter,
        address _weth,
        address[] memory _rewardTokens,
        string memory _name
    ) {
        require(_rewardTokens.length > 1, "Invalid rewardTokens array length");
        poolId = _pid;
        repayToken = _repayToken;
        tokenLength = _rewardTokens.length;
        strategy = _strategy;
        swapRouter = _swapRouter;
        name = _name;
        weth = _weth;

        for (uint256 i; i < _rewardTokens.length; ++i) {
            if (_rewardTokens[i] == _weth) isWETH = true;
            rewardTokens.push(_rewardTokens[i]);
        }
    }

    /**
     * @notice Deposit with ETH
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     * @param _amountIn ETH amount
     */
    function deposit(
        uint256 _tokenId,
        uint256 _amountIn,
        address _account
    ) external payable override onlyInvestor returns (uint256) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        address[] memory assets = new address[](tokenLength);
        uint256[] memory amounts = new uint256[](tokenLength);

        for (uint256 i; i < rewardTokens.length; ++i) {
            assets[i] = rewardTokens[i] == weth ? address(0) : rewardTokens[i];
            amounts[i] = rewardTokens[i] == weth ? msg.value : 0;
        }

        uint256 repayAmt = IBEP20(repayToken).balanceOf(address(this));
        if (isWETH) {
            IStrategy(strategy).joinPool{value: msg.value}(
                poolId,
                address(this),
                address(this),
                JoinPoolRequest(assets, amounts, abi.encode(1, amounts), false)
            );
        } else {
            uint256 amountOut = HedgepieLibraryEth.swapOnRouter(
                _amountIn,
                address(this),
                rewardTokens[0],
                swapRouter,
                weth
            );
            amounts[0] = amountOut;
            IBEP20(rewardTokens[0]).approve(strategy, amountOut);
            IStrategy(strategy).joinPool(
                poolId,
                address(this),
                address(this),
                JoinPoolRequest(assets, amounts, abi.encode(1, amounts), false)
            );
        }
        repayAmt = IBEP20(repayToken).balanceOf(address(this)) - repayAmt;

        adapterInfo.totalStaked += repayAmt;
        userInfo.amount += repayAmt;
        userInfo.invested += _amountIn;

        // Update adapterInfo contract
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

        return _amountIn;
    }

    /**
     * @notice Withdraw the deposited ETH
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
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];
        uint256[] memory rewardAmt = new uint256[](rewardTokens.length);
        uint256 i;
        for (i; i < rewardTokens.length; ++i)
            rewardAmt[i] = IBEP20(rewardTokens[i]).balanceOf(address(this));

        IBEP20(repayToken).approve(strategy, userInfo.amount);
        uint256[] memory minAmountsOut = new uint256[](tokenLength);

        IStrategy(strategy).exitPool(
            poolId,
            address(this),
            address(this),
            JoinPoolRequest(
                rewardTokens,
                minAmountsOut,
                abi.encode(1, userInfo.amount),
                false
            )
        );
        for (i = 0; i < rewardTokens.length; ++i)
            rewardAmt[i] =
                IBEP20(rewardTokens[i]).balanceOf(address(this)) -
                rewardAmt[i];

        for (i = 0; i < rewardTokens.length; ++i)
            amountOut += HedgepieLibraryEth.swapforEth(
                rewardAmt[i],
                address(this),
                rewardTokens[i],
                swapRouter,
                weth
            );

        uint256 rewardETH;
        if (amountOut > userInfo.invested)
            rewardETH = amountOut - userInfo.invested;

        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();
        if (rewardETH != 0) {
            IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateProfitInfo(
                _tokenId,
                rewardETH,
                true
            );
        }
        // Update adapterInfo contract
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

        adapterInfo.totalStaked -= userInfo.amount;
        userInfo.amount = 0;
        userInfo.invested = 0;

        if (amountOut != 0) {
            bool success;
            uint256 taxAmount;
            if (rewardETH != 0) {
                taxAmount =
                    (rewardETH *
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
        return amountOut;
    }

    receive() external payable {}
}
