import { Contract } from "ethers";
import { network, artifacts, ethers } from "hardhat";
const path = require("path");
import { MonoNFT } from "../typechain-types";
const fs = require("fs");

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

  const marketplaceContract = await NFTMarketplace.deploy(ethers.utils.parseEther("0.1"));
  await marketplaceContract.deployed();
  const nft = await Token.deploy(marketplaceContract.address) as MonoNFT;
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

  const targetAddress = "0xA03a771B9d4D36b05f28aAF6edD18A5730cf62C1";

  await deployer.sendTransaction({
    to: targetAddress,
    value: ethers.utils.parseEther("100.0"),
    gasLimit: 21001
  })

  // const gasEstimate = await deployer.estimateGas({
  //   to: targetAddress,
  //   value: ethers.utils.parseEther("100.0"),
  // });
  // console.log("Estimated gas:", gasEstimate.toString());

  console.log("faucet to " + targetAddress);

  const count = 10;

  // giveaway
  await mintNft(targetAddress, count, nft);
  console.log("[DEBUG] Minted " + count + " NFTs");
}

const mintNft = async (address: string, count: number, nft: MonoNFT) => {
  const gasLimit = 3000000; // Example: Increase gas limit as needed
  await Promise.all(
    (
      await Promise.all(
        new Array(count).fill(0).map((_, i) => nft.giveAway(address, { gasLimit }))
      )
    ).map((tx) => tx.wait())
  );
};



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

  const contractsDir = path.join(__dirname, "..", "app", "contracts");

  // Ensure the parent directories exist
  // const appDir = path.join(__dirname, "..", "app");


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
