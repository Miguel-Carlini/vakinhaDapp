// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Vakinha.sol";

contract VakinhaFactory {
    event VakinhaCriada(address indexed criador, address vakinha);
    
    address[] public vakinhas;
    
    receive() external payable {}

    fallback() external payable {}

    constructor() {}
    
    function criarVakinha(string memory _nome, uint256 _meta) public {
        Vakinha novaVakinha = new Vakinha(payable(msg.sender), _nome, _meta);
        vakinhas.push(address(novaVakinha));
        emit VakinhaCriada(msg.sender, address(novaVakinha));
    }
    
    function listarVakinhas() public view returns (address[] memory) {
        return vakinhas;
    }

    function obterInformacoesVakinha(address vakinhaAddress) public view returns (
    address endereco,
    string memory nome, 
    uint256 meta, 
    uint256 saldo, 
    bool encerrada
    ) {
        Vakinha vakinha = Vakinha(vakinhaAddress);  // Instancia o contrato Vakinha
        endereco = vakinha.endereco(); //acessa o endereco
        nome = vakinha.nome();    // Acessa o nome da Vakinha
        meta = vakinha.meta();    // Acessa a meta
        saldo = vakinha.saldo();  // Acessa o saldo acumulado
        encerrada = vakinha.encerrada();  // Verifica se a Vakinha foi encerrada
    }
}