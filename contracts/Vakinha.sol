// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VakinhaToken.sol";
import "./VakinhaFactory.sol";

contract Vakinha {
    address public endereco;
    string public nome;
    uint256 public meta;
    uint256 public saldo;
    bool public encerrada;
    VakinhaToken public token;

    mapping(address => uint256) public doacoes;
    mapping(address => bool) public doadoresAnonimos;
    mapping(address => string) public nomesDoadores;
    address[] public doadores;

    event DoacaoRecebida(address indexed doador, uint256 valor);
    event VakinhaEncerrada(address indexed criador, uint256 valorFinal);

    modifier somenteCriador() {
        require(msg.sender == endereco, "Apenas o criador pode executar esta acao");
        _;
    }
    
    modifier naoEncerrada() {
        require(!encerrada, "A vakinha ja foi encerrada");
        _;
    }

    constructor(address _criador, string memory _nome, uint256 _meta, address tokenAddress) {
        endereco = _criador;
        nome = _nome;
        meta = _meta;
        token = VakinhaToken(tokenAddress);
    }

    function incluirDoador(address doador, string memory nomeDoador) private {
        // Adiciona o doador à lista se ele ainda não estiver nela
        bool jaDoou = false;
        for (uint i = 0; i < doadores.length; i++) {
            if (doadores[i] == doador) {
                jaDoou = true;
                break;
            }
        }

        if (!jaDoou) {
            doadores.push(doador);
            nomesDoadores[doador] = nomeDoador;  // Armazena o nome do doador
        }
    }

    function doar(string memory nomeDoador,uint256 amount, bool anonimo) public naoEncerrada {
        require(amount > 0, "Valor da doacao deve ser maior que zero");
        
        // Verifica se o doador tem saldo suficiente
        require(token.balanceOf(msg.sender) >= amount, "Saldo insuficiente");

        // Verifica se o contrato tem permissão para transferir os tokens
        require(token.allowance(msg.sender, address(this)) >= amount, "Aprovacao insuficiente");

        require(token.transferFrom(msg.sender, address(this), amount), "Transferencia falhou");
        saldo += amount;
        doacoes[msg.sender] += amount;

        doadoresAnonimos[msg.sender] = anonimo;
        incluirDoador(msg.sender,nomeDoador);

        emit DoacaoRecebida(msg.sender, amount);

        // Verifica se a meta foi atingida e encerra a vakinha automaticamente
        if (saldo >= meta) {
            encerrarVakinha();
            emit VakinhaEncerrada(endereco, saldo);
        }
    }

    function saldoConta() public view returns(uint256) {
        return token.balanceOf(msg.sender);
    }

    function encerrarVakinha() public somenteCriador naoEncerrada {
        encerrada = true;
        emit VakinhaEncerrada(endereco, saldo);
        require(token.transfer(endereco, saldo), "Transferencia falhou");
    }

    function cancelarVakinha() public somenteCriador naoEncerrada {
        saldo = 0; // Zera o saldo
        emit VakinhaEncerrada(endereco, saldo); // Emite um evento
        encerrada = true; // Marca a vakinha como encerrada
        require(token.transfer(endereco, saldo), "Transferencia falhou"); // Devolve o saldo ao criador
    }

    // Função para obter a lista de doadores e a quantia doada
    function listarDoadores() public view returns (string[] memory nomes, uint256[] memory quantias) {
        uint256 numDoadores = doadores.length;
        nomes = new string[](numDoadores);
        quantias = new uint256[](numDoadores);

        for (uint256 i = 0; i < numDoadores; i++) {
            address doador = doadores[i];
            if (doadoresAnonimos[doador]) {
                nomes[i] = "Anonimo";
            } else {
                nomes[i] = nomesDoadores[doador]; 
            }
            quantias[i] = doacoes[doador];
        }
    }
}