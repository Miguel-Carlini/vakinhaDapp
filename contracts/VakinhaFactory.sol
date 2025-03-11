// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VakinhaToken.sol";
import "./Vakinha.sol";

contract VakinhaFactory {
    event VakinhaCriada(address indexed criador, address vakinha);
    
    address[] public vakinhas;
    VakinhaToken public token;
    
    constructor(address tokenAddress) {
        token = VakinhaToken(tokenAddress);
    }
    
    function criarVakinha(string memory _nome, uint256 _meta) external {
        Vakinha novaVakinha = new Vakinha(msg.sender, _nome, _meta, address(token));
        vakinhas.push(address(novaVakinha));
        emit VakinhaCriada(msg.sender, address(novaVakinha));
    }
    
    function listarVakinhas() external view returns (address[] memory) {
        return vakinhas;
    }

    function obterInformacoesVakinha(address vakinhaAddress) external view returns (
    address endereco,
    string memory nome, 
    uint256 meta, 
    uint256 saldo, 
    bool encerrada
    ) {
        Vakinha vakinha = Vakinha(vakinhaAddress);  // Instancia o contrato Vakinha
        endereco = Vakinha.endereco(); //acessa o endereco
        nome = vakinha.nome();    // Acessa o nome da Vakinha
        meta = vakinha.meta();    // Acessa a meta
        saldo = vakinha.saldo();  // Acessa o saldo acumulado
        encerrada = vakinha.encerrada();  // Verifica se a Vakinha foi encerrada
    }
}