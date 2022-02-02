// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StableCoin is ERC20 {
    constructor(uint256 initialSupply) ERC20("Stable", "STL") {
        _mint(msg.sender, initialSupply);
    }

    function freeMoney(address recipient, uint256 amount) external {
        _mint(recipient, amount);
    }
}
