const hre = require("hardhat");

async function main() {

    // ethers is avaialble in the global scope
    const [deployer] = await hre.ethers.getSigners();
    console.log(
      "Deploying the contracts with the account:",
      await deployer.getAddress()
    );
  
    console.log("Account balance:", (await deployer.getBalance()).toString());

     // Deploy do VakinhaFactory, passando o endereço do token
     const VakinhaFactory = await hre.ethers.getContractFactory("VakinhaFactory");
     const factory = await VakinhaFactory.deploy();
     await factory.deployed();
     console.log("VakinhaFactory deployed at:", factory.address);
  
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  
