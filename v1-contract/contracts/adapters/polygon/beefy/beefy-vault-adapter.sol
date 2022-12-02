// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterMatic.sol";

import "../../../libraries/HedgepieLibraryMatic.sol";
import "../../../interfaces/IHedgepieInvestorMatic.sol";
import "../../../interfaces/IHedgepieAdapterInfoMatic.sol";

interface IVault {
    function deposit(uint256) external;

    function withdraw(uint256) external;

    function balanceOf(address) external view returns (uint256);
}

contract BeefyVaultAdapterMatic is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _router  address of router for LP
     * @param _wmatic  address of wmatic
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _router,
        address _wmatic,
        string memory _name
    ) {
        strategy = _strategy;
        stakingToken = _stakingToken;
        repayToken = _strategy;
        router = _router;
        wmatic = _wmatic;
        name = _name;
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
            stakingToken,
            swapRouter,
            wmatic
        );

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

        amountOut = HedgepieLibraryMatic.swapforMatic(
            amountOut,
            address(this),
            stakingToken,
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
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - reward}("");
            require(success, "Failed to send ether");
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

        if (stakingToken != wmatic)
            reward += IPancakeRouter(swapRouter).getAmountsOut(
                _reward,
                getPaths(stakingToken, wmatic)
            )[1];
    }

    receive() external payable {}
}
