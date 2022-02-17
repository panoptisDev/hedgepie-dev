// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

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

    uint256 public globalPercent;
    uint256 public boostPercent;
    uint256 public vaultPercent;

    enum PercentType {
        GLOBAL,
        BOOST,
        VAULT
    }

    event Distribute();

    constructor(
        address _globalTreasury,
        address _boostTreasury,
        address _vault,
        address _ybNFT
    ) {
        require(_globalTreasury != address(0));
        require(_boostTreasury != address(0));
        require(_vault != address(0));
        require(_ybNFT != address(0));

        HedgepieVault = _vault;
        BoostTreasury = _boostTreasury;
        GlobalTreasury = _globalTreasury;
        HedgepieYBNFT = _ybNFT;
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

    function distribute() external returns (bool) {
        require(msg.sender == HedgepieYBNFT);

        return true;
    }
}
