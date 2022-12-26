// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.4;

import "../interfaces/IBEP20.sol";
import "../interfaces/IStargateRouter.sol";
import "../interfaces/IStargateReceiver.sol";

contract MultiDemo is IStargateReceiver {
    mapping(address => uint256) public depositAmt;
    mapping(address => uint256) public crossDepositAmt;
    address public router;
    address public to;
    address public sUSDT;

    constructor(address router_) {
        router = router_;
    }

    modifier onlyEOA() {
        require(msg.sender == tx.origin);
        _;
    }

    function deposit(
        uint16 _dstChainId,
        uint256 _srcPoolId,
        uint256 _dstPoolId,
        address payable _refundAddress,
        uint256 _amountLD,
        uint256 _minAmountLD,
        IStargateRouter.lzTxObj memory _lzTxParams,
        bytes calldata _to,
        bytes calldata _payload,
        address[2] memory _tokenAddress
    ) external payable onlyEOA {
        IBEP20(_tokenAddress[0]).transferFrom(
            msg.sender,
            address(this),
            _amountLD
        );
        IBEP20(_tokenAddress[0]).approve(_tokenAddress[1], _amountLD);

        require(msg.value != 0, "Inalid deposit amount");
        depositAmt[msg.sender] = msg.value;

        IStargateRouter(router).swap{value: msg.value}(
            _dstChainId,
            _srcPoolId,
            _dstPoolId,
            _refundAddress,
            _amountLD,
            _minAmountLD,
            _lzTxParams,
            _to,
            _payload
        );
    }

    function crossDeposit(address _to, bytes memory _calldata)
        external
        onlyEOA
    {
        uint256 amount = abi.decode(_calldata, (uint256));
        crossDepositAmt[msg.sender] = amount;
        to = _to;
    }

    function sgReceive(
        uint16 _chainId,
        bytes memory _srcAddress,
        uint256 _nonce,
        address _token,
        uint256 amountLD,
        bytes memory payload
    ) external override {
        emit sgReceived(
            _chainId,
            _srcAddress,
            _nonce,
            _token,
            amountLD,
            payload
        );
    }

    receive() external payable {}
}
