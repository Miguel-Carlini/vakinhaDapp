import { ethers } from 'ethers';

import VakinhaTokenArtifact from "./artifacts/contracts/VakinhaToken.sol/VakinhaToken.json";
import VakinhaFactoryArtifact from "./artifacts/contracts/VakinhaFactory.sol/VakinhaFactory.json";
import VakinhaArtifact from "./artifacts/contracts/Vakinha.sol/Vakinha.json";

// Endereço do contrato VakinhaToken, VakinhaFactory e Vakinha (substitua pelos endereços reais após o deploy)
const vakinhaTokenAddress = "ENDEREÇO_DO_CONTRATO_VAKINHA_TOKEN";
const vakinhaFactoryAddress = "ENDEREÇO_DO_CONTRATO_VAKINHA_FACTORY";
const vakinhaAddress = "ENDEREÇO_DO_CONTRATO_VAKINHA";

// ABI do contrato VakinhaToken
const vakinhaTokenABI = VakinhaTokenArtifact.abi;

// ABI do contrato VakinhaFactory
const vakinhaFactoryABI = VakinhaFactoryArtifact.abi;

// ABI do contrato Vakinha (para interações de doações)
const vakinhaABI = VakinhaArtifact.abi;

let provider;
let signer;

// Função para conectar ao MetaMask
export const connectMetaMask = async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = web3Provider.getSigner();
            setAccount(accounts[0]);
            setContract(new ethers.Contract(contractAddress, contractABI, signer));
        } catch (error) {
            console.error("Erro ao conectar ao MetaMask:", error);
            alert("Falha ao conectar ao MetaMask. Tente novamente.");
        }
    } else {
        console.error("MetaMask não encontrado. Instale o MetaMask.");
        alert("MetaMask não encontrado. Instale o MetaMask.");
    }
};

useEffect(() => {
    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = web3Provider.getSigner();
            setContract(new ethers.Contract(contractAddress, contractABI, signer));
        }
    };

    if (window.ethereum) {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
        if (window.ethereum) {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
    };
}, []);

export const getVakinhaTokenContract = () => {
  return new ethers.Contract(vakinhaTokenAddress, vakinhaTokenABI, signer);
};

export const getVakinhaFactoryContract = () => {
  return new ethers.Contract(vakinhaFactoryAddress, vakinhaFactoryABI, signer);
};

export const getVakinhaContract = (vakinhaAddress) => {
  return new ethers.Contract(vakinhaAddress, vakinhaABI, signer);
};