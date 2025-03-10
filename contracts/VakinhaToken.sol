// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VakinhaToken is ERC20 {
    constructor() ERC20("VakinhaToken", "VKT") {
        _mint(msg.sender, 1000000 * 10**decimals()); // Mint inicial para o criador
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
