// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./libraries/SafeBEP20.sol";
import "./libraries/SafeMath.sol";
import "./libraries/Ownable.sol";

contract HedgepieDistributor is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    address public immutable GlobalTreasury;
    address public immutable BoostTreasury;
    address public immutable HedgepieVault;
    address public immutable HedgepieYBNFT;
    address public immutable HedgepieToken;

    uint public globalPercent;
    uint public boostPercent;
    uint public vaultPercent;

    enum PercentType { GLOBAL, BOOST, VAULT }

    event Distribute(uint amount, uint vault, uint boost, uint global);

    constructor(
        address _globalTreasury,
        address _boostTreasury,
        address _vault,
        address _ybNFT,
        address _hpieToken
    ) {
        require(_globalTreasury != address(0));
        require(_boostTreasury != address(0));
        require(_vault != address(0));
        require(_ybNFT != address(0));
        require(_hpieToken != address(0));

        HedgepieVault = _vault;
        BoostTreasury = _boostTreasury;
        GlobalTreasury = _globalTreasury;
        HedgepieYBNFT = _ybNFT;
        HedgepieToken = _hpieToken;
    }

    function setPercent(PercentType percentType, uint percent) public onlyOwner {
        if(percentType == PercentType.GLOBAL) {
            globalPercent = percent;
        } else if(percentType == PercentType.BOOST) {
            boostPercent = percent;
        } else if(percentType == PercentType.VAULT) {
            vaultPercent = percent;
        }
    }

    function distribute(uint amount) external returns(bool) {
        require(msg.sender == HedgepieYBNFT);

        IBEP20( HedgepieToken ).safeTransferFrom(msg.sender, address(this), amount);

        // send to VAULT
        uint vaultAmount = amount.mul(vaultPercent).div(1e4);
        IBEP20( HedgepieToken ).safeTransfer(HedgepieVault, vaultAmount);

        // send to global treasury
        uint globalAmount = amount.mul(globalPercent).div(1e4);
        IBEP20( HedgepieToken ).safeTransfer(GlobalTreasury, globalAmount);

        // send to boost treasury
        uint boostAmount = amount.mul(boostPercent).div(1e4);
        IBEP20( HedgepieToken ).safeTransfer(BoostTreasury, boostAmount);

        emit Distribute(amount, vaultAmount, boostAmount, globalAmount);

        return true;
    }
}