// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VakinhaToken is ERC20 {
    address public owner;

    constructor() ERC20("VakinhaToken", "VKT") {
        owner = msg.sender;  // Define o proprietário como o criador do contrato
        _mint(msg.sender, 1000000 * 10**decimals()); // Mint inicial para o criador
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, 'Somente o proprietario pode executar esta acao');
        _;
    }

    function mint(address to, uint256 amount) external onlyOwner{
        _mint(to, amount);
    }
}
