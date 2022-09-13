// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Strings.sol";
import "../../BaseAdapterMatic.sol";

contract CurveGaugeAdaper is BaseAdapterMatic {
    uint256 public lpCnt;

    uint256 public lpOrder;

    bool public underlying;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _liquidityToken  address of staking token
     * @param _router  address of router
     * @param _lpCnt  number of lp count in pool
     * @param _lpOrder  number of lp count in pool
     * @param _underlying  bool for underlying
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _liquidityToken,
        address _router,
        uint256 _lpCnt,
        uint256 _lpOrder,
        bool _underlying,
        string memory _name
    ) {
        liquidityToken = _liquidityToken;
        stakingToken = _stakingToken;
        strategy = _strategy;
        router = _router;

        lpCnt = _lpCnt;
        lpOrder = _lpOrder;

        underlying = _underlying;

        name = _name;
    }
    
    /**
     * @notice Get invest calldata
     * @param _amount  amount of invest
     */
    function getInvestCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = strategy;
        value = 0;
        data = abi.encodeWithSignature("deposit(uint256)", _amount);
    }

    /**
     * @notice Get devest calldata
     * @param _amount  amount of devest
     */
    function getDevestCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = strategy;
        value = 0;
        data = abi.encodeWithSignature("withdraw(uint256)", _amount);
    }

    function getAddLiqCallData(uint256 _amount)
        external
        view
        returns(
            address to,
            uint256 value,
            bytes memory data
        ) 
    {
        to = router;
        value = 0;

        uint256[] memory amounts = new uint256[](lpCnt);
        amounts[lpOrder] = _amount;

        data = underlying ?
            abi.encodeWithSignature(
                string(
                    abi.encodePacked(
                        "add_liquidity(uint256[",
                        Strings.toString(lpCnt),
                        "],uint256,bool)"
                    )
                ),
                amounts,
                0,
                true
            ) : 
            abi.encodeWithSignature(
                string(
                    abi.encodePacked(
                        "add_liquidity(uint256[",
                        Strings.toString(lpCnt),
                        "],uint256)"
                    )
                ),
                amounts,
                0
            );
    }

    function getRemoveLiqCallData(uint256 _amount)
        external
        view
        returns(
            address to,
            uint256 value,
            bytes memory data
        ) 
    {
        to = router;
        value = 0;

        data = underlying ? 
            abi.encodeWithSignature(
                "remove_liquidity_one_coin(uint256,uint256,uint256,bool)",
                _amount,
                lpOrder,
                0,
                true
            ) : 
            abi.encodeWithSignature(
                "remove_liquidity_one_coin(uint256,uint256,uint256)",
                _amount,
                lpOrder,
                0
            );
    }
}