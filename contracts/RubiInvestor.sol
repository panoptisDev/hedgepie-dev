// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;
pragma abicoder v2;

import "./interfaces/IBEP20.sol";
import "./libraries/Ownable.sol";
import "./libraries/SafeBEP20.sol";

interface IYBNFT {
    function deposit(uint tokenId, uint amount, address token) external;
}

contract RubiInvestor is Ownable {
    using SafeBEP20 for IBEP20;

    address public immutable YBNFT;
    
    mapping(address => bool) public AllowedToken;
    mapping(uint => NFTFund[]) public NFTFunds;
    struct NFTFund {
        address funder;
        address token;
        uint amount;
    }

    struct Strategy {
        uint percent;
        address swapToken;
        address swapAddress;
    }

    event Deposit(uint256 _tokenId, address indexed _funder, address _token, uint _amount);

    constructor(address _rubi, address _ybNFT) {
        require(_rubi != address(0));

        YBNFT = _ybNFT;
        AllowedToken[_rubi] = true;
    }

    function manageToken(address[] calldata tokens, bool flag) public onlyOwner {
        require(tokens.length > 0);

        for (uint8 i = 0; i < tokens.length; i++) {
            AllowedToken[tokens[i]] = flag;
        }
    }

    function deposit(
        uint tokenId,
        uint amount,
        address token
    ) public {
        require(amount > 0);
        require(AllowedToken[token], "Not allowed token");

        IBEP20( token ).safeTransferFrom(msg.sender, address(this), amount);

        IBEP20( token ).safeApprove(YBNFT, amount);
        IYBNFT( YBNFT ).deposit(tokenId, amount, token);

        NFTFunds[tokenId].push(NFTFund({
            funder: msg.sender,
            token: token,
            amount: amount
        }));

        emit Deposit(tokenId, msg.sender, token, amount);
    }
}