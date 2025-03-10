// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VakinhaToken.sol";
import "./VakinhaFactory.sol";

contract Vakinha {
    address public criador;
    string public nome;
    uint256 public meta;
    uint256 public saldo;
    bool public encerrada;
    VakinhaToken public token;

    event DoacaoRecebida(address indexed doador, uint256 valor);
    event VakinhaEncerrada(address indexed criador, uint256 valorFinal);

    modifier somenteCriador() {
        require(msg.sender == criador, "Apenas o criador pode executar esta acao");
        _;
    }
    
    modifier naoEncerrada() {
        require(!encerrada, "A vakinha ja foi encerrada");
        _;
    }

    constructor(address _criador, string memory _nome, uint256 _meta, address tokenAddress) {
        criador = _criador;
        nome = _nome;
        meta = _meta;
        token = VakinhaToken(tokenAddress);
    }

    function doar(uint256 amount) external naoEncerrada {
        require(amount > 0, "Valor da doacao deve ser maior que zero");
        
        // Verifica se o doador tem saldo suficiente
        require(token.balanceOf(msg.sender) >= amount, "Saldo insuficiente");
        
        // Verifica se o contrato tem permissão para transferir os tokens
        require(token.allowance(msg.sender, address(this)) >= amount, "Aprovacao insuficiente");

        require(token.transferFrom(msg.sender, address(this), amount), "Transferencia falhou");
        saldo += amount;
        emit DoacaoRecebida(msg.sender, amount);

        // Verifica se a meta foi atingida e encerra a vakinha automaticamente
        if (saldo >= meta) {
            encerrarVakinha();
            emit VakinhaEncerrada(criador, saldo);
        }
    }

    function encerrarVakinha() private somenteCriador naoEncerrada {
        encerrada = true;
        emit VakinhaEncerrada(criador, saldo);
        require(token.transfer(criador, saldo), "Transferencia falhou");
    }

    function cancelarVakinha() external somenteCriador naoEncerrada {
        saldo = 0; // Zera o saldo
        emit VakinhaEncerrada(criador, saldo); // Emite um evento
        encerrada = true; // Marca a vakinha como encerrada
        require(token.transfer(criador, saldo), "Transferencia falhou"); // Devolve o saldo ao criador
    }
}