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

    function totalAssets() external view returns(uint256);

    function totalSupply() external view returns(uint256);
}

interface IPool {
    function add_liquidity(uint256[2] memory,uint256) external payable;

    function add_liquidity(uint256[3] memory,uint256) external payable;

    function add_liquidity(uint256[4] memory,uint256) external payable;

    function add_liquidity(uint256[2] memory,uint256,bool) external payable;

    function add_liquidity(uint256[3] memory,uint256,bool) external payable;

    function add_liquidity(uint256[4] memory,uint256,bool) external payable;

    function remove_liquidity_one_coin(uint256,uint256,uint256,bool) external;

    function remove_liquidity_one_coin(uint256,uint256,uint256) external;
}

contract YearnCurveAdapter is BaseAdapterEth {
    uint256 immutable lpCnt;
    uint256 immutable lpOrder;

    bool immutable underlying;

    address immutable liquidityToken;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _router lp provider router address
     * @param _swapRouter swapRouter for swapping tokens
     * @param _weth  weth address
     * @param _liquidityToken  weth address
     * @param _lpCnt count of tokens in curve pool
     * @param _lpOrder order of liquidity token in curve pool
     * @param _underlying bool to use underlying in curve
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _router,
        address _swapRouter,
        address _weth,
        address _liquidityToken,
        uint256 _lpCnt,
        uint256 _lpOrder,
        bool _underlying,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        strategy = _strategy;
        repayToken = _strategy;
        router = _router;
        swapRouter = _swapRouter;
        weth = _weth;
        liquidityToken = _liquidityToken;
        lpCnt = _lpCnt;
        lpOrder = _lpOrder;
        underlying = _underlying;
        name = _name;
    }

    /**
     * @notice Get curve LP
     * @param _amountIn  amount of liquidityToken
     * @param _isETH  bool for liquidityToken is ETH
     */
    function getCurveLP(
        uint256 _amountIn,
        bool _isETH
    ) private returns(uint256 amountOut) {
        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        if(lpCnt == 2) {
            uint256[2] memory amounts;
            amounts[lpOrder] = _amountIn;

            if(underlying) {
                IPool(router).add_liquidity {
                    value: _isETH ? _amountIn : 0
                } (amounts, 0, true);
            } else {
                IPool(router).add_liquidity {
                    value: _isETH ? _amountIn : 0
                } (amounts, 0);
            }
        } else if(lpCnt == 3) {
            uint256[3] memory amounts;
            amounts[lpOrder] = _amountIn;

            if(underlying) {
                IPool(router).add_liquidity {
                    value: _isETH ? _amountIn : 0
                } (amounts, 0, true);
            } else {
                IPool(router).add_liquidity {
                    value: _isETH ? _amountIn : 0
                } (amounts, 0);
            }
        } else if(lpCnt == 4) {
            uint256[4] memory amounts;
            amounts[lpOrder] = _amountIn;

            if(underlying) {
                IPool(router).add_liquidity {
                    value: _isETH ? _amountIn : 0
                } (amounts, 0, true);
            } else {
                IPool(router).add_liquidity {
                    value: _isETH ? _amountIn : 0
                } (amounts, 0);
            }
        }

        unchecked {
            amountOut = IBEP20(stakingToken).balanceOf(address(this)) - amountOut;
        }
    }

    /**
     * @notice Remove LP from curve
     * @param _amountIn  amount of LP to withdraw
     * @param _isETH  bool for liquidityToken is ETH
     */
    function removeCurveLP(
        uint256 _amountIn,
        bool _isETH
    ) private returns(uint256 amountOut) {
        amountOut = _isETH ? address(this).balance : 
            IBEP20(liquidityToken).balanceOf(address(this));

        if(underlying) {
            IPool(router).remove_liquidity_one_coin(
                _amountIn,
                lpOrder,
                0,
                true
            );
        } else {
            IPool(router).remove_liquidity_one_coin(
                _amountIn,
                lpOrder,
                0
            );
        }

        unchecked {
            amountOut = _isETH ? address(this).balance - amountOut :
                IBEP20(liquidityToken).balanceOf(address(this)) - amountOut;
        }
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
    ) external payable override returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");

        bool isETH = liquidityToken == weth;
        if(isETH) {
            amountOut = _amountIn;
        } else {
            amountOut = HedgepieLibraryEth.swapOnRouter(
                address(this),
                _amountIn,
                liquidityToken,
                swapRouter,
                weth
            );
            IBEP20(liquidityToken).approve(router, amountOut);
        }

        // get curve lp
        amountOut = getCurveLP(amountOut, isETH);
        
        uint256 repayAmt = IBEP20(repayToken).balanceOf(address(this));

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).deposit(amountOut);

        repayAmt = IBEP20(repayToken).balanceOf(address(this)) - repayAmt;

        // update user info
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];
        unchecked {
            // update user info
            userInfo.amount += amountOut;
            userInfo.invested += _amountIn;

            // update withdrawalAmount
            withdrawalAmount[_account][_tokenId] += repayAmt;

            // update adapter info
            adapterInfos[_tokenId].totalStaked += amountOut;
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
    function withdraw(
        uint256 _tokenId,
        address _account
    ) external payable override returns (uint256 amountOut) {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        IStrategy(strategy).withdraw(withdrawalAmount[_account][_tokenId]);

        unchecked {
            amountOut = IBEP20(stakingToken).balanceOf(address(this)) - amountOut;
        }

        // withdraw liquiditytoken from curve pool
        bool isETH = liquidityToken == weth;
        amountOut = removeCurveLP(amountOut, isETH);

        if(!isETH) {
            amountOut = HedgepieLibraryEth.swapforEth(
                address(this), 
                amountOut, 
                liquidityToken, 
                swapRouter, 
                weth
            );
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
            // update withdrawalAmount
            withdrawalAmount[_account][_tokenId] = 0;

            // update user info
            userInfo.amount = 0;
            userInfo.invested = 0;

            // update adapter info
            adapterInfos[_tokenId].totalStaked -= userInfo.amount;
        }

        if (amountOut != 0) {
            uint256 taxAmount = (amountOut *
                IYBNFT(IHedgepieInvestorEth(investor).ybnft()).performanceFee(
                    _tokenId
                )) / 1e4;
            (bool success, ) = payable(
                IHedgepieInvestorEth(investor).treasury()
            ).call{value: taxAmount}("");
            require(success, "Failed to send ether to Treasury");

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
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

        uint256 _vAmount = (userInfo.userShares *
            IStrategy(strategy).totalAssets() /
            IStrategy(strategy).totalSupply());

        if (_vAmount < userInfo.amount) return 0;

        reward = IPancakeRouter(swapRouter).getAmountsOut(
            _vAmount - userInfo.amount,
            getPaths(stakingToken, weth)
        )[1];
    }

    receive() external payable {}
}
