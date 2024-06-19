import { Contract } from "ethers";
import { network, artifacts, ethers } from "hardhat";
const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
      "gets automatically created and destroyed every time. Use the Hardhat" +
      " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("MonoNFT");
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");

  const marketplaceContract = await NFTMarketplace.deploy();
  await marketplaceContract.deployed();
  const nft = await Token.deploy(marketplaceContract.address);
  await nft.deployed();

  console.log("Token address:", nft.address);
  console.log("marketplace address:", marketplaceContract.address);


  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles({
    marketplaceContract,
    marketplaceName: "NFTMarketplace",
    nftContract: nft,
    nftName: "MonoNFT"
  });

  await deployer.sendTransaction({
    to: "0xA03a771B9d4D36b05f28aAF6edD18A5730cf62C1",
    value: ethers.utils.parseEther("100.0")
  })

  console.log("faucet to 0xA03a771B9d4D36b05f28aAF6edD18A5730cf62C1");

}

function saveFrontendFiles({
  nftContract,
  marketplaceContract,
  nftName,
  marketplaceName
}:
  {
    nftContract: Contract,
    marketplaceContract: Contract,
    nftName: string,
    marketplaceName: string
  }
) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "app", "contracts");

  // Ensure the parent directories exist
  const appDir = path.join(__dirname, "..", "app");


  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ nftAddress: nftContract.address, marketplaceAddress: marketplaceContract.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync(nftName);
  const MarketplaceArtifact = artifacts.readArtifactSync(marketplaceName);

  fs.writeFileSync(
    path.join(contractsDir, nftName + ".json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
  fs.writeFileSync(
    path.join(contractsDir, marketplaceName + ".json"),
    JSON.stringify(MarketplaceArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
