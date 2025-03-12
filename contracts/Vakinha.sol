// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VakinhaFactory.sol";

contract Vakinha {
    address payable public endereco;
    string public nome;
    uint256 public meta;
    uint256 public saldo;
    bool public encerrada;

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

    constructor(address payable _criador, string memory _nome, uint256 _meta) {
        endereco = _criador;
        nome = _nome;
        meta = _meta;
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

    function doar(string memory nomeDoador, bool anonimo) public payable naoEncerrada {
        require(msg.value > 0, "Valor da doacao deve ser maior que zero");
        
        // Verifica se o doador tem saldo suficiente
        //require(token.balanceOf(msg.sender) >= amount, "Saldo insuficiente");

        // Verifica se o contrato tem permissão para transferir os tokens
        //require(token.allowance(msg.sender, address(this)) >= amount, "Aprovacao insuficiente");

        // Usando `call()` para transferir ETH
        (bool success, ) = endereco.call{value: msg.value}("");
        require(success, "Falha na transferencia de ETH!");

        saldo += msg.value;
        doacoes[msg.sender] += msg.value;

        doadoresAnonimos[msg.sender] = anonimo;
        incluirDoador(msg.sender,nomeDoador);

        emit DoacaoRecebida(msg.sender, msg.value);

        // Verifica se a meta foi atingida e encerra a vakinha automaticamente
        if (saldo >= meta) {
            encerrarVakinha();
            emit VakinhaEncerrada(endereco, saldo);
        }
    }

    function encerrarVakinha() public somenteCriador naoEncerrada {
        encerrada = true;
        emit VakinhaEncerrada(endereco, saldo);
        (bool success, ) = endereco.call{value: saldo}("");
        require(success, "Falha na transferencia de ETH!");
    }

    function cancelarVakinha() public somenteCriador naoEncerrada {
        saldo = 0; // Zera o saldo
        emit VakinhaEncerrada(endereco, saldo); // Emite um evento
        encerrada = true; // Marca a vakinha como encerrada
        (bool success, ) = endereco.call{value: saldo}("");
        require(success, "Falha na transferencia de ETH!");
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