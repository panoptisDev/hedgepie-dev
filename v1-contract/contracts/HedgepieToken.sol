// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./libraries/SafeMath.sol";
import "./type/BEP20.sol";
import "./type/AdminAccessRoles.sol";

contract HedgepieToken is
    AdminAccessRoles(msg.sender),
    BEP20("Hedgepie Token", "HPIE")
{
    using SafeMath for uint256;
    uint256 private _cap;

    constructor(uint256 cap_) {
        require(cap_ > 0, "BEP20Capped: cap is 0");
        _cap = cap_;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address _to, uint256 _amount) external onlyMintUser {
        require(
            totalSupply().add(_amount) <= _cap,
            "BEP20Capped: cap exceeded"
        );
        _mint(_to, _amount);
    }

    function isCapReach() external view returns (bool) {
        return totalSupply() == _cap;
    }

    function maxCap() external view returns (uint256) {
        return _cap;
    }
}
