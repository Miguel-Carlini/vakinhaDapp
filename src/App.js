import { useEffect, useState, useCallback } from "react";
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


    // Função para conectar ao MetaMask
    const connectMetaMask = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = web3Provider.getSigner();
                const contract = new ethers.Contract(
                    VAKINHA_FACTORY_ADDRESS,
                    VakinhaFactoryABI,
                    signer
                );
                setAccount(accounts[0]);
                setFactoryContract(contract);
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
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = web3Provider.getSigner();
                setAccount(accounts[0]);
                setFactoryContract(new ethers.Contract(VAKINHA_FACTORY_ADDRESS, VakinhaFactoryABI, signer));
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

  // Usar useCallback para memorizar a função fetchVakinhas
  const fetchVakinhas = useCallback(async () => {
    if (!factoryContract) {
      console.error("Contrato não carregado");
      return;
    }

    try {
      const addresses = await factoryContract.listarVakinhas();
      console.log("Endereços das vakinhas:", addresses);
      if (addresses && addresses.length > 0) {
        // Busca as informações detalhadas de cada vakinha
        const vakinhasData = await Promise.all(addresses.map(async (address) => {
          const vakinhaContract = new ethers.Contract(address, VakinhaABI, factoryContract.signer);
          const nome = await vakinhaContract.nome();
          const meta = ethers.utils.formatEther(await vakinhaContract.meta());
          const saldo = ethers.utils.formatEther(await vakinhaContract.saldo());
          return { address, nome, meta, saldo };
        }));
        setVakinhas(vakinhasData);
      } else {
        console.log("Nenhuma vakinha criada ainda.");
      }
    } catch (error) {
      console.error("Erro ao buscar vakinhas:", error);
    }
  }, [factoryContract]);

  useEffect(() => {
    if (factoryContract) {
      fetchVakinhas(); // Chama fetchVakinhas quando o contrato for carregado
    }
  }, [factoryContract, fetchVakinhas]); // Inclui fetchVakinhas na dependência

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
      {!account ? (
            <button
                onClick={connectMetaMask}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Conectar ao MetaMask
            </button>
        ) : (
            <div>
                <p><strong>Conta conectada:</strong> {account}</p>
            </div>
        )}
      <h2>Criar nova Vakinha</h2>
      <input placeholder="Nome" onChange={(e) => setNome(e.target.value)} />
      <input placeholder="Meta (ETH)" onChange={(e) => setMeta(e.target.value)} />
      <button onClick={criarVakinha}>Criar</button>
      <ul>
        {vakinhas.length > 0 ? (
            vakinhas.map((vakinha, index) => (
                <li key={index}>
                <Link to={`/vakinha/${vakinha.address}`}>
                    <strong>{vakinha.nome}</strong> - Meta: {vakinha.meta} ETH - Saldo: {vakinha.saldo} ETH
                </Link>
                </li>
            ))
            ) : (
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
