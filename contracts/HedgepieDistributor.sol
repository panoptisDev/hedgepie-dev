// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./libraries/SafeBEP20.sol";
import "./libraries/SafeMath.sol";
import "./libraries/Ownable.sol";

contract HedgepieDistributor is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    address public immutable globalTreasury;
    address public immutable boostTreasury;
    address public immutable hedgepieVault;
    address public immutable hedgepieYBNFT;
    address public immutable hedgepieToken;

    uint256 public globalPercent;
    uint256 public boostPercent;
    uint256 public vaultPercent;

    enum PercentType {
        GLOBAL,
        BOOST,
        VAULT
    }

    event Distribute(
        uint256 amount,
        uint256 vault,
        uint256 boost,
        uint256 global
    );

    constructor(
        address _globalTreasury,
        address _boostTreasury,
        address _vault,
        address _ybNFT,
        address _hpieToken
    ) {
        require(_globalTreasury != address(0), "Global treasury missing");
        require(_boostTreasury != address(0), "Boost treasury missing");
        require(_vault != address(0), "Vault missing");
        require(_ybNFT != address(0), "YBNFT missing");

        globalTreasury = _globalTreasury;
        boostTreasury = _boostTreasury;
        hedgepieVault = _vault;
        hedgepieYBNFT = _ybNFT;
        hedgepieToken = _hpieToken;
    }

    function setPercent(PercentType percentType, uint256 percent)
        public
        onlyOwner
    {
        if (percentType == PercentType.GLOBAL) {
            globalPercent = percent;
        } else if (percentType == PercentType.BOOST) {
            boostPercent = percent;
        } else if (percentType == PercentType.VAULT) {
            vaultPercent = percent;
        }
    }

    function distribute(uint256 amount) external returns (bool) {
        require(msg.sender == hedgepieYBNFT);

        IBEP20(hedgepieToken).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

        // send to VAULT
        uint256 vaultAmount = amount.mul(vaultPercent).div(1e4);
        IBEP20(hedgepieToken).safeTransfer(hedgepieVault, vaultAmount);

        // send to global treasury
        uint256 globalAmount = amount.mul(globalPercent).div(1e4);
        IBEP20(hedgepieToken).safeTransfer(globalTreasury, globalAmount);

        // send to boost treasury
        uint256 boostAmount = amount.mul(boostPercent).div(1e4);
        IBEP20(hedgepieToken).safeTransfer(boostTreasury, boostAmount);

        emit Distribute(amount, vaultAmount, boostAmount, globalAmount);

        return true;
    }
}
