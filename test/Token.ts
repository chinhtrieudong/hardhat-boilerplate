import { expect } from "chai";

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("Token contract", function () {
  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("MonoNFT");
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const marketplaceContract = await NFTMarketplace.deploy();
    await marketplaceContract.deployed();
    const nft = await Token.deploy(marketplaceContract.address);
    await nft.deployed();

    return {
      Token,
      NFTMarketplace,
      marketplaceContract,
      nft,
      owner,
      addr1,
      addr2,
    };
  }

  describe("Deployment", function () {
    it("Should set the right marketplace address", async function () {
      const { nft, marketplaceContract, owner, addr1 } =
        await loadFixture(deployTokenFixture);

      expect((await nft.marketplaceAddress()).toLowerCase()).to.equal(
        marketplaceContract.address.toLowerCase()
      );
    });

    it("Should mint a token", async function () {
      const { nft, marketplaceContract, owner, addr1 } =
        await loadFixture(deployTokenFixture);
      await nft.giveAway(addr1.address);

      expect(await nft.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should list a token", async function () {
      const { nft, marketplaceContract, owner, addr1 } =
        await loadFixture(deployTokenFixture);
      await nft.giveAway(addr1.address);
      await nft.connect(addr1).approve(marketplaceContract.address, 1);
      await marketplaceContract
        .connect(addr1)
        .listItem(nft.address, 1, ethers.utils.parseEther("0.1"));

      console.log(await marketplaceContract.getListingItems());

      // expect(await nft.ownerOf(1)).to.equal(
      //   marketplaceContract.address
      // );
    });
  });
});
