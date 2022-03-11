// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";

interface IYBNFT {
    function chkToken(uint256 tokenId) external view returns (bool);
}

contract HedgepieLottery is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    address public immutable hedgepieYBNFT;
    address public immutable hedgepieToken;

    uint256 public lotteryCnt;
    uint256 public ticketRatio;

    uint256 public minStake;
    uint256 public maxStake;

    mapping(uint256 => Lottery) public lotteries;
    mapping(uint256 => mapping(address => Stake)) public lotteryUser;

    struct Lottery {
        bytes lotteryName;
        uint256 tokenId;
        uint256 startTime;
        uint256 period;
    }

    struct Stake {
        uint256 amount;
        uint256 ticket;
        uint256 startTime;
    }

    enum MinMax {
        MIN,
        MAX
    }

    event LotteryCreated(
        bytes name,
        uint256 tokenId,
        uint256 startTime,
        uint256 period
    );
    event Deposit(address indexed depositer, uint256 lotteryId, uint256 amount);

    constructor(address _ybNFt, address _hedgepie) {
        require(_ybNFt != address(0), "Missing YBNFT");
        require(_hedgepie != address(0), "Missing hedgepie");

        hedgepieYBNFT = _ybNFt;
        hedgepieToken = _hedgepie;
    }

    function setMinMax(MinMax _type, uint256 _value) external onlyOwner {
        if (_type == MinMax.MIN) {
            minStake = _value;
        } else if (_type == MinMax.MAX) {
            maxStake = _value;
        }
    }

    function _createLottery(
        bytes calldata _lotteryName,
        uint256 _tokenId,
        uint256 _startTime,
        uint256 _period
    ) private {
        lotteries[lotteryCnt] = Lottery({
            lotteryName: _lotteryName,
            tokenId: _tokenId,
            startTime: _startTime,
            period: _period
        });
        lotteryCnt++;
    }

    function _deposit(uint256 _lotteryId, uint256 _amount) private {
        IBEP20(hedgepieYBNFT).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );

        Stake memory info = lotteryUser[_lotteryId][msg.sender];
        lotteryUser[_lotteryId][msg.sender] = Stake({
            amount: info.amount.add(_amount),
            ticket: info.ticket.add(getUserTicket(_lotteryId, msg.sender)),
            startTime: block.timestamp
        });
    }

    function getUserTicket(uint256 _lotteryId, address _user)
        public
        view
        returns (uint256)
    {
        Stake memory info = lotteryUser[_lotteryId][_user];
        uint256 diffAmount = info.amount.mul(
            block.timestamp.sub(info.startTime)
        );
        return info.ticket.add(diffAmount);
    }

    function createLottery(
        bytes calldata _lotteryName,
        uint256 _tokenId,
        uint256 _startTime,
        uint256 _period
    ) public onlyOwner returns (bool) {
        require(block.timestamp < _startTime, "Invalid start time");
        require(_period > 0, "Invalid period");
        require(IYBNFT(hedgepieYBNFT).chkToken(_tokenId), "Token not existing");

        _createLottery(_lotteryName, _tokenId, _startTime, _period);

        emit LotteryCreated(_lotteryName, _tokenId, _startTime, _period);
        return true;
    }

    function deposit(uint256 _lotteryId, uint256 _amount) public {
        require(_amount > 0, "Amount is 0");
        Lottery memory info = lotteries[_lotteryId];
        require(info.startTime > 0, "Invalid Lottery");

        _deposit(_lotteryId, _amount);

        emit Deposit(msg.sender, _lotteryId, _amount);
    }
}
