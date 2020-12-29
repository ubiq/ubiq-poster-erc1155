// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/presets/ERC1155PresetMinterPauser.sol";

contract Poster is ERC1155PresetMinterPauser {
    uint256 public constant SHINOBI = 0;

    constructor() public ERC1155PresetMinterPauser("https://poster.ubiqsmart.com/token/{id}") {
        _mint(msg.sender, SHINOBI, 100, "");
    }
}