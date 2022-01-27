// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";

interface IYBNFT {
    function chkToken(uint tokenId) external view returns(bool);
}

contract HedgepieLottery is Ownable {
    using SafeMath for uint;
    using SafeBEP20 for IBEP20;

    address public immutable HedgepieYBNFT;
    address public immutable HedgepieToken;

    uint public LotteryCnt;
    uint public ticketRatio;

    uint public minStake;
    uint public maxStake;

    mapping(uint => Lottery) public Lotteries;
    mapping(uint => mapping(address => Stake)) public LotteryUser;
    struct Lottery {
        string bytes lotteryName;
        uint tokenId;
        uint startTime;
        uint period;
    }

    struct Stake {
        uint amount;
        uint ticket;
        uint startTime;
    }

    enum MinMax { MIN, MAX }

    event LotteryCreated(string bytes name, uint tokenId, uint startTime, uint period);
    event Deposit(address indexed depositer, uint lotteryId, uint amount);

    constructor(
        address _ybNFt,
        address _hedgepie
    ) {
        require(_ybNFt != address(0));
        require(_hedgepie != address(0));

        HedgepieYBNFT = _ybNFt;
        HedgepieToken = _hedgepie;
    }

    function setMinMax(MinMax type, uint value) external onlyOwner {
        if(type == MinMax.MIN) {
            minStake = value;
        } else if(type == MinMax.MAX) {
            maxStake = value;
        }
    }

    function _createLottery(
        string bytes _lotteryName, 
        uint _tokenId, 
        uint _startTime,
        uint _period
    ) private {
        Lotteries[LotteryCnt] = Lottery({
            lotteryName: _lotteryName,
            tokenId: _tokenId,
            startTime: _startTime,
            period: _period
        });
        LotteryCnt++;
    }

    function _deposit(
        uint _lotteryId,
        uint _amount
    ) private {
        address depositor = _msgSender();
        IBEP20( HedgepieYBNFT ).safeTransferFrom(depositor, address(this), amount);

        Stake memory info = LotteryUser[lotteryId][depositor];
        LotteryUser[lotteryId][depositor] = Stake({
            amount: info.amount.add(_amount),
            ticket: info.ticket.add(getUserTicket(lotteryId, depositor)),
            startTime: block.timestamp
        });
    }

    function getUserTicket(uint lotteryId, address usesr) external view returns(uint) {
        Stake memory info = LotteryUser[lotteryId][user];
        uint diffAmount = info.amount.mul(block.timestamp.sub(startTime));
        return info.ticket.add(diffAmount);
    }

    function createLottery(
        string bytes lotteryName, 
        uint tokenId, 
        uint startTime,
        uint period
    ) public onlyOwner returns(bool) {
        require(block.timestamp < startTime, "Invalid start time");
        require(period > 0, "Invalid period");
        require(IYBNFT( HedgepieYBNFT ).chkToken(tokenId), "Token not existing");

        _createLottery(lotteryName, tokenId, startTime, period);

        emit LotteryCreated(lotteryName, tokenId, startTime, period);
        return true;
    }

    function deposit(uint lotteryId, uint amount) public {
        require(amount > 0);
        Lottery memory info = Lotteries[lotteryId];
        require(info)
        require(Lotteries[lotteryId].startTime > 0, "Invalid Lottery");

        _deposit(lotteryId, amount);

        emit Deposit(msg.sender, lotteryId, amount);
    }
}