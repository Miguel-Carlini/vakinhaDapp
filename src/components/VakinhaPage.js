import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import VakinhaArtifact from "../artifacts/contracts/Vakinha.sol/Vakinha.json";

export function VakinhaPage() {
    const { address } = useParams();        // <- Obtemos o parâmetro :address da URL
    const [vakinha, setVakinha] = useState(null);
    const [valor, setValor] = useState("");
    const [vakinhaContract, setVakinhaContract] = useState(null);
    const VakinhaABI = VakinhaArtifact.abi;

    useEffect(() => {
        async function fetchVakinha() {
            if (!address) return;
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(address, VakinhaABI, signer);
                setVakinhaContract(contract);

                const nome = await contract.nome();
                const meta = ethers.utils.formatEther(await contract.meta());
                const saldo = ethers.utils.formatEther(await contract.saldo());

                setVakinha({ nome, meta, saldo });
            } catch (error) {
                console.error("Erro ao buscar dados da vakinha:", error);
            }
        }
        fetchVakinha();
    }, [address, VakinhaABI]);

    const doar = async () => {
        if (!vakinhaContract) return;
        try {
            let convertedValor = (valor * (10**18)).toString();
            console.log(vakinhaContract.saldoConta());
            const tx = await vakinhaContract.doar("Doador", convertedValor, false);
            await tx.wait();
            alert("Doação realizada!");
        } catch (error) {
            console.error("Erro ao doar:", error);
            alert("Falha ao realizar doação!");
        }
    };

    if (!vakinha) return <p>Carregando...</p>;

    return (
        <div>
            <h1>{vakinha.nome}</h1>
            <p>Meta: {vakinha.meta} ETH</p>
            <p>Saldo: {vakinha.saldo} ETH</p>
            <input
                placeholder="Valor (ETH)"
                onChange={(e) => setValor(e.target.value)}
            />
            <button onClick={doar}>Doar</button>
        </div>
    );
}
