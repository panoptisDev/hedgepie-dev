// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

interface IYBNFT {
    function chkToken(uint256 tokenId) external view returns (bool);
}

contract Lottery1 is Ownable, VRFConsumerBase {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    address public immutable HedgepieYBNFT;
    address public immutable HedgepieToken;

    uint256 public lotteryCnt;
    uint256 public ticketRatio;

    uint256 public minStake;
    uint256 public maxStake;

    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 internal randomResult;
    uint256 private winnerTotal;

    mapping(uint256 => uint256) public LotteryResult;
    mapping(uint256 => bool) public LotteryFetched;
    mapping(uint256 => address) public LotteryWinner;

    mapping(uint256 => Lottery) public Lotteries;
    mapping(uint256 => Stake[]) public LotteryUser;
    mapping(uint256 => mapping(address => uint256)) public StakeUser;
    struct Lottery {
        string lotteryName;
        uint256 tokenId;
        uint256 startTime;
        uint256 period;
    }

    struct Stake {
        uint256 amount;
        uint256 ticket;
        uint256 startTime;
        bool withdraw;
        address staker;
    }

    enum MinMax {
        MIN,
        MAX
    }

    event LotteryCreated(
        string name,
        uint256 tokenId,
        uint256 startTime,
        uint256 period
    );
    event Deposit(address indexed depositer, uint256 lotteryId, uint256 amount);
    event Withdraw(address indexed depositer, uint256 lotteryId);
    event SetWinner(
        address indexed winner,
        uint256 lotteryId,
        uint256 winnumber
    );

    constructor(address _ybNFt, address _hedgepie)
        VRFConsumerBase(
            0xa555fC018435bef5A13C6c6870a9d4C11DEC329C, // VRF Coordinator bsc testnet
            0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06 // LINK Token bsc testnet
        )
    {
        require(_ybNFt != address(0));
        require(_hedgepie != address(0));

        HedgepieYBNFT = _ybNFt;
        HedgepieToken = _hedgepie;

        // these are for BSC testnet
        keyHash = 0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186;
        fee = 0.1 * 1e18; // 0.1 LINK
    }

    function setMinMax(MinMax minMax, uint256 value) external onlyOwner {
        if (minMax == MinMax.MIN) {
            minStake = value;
        } else if (minMax == MinMax.MAX) {
            maxStake = value;
        }
    }

    function _createLottery(
        string memory _lotteryName,
        uint256 _tokenId,
        uint256 _startTime,
        uint256 _period
    ) private {
        Lotteries[lotteryCnt] = Lottery({
            lotteryName: _lotteryName,
            tokenId: _tokenId,
            startTime: _startTime,
            period: _period
        });
        lotteryCnt++;
    }

    function _deposit(uint256 _lotteryId, uint256 _amount) private {
        address depositor = msg.sender;
        IBEP20(HedgepieToken).safeTransferFrom(
            depositor,
            address(this),
            _amount
        );

        uint256 stakeInd = StakeUser[_lotteryId][depositor];
        if (stakeInd > 0) {
            Stake memory info = LotteryUser[_lotteryId][stakeInd];
            LotteryUser[_lotteryId][stakeInd] = Stake({
                withdraw: false,
                amount: info.amount.add(_amount),
                ticket: info.ticket.add(getUserTicket(_lotteryId, depositor)),
                startTime: block.number,
                staker: info.staker
            });
        } else {
            uint256 stakeCnt = LotteryUser[_lotteryId].length;
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

    function getTicketAmount(uint256 lotteryId, uint256 stakeInd)
        private
        view
        returns (uint256 amount)
    {
        Lottery memory lottery = Lotteries[lotteryId];
        uint256 infoTime = lottery.startTime.add(lottery.period);

        Stake memory info = LotteryUser[lotteryId][stakeInd];
        uint256 endTime = block.timestamp >= infoTime
            ? block.timestamp
            : infoTime;

        uint256 diffAmount = info.amount.mul(endTime.sub(info.startTime));
        amount = info.ticket.add(diffAmount);
    }

    function getUserTicket(uint256 lotteryId, address user)
        public
        view
        returns (uint256 ticket)
    {
        uint256 stakeInd = StakeUser[lotteryId][user];
        if (stakeInd > 0) {
            ticket = getTicketAmount(lotteryId, stakeInd);
        }
    }

    function getTotalTicket(uint256 lotteryId)
        public
        view
        returns (uint256 ticket)
    {
        Stake[] memory infos = LotteryUser[lotteryId];
        if (infos.length > 0) {
            for (uint256 i = 1; i <= infos.length; i++) {
                ticket = ticket.add(getTicketAmount(lotteryId, i));
            }
        }
    }

    function getWinner(uint256 lotteryId, uint256 selMod)
        internal
        view
        returns (address winner, uint256 amount)
    {
        uint256 ticket;
        Stake[] memory infos = LotteryUser[lotteryId];
        for (uint256 i = 1; i <= infos.length; i++) {
            ticket = ticket.add(getTicketAmount(lotteryId, i));
            if (ticket >= selMod) {
                Stake memory info = LotteryUser[lotteryId][i];
                winner = info.staker;
                amount = info.amount;

                break;
            }
        }
    }

    function createLottery(
        string memory lotteryName,
        uint256 tokenId,
        uint256 startTime,
        uint256 period
    ) external onlyOwner returns (bool) {
        require(block.timestamp < startTime, "Invalid start time");
        require(period > 0, "Invalid period");
        require(IYBNFT(HedgepieYBNFT).chkToken(tokenId), "Token not existing");

        _createLottery(lotteryName, tokenId, startTime, period);

        emit LotteryCreated(lotteryName, tokenId, startTime, period);
        return true;
    }

    function deposit(uint256 lotteryId, uint256 amount) external {
        require(lotteryId < lotteryCnt);
        require(
            amount >= minStake && amount <= maxStake,
            "Invalid deposit amount"
        );

        Lottery memory info = Lotteries[lotteryId];
        require(
            info.startTime.add(info.period) >= block.timestamp,
            "Lottery not in progress"
        );

        _deposit(lotteryId, amount);

        emit Deposit(msg.sender, lotteryId, amount);
    }

    function setWinner(uint256 lotteryId) external {
        require(lotteryId < lotteryCnt);
        require(LotteryFetched[lotteryId]);
        require(LotteryWinner[lotteryId] == address(0));

        uint256 totalTicket = getTotalTicket(lotteryId);
        if (totalTicket > 0 && LotteryResult[lotteryId] > 0) {
            uint256 selMod = LotteryResult[lotteryId].mod(totalTicket);
            (address winner, uint256 amount) = getWinner(lotteryId, selMod);

            LotteryWinner[lotteryId] = winner;
            winnerTotal = winnerTotal.add(amount);

            emit SetWinner(winner, lotteryId, LotteryResult[lotteryId]);
        }
    }

    function withdraw(uint256 lotteryId) external {
        require(StakeUser[lotteryId][msg.sender] > 0, "Not staked");
        require(msg.sender != LotteryWinner[lotteryId]);

        uint256 stakeInd = StakeUser[lotteryId][msg.sender];
        Stake memory info = LotteryUser[lotteryId][stakeInd];
        require(info.amount > 0);
        require(!info.withdraw, "Withdrawed already");

        LotteryUser[lotteryId][stakeInd].withdraw = true;

        IBEP20(HedgepieToken).safeTransfer(msg.sender, info.amount);

        emit Withdraw(msg.sender, lotteryId);
    }

    function withdrawReward(address rewardWallet) external onlyOwner {
        require(winnerTotal > 0);

        winnerTotal = 0;
        IBEP20(HedgepieToken).safeTransfer(rewardWallet, winnerTotal);
    }

    function getRandomNumber(uint256 lotteryId)
        external
        returns (bytes32 requestId)
    {
        require(lotteryId < lotteryCnt, "Invalid id");
        require(!LotteryFetched[lotteryId]);

        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");

        LotteryFetched[lotteryId] = true;
        randomResult = lotteryId;

        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        LotteryResult[randomResult] = randomness;
    }
}
