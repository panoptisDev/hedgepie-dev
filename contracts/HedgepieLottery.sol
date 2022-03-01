// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";
import "@chainlink/contracts/src/v0.7/VRFConsumerBase.sol";

interface IYBNFT {
    function chkToken(uint tokenId) external view returns(bool);
}

contract HedgepieLottery is Ownable, VRFConsumerBase {
    using SafeMath for uint;
    using SafeBEP20 for IBEP20;

    address public immutable HedgepieYBNFT;
    address public immutable HedgepieToken;

    uint public lotteryCnt;
    uint public ticketRatio;

    uint public minStake;
    uint public maxStake;

    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 internal randomResult;
    uint256 private winnerTotal;

    mapping(uint => uint) public LotteryResult;
    mapping(uint => bool) public LotteryFetched;
    mapping(uint => address) public LotteryWinner;

    mapping(uint => Lottery) public Lotteries;
    mapping(uint => Stake[]) public LotteryUser;
    mapping(uint => mapping(address => uint)) public StakeUser;
    struct Lottery {
        string lotteryName;
        uint tokenId;
        uint startTime;
        uint period;
    }

    struct Stake {
        uint amount;
        uint ticket;
        uint startTime;
        bool withdraw;
        address staker;
    }

    enum MinMax { MIN, MAX }

    event LotteryCreated(string name, uint tokenId, uint startTime, uint period);
    event Deposit(address indexed depositer, uint lotteryId, uint amount);
    event Withdraw(address indexed depositer, uint lotteryId);
    event SetWinner(address indexed winner, uint lotteryId, uint winnumber);

    constructor(
        address _ybNFt,
        address _hedgepie
    ) VRFConsumerBase(
        0xa555fC018435bef5A13C6c6870a9d4C11DEC329C, // VRF Coordinator bsc testnet
        0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06  // LINK Token bsc testnet
    ) {
        require(_ybNFt != address(0));
        require(_hedgepie != address(0));

        HedgepieYBNFT = _ybNFt;
        HedgepieToken = _hedgepie;

        // these are for BSC testnet
        keyHash = 0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186;
        fee = 0.1 * 1e18; // 0.1 LINK
    }

    function setMinMax(MinMax minMax, uint value) external onlyOwner {
        if(minMax == MinMax.MIN) {
            minStake = value;
        } else if(minMax == MinMax.MAX) {
            maxStake = value;
        }
    }

    function _createLottery(
        string memory _lotteryName, 
        uint _tokenId, 
        uint _startTime,
        uint _period
    ) private {
        Lotteries[lotteryCnt] = Lottery({
            lotteryName: _lotteryName,
            tokenId: _tokenId,
            startTime: _startTime,
            period: _period
        });
        lotteryCnt++;
    }

    function _deposit(
        uint _lotteryId,
        uint _amount
    ) private {
        address depositor = msg.sender;
        IBEP20( HedgepieToken ).safeTransferFrom(depositor, address(this), _amount);

        uint stakeInd = StakeUser[_lotteryId][depositor];
        if(stakeInd > 0) {
            Stake memory info = LotteryUser[_lotteryId][stakeInd];
            LotteryUser[_lotteryId][stakeInd] = Stake({
                withdraw: false,
                amount: info.amount.add(_amount),
                ticket: info.ticket.add(getUserTicket(_lotteryId, depositor)),
                startTime: block.number,
                staker: info.staker
            });
        } else {
            uint stakeCnt = LotteryUser[_lotteryId].length;
            LotteryUser[_lotteryId][stakeCnt + 1] = Stake({
                amount: _amount,
                ticket: 0,
                startTime: block.number,
                withdraw: false,
                staker: depositor
            });

            StakeUser[_lotteryId][depositor] = stakeCnt + 1;
        }
    }

    function getTicketAmount(uint lotteryId, uint stakeInd) private view returns(uint amount) {
        Lottery memory lottery = Lotteries[lotteryId];
        uint infoTime = lottery.startTime.add(lottery.period);

        Stake memory info = LotteryUser[lotteryId][stakeInd];
        uint endTime = block.timestamp >= infoTime ? block.timestamp : infoTime;

        uint diffAmount = info.amount.mul(endTime.sub(info.startTime));
        amount = info.ticket.add(diffAmount);
    }

    function getUserTicket(uint lotteryId, address user) public view returns(uint ticket) {
        uint stakeInd = StakeUser[lotteryId][user];
        if(stakeInd > 0) {
            ticket = getTicketAmount(lotteryId, stakeInd);
        }
    }

    function getTotalTicket(uint lotteryId) public view returns(uint ticket) {
        Stake[] memory infos = LotteryUser[lotteryId];
        if(infos.length > 0) {
            for(uint i = 1; i <= infos.length; i++) {
                ticket = ticket.add(getTicketAmount(lotteryId, i));
            }
        }
    }

    function getWinner(uint lotteryId, uint selMod) internal view returns(address winner, uint amount) {
        uint ticket;
        Stake[] memory infos = LotteryUser[lotteryId];
        for(uint i = 1; i <= infos.length; i++) {
            ticket = ticket.add(getTicketAmount(lotteryId, i));
            if(ticket >= selMod) {
                Stake memory info = LotteryUser[lotteryId][i];
                winner = info.staker;
                amount = info.amount;

                break;
            }
        }
    }

    function createLottery(
        string memory lotteryName, 
        uint tokenId, 
        uint startTime,
        uint period
    ) external onlyOwner returns(bool) {
        require(block.timestamp < startTime, "Invalid start time");
        require(period > 0, "Invalid period");
        require(IYBNFT( HedgepieYBNFT ).chkToken(tokenId), "Token not existing");

        _createLottery(lotteryName, tokenId, startTime, period);

        emit LotteryCreated(lotteryName, tokenId, startTime, period);
        return true;
    }

    function deposit(uint lotteryId, uint amount) external {
        require(lotteryId < lotteryCnt);
        require(amount >= minStake && amount <= maxStake, "Invalid deposit amount");

        Lottery memory info = Lotteries[lotteryId];
        require(info.startTime.add(info.period) >= block.timestamp, "Lottery not in progress");

        _deposit(lotteryId, amount);

        emit Deposit(msg.sender, lotteryId, amount);
    }

    function setWinner(uint lotteryId) external {
        require(lotteryId < lotteryCnt);
        require(LotteryFetched[lotteryId]);
        require(LotteryWinner[lotteryId] == address(0));

        uint totalTicket = getTotalTicket(lotteryId);
        if(totalTicket > 0 && LotteryResult[lotteryId] > 0) {
            uint selMod = LotteryResult[lotteryId].mod(totalTicket);
            (address winner, uint amount) = getWinner(lotteryId, selMod);
            
            LotteryWinner[lotteryId] = winner;
            winnerTotal = winnerTotal.add(amount);

            emit SetWinner(winner, lotteryId, LotteryResult[lotteryId]);
        }
    }

    function withdraw(uint lotteryId) external {
        require(StakeUser[lotteryId][msg.sender] > 0, "Not staked");
        require(msg.sender != LotteryWinner[lotteryId]);

        uint stakeInd = StakeUser[lotteryId][msg.sender];
        Stake memory info = LotteryUser[lotteryId][stakeInd];
        require(info.amount > 0);
        require(!info.withdraw, "Withdrawed already");

        LotteryUser[lotteryId][stakeInd].withdraw = true;

        IBEP20( HedgepieToken ).safeTransfer(msg.sender, info.amount);

        emit Withdraw(msg.sender, lotteryId);
    }

    function withdrawReward(address rewardWallet) external onlyOwner {
        require(winnerTotal > 0);

        winnerTotal = 0;
        IBEP20( HedgepieToken ).safeTransfer(rewardWallet, winnerTotal);
    }

    function getRandomNumber(uint lotteryId) external returns (bytes32 requestId) {
        require(lotteryId < lotteryCnt, "Invalid id");
        require(!LotteryFetched[lotteryId]);
        
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");

        LotteryFetched[lotteryId] = true;
        randomResult = lotteryId;
        
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        LotteryResult[randomResult] = randomness;
    }
}