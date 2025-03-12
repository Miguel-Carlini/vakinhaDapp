// import { useEffect, useState, useCallback } from "react";
// import { ethers } from "ethers";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Adicionando as importações necessárias
// import VakinhaFactoryArtifact from "./artifacts/contracts/VakinhaFactory.sol/VakinhaFactory.json";
// import VakinhaArtifact from "./artifacts/contracts/Vakinha.sol/Vakinha.json";
import {Home} from "./components/Home";
import {VakinhaPage} from "./components/VakinhaPage";

// const VAKINHA_FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
// const VakinhaFactoryABI = VakinhaFactoryArtifact.abi;
// const VakinhaABI = VakinhaArtifact.abi;

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
