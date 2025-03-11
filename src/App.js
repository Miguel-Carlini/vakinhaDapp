import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; // Adicionando as importações necessárias
import VakinhaFactoryArtifact from "./artifacts/contracts/VakinhaFactory.sol/VakinhaFactory.json";
import VakinhaArtifact from "./artifacts/contracts/Vakinha.sol/Vakinha.json";

const VAKINHA_FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const VakinhaFactoryABI = VakinhaFactoryArtifact.abi;
const VakinhaABI = VakinhaArtifact.abi;

function Home() {
  const [vakinhas, setVakinhas] = useState([]);
  const [nome, setNome] = useState("");
  const [meta, setMeta] = useState("");
  const [factoryContract, setFactoryContract] = useState(null);
  const [account, setAccount] = useState(null); // Novo estado para armazenar a conta

  useEffect(() => {
    async function connectWallet() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          VAKINHA_FACTORY_ADDRESS,
          VakinhaFactoryABI,
          signer
        );
        setAccount(accounts[0]);
        setFactoryContract(contract);
        fetchVakinhas();
      } else {
        alert("Instale um provedor Web3 como MetaMask");
      }
    }
    connectWallet();
  }, []);

  // Função para conectar a carteira quando o botão for clicado
  const handleConnectWallet = async() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAccount = await signer.getAddress();
      setAccount(userAccount);
    } else {
      alert("Instale um provedor Web3 como MetaMask");
    }
  }

  const fetchVakinhas = async () => {
    try {
      const addresses = await factoryContract.listarVakinhas();
      console.log("Endereços das vakinhas:", addresses);
      if (addresses && addresses.length > 0) {
        setVakinhas(addresses);
      } else {
        console.log("Nenhuma vakinha criada ainda.");
      }
    } catch (error) {
      console.error("Erro ao buscar vakinhas:", error);
    }
  };

  const criarVakinha = async() => {
    if (!factoryContract) return;
    try {
      const tx = await factoryContract.criarVakinha(nome, ethers.utils.parseEther(meta));
      await tx.wait();
      fetchVakinhas();
    } catch (error) {
      console.error("Erro ao criar vakinha:", error);
    }
  }

  return (
    <div>
      <h1>Vakinhas</h1>
      <button onClick={handleConnectWallet}>
        {account ? `Conectado: ${account}` : "Conectar Carteira"}
      </button>
      <ul>
        {vakinhas.map((address) => (
          <li key={address}>
            <Link to={`/vakinha/${address}`}>{address}</Link>
          </li>
        ))}
      </ul>
      <h2>Criar nova Vakinha</h2>
      <input placeholder="Nome" onChange={(e) => setNome(e.target.value)} />
      <input placeholder="Meta (ETH)" onChange={(e) => setMeta(e.target.value)} />
      <button onClick={criarVakinha}>Criar</button>
      <ul>
        {vakinhas.length > 0 ? (
          // Exibe as vakinhas se houver
          vakinhas.map((address, index) => (
            <li key={index}>
              <Link to={`/vakinha/${address}`}>{address}</Link>
            </li>
          ))
        ) : (
          // Caso não haja vakinhas criadas, exibe uma mensagem
          <p>Nenhuma vakinha criada ainda.</p>
        )}
      </ul>
    </div>
  );
}

function VakinhaPage({ address }) {
  const [vakinha, setVakinha] = useState(null);
  const [valor, setValor] = useState("");
  const [vakinhaContract, setVakinhaContract] = useState(null);

  useEffect(() => {
    async function fetchVakinha() {
      if (!address) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, VakinhaABI, signer);
      setVakinhaContract(contract);

      const nome = await contract.nome();
      const meta = ethers.utils.formatEther(await contract.meta());
      const saldo = ethers.utils.formatEther(await contract.saldo());
      setVakinha({ nome, meta, saldo });
    }
    fetchVakinha();
  }, [address]);

  const doar = async() => {
    if (!vakinhaContract) return;
    try {
      const tx = await vakinhaContract.doar("Doador", ethers.utils.parseEther(valor), false);
      await tx.wait();
      alert("Doação realizada!");
    } catch (error) {
      console.error("Erro ao doar:", error);
    }
  }

  if (!vakinha) return <p>Carregando...</p>;

  return (
    <div>
      <h1>{vakinha.nome}</h1>
      <p>Meta: {vakinha.meta} ETH</p>
      <p>Saldo: {vakinha.saldo} ETH</p>
      <input placeholder="Valor (ETH)" onChange={(e) => setValor(e.target.value)} />
      <button onClick={doar}>Doar</button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vakinha/:address" element={<VakinhaPage />} />
      </Routes>
    </Router>
  );
}
