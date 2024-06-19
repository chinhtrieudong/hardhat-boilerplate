import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe("Token contract", function () {
  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("MonoNFT");
    const Marketplace = await ethers.getContractFactory("NFTMarketplace");
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const marketplace = await Marketplace.deploy(ethers.utils.parseEther("0.01"));
    const monoNFT = await Token.deploy(marketplace.address);

    await monoNFT.deployed();
    await marketplace.deployed();

    return { Token, marketplace, Marketplace, hardhatToken: monoNFT, owner, addr1, addr2, addr3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);

      await hardhatToken.giveAway(addr1.address);
    });
  });

  describe("List NFT", function () {
    it("Should list/delist NFT", async function () {
      const { hardhatToken, marketplace, addr1 } = await loadFixture(deployTokenFixture);
      await hardhatToken.giveAway(addr1.address);
      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(1);

      const listingPrice = await marketplace.listingPrice();
      await hardhatToken.connect(addr1).approve(marketplace.address, 0);

      await marketplace.connect(addr1).listNft(hardhatToken.address, 0, ethers.utils.parseEther("0.1"), {
        value: listingPrice,
      });

      expect(await hardhatToken.ownerOf(0)).to.equal(marketplace.address);

      await marketplace.connect(addr1).delistNft(0);
      expect(await hardhatToken.ownerOf(0)).to.equal(addr1.address);
    });

    // it("Should delist NFT", async function () {
    //   const { hardhatToken, marketplace, addr1 } = await loadFixture(deployTokenFixture);
    //   await hardhatToken.giveAway(addr1.address);
    //   expect(await hardhatToken.balanceOf(addr1.address)).to.equal(1);

    //   const listingPrice = await marketplace.listingPrice();
    //   await hardhatToken.connect(addr1).approve(marketplace.address, 0);

    //   await marketplace.connect(addr1).listNft(hardhatToken.address, 0, ethers.utils.parseEther("0.1"), {
    //     value: listingPrice,
    //   });

    //   expect(await hardhatToken.ownerOf(0)).to.equal(marketplace.address);

    //   await marketplace.connect(addr1).delistNft(0);
    //   expect(await hardhatToken.ownerOf(0)).to.equal(addr1.address);
    // })
    it("Should change price of NFT", async function () {
      const { hardhatToken, marketplace, addr1 } = await loadFixture(
        deployTokenFixture
      );

      await hardhatToken.giveAway(addr1.address);
      const listingPrice = await marketplace.listingPrice();

      await hardhatToken.connect(addr1).approve(marketplace.address, 0);

      await marketplace.connect(addr1).listNft(hardhatToken.address, 0, ethers.utils.parseEther("0.1"), {
        value: listingPrice,
      });


      await marketplace.connect(addr1).changeNftPrice(0, ethers.utils.parseEther("0.2"));

      expect(await marketplace.nftPrice(0)).to.equal(ethers.utils.parseEther("0.2"));

    })
  });


  it("should buy  NFT", async function () {
    const { hardhatToken, marketplace, addr1, addr2, addr3 } = await loadFixture(
      deployTokenFixture
    );

    await hardhatToken.giveAway(addr1.address);
    const listingPrice = await marketplace.listingPrice();

    await hardhatToken.connect(addr1).approve(marketplace.address, 0);

    await marketplace.connect(addr1).listNft(hardhatToken.address, 0, ethers.utils.parseEther("0.3"), {
      value: listingPrice,
    });

    await marketplace.connect(addr2).buyNft(0, { value: ethers.utils.parseEther("0.3") });

    expect(await hardhatToken.ownerOf(0)).to.equal(addr2.address);
    expect(await marketplace.isSold(0)).to.equal(true);

    marketplace
      .connect(addr3)
      .buyNft(0, { value: ethers.utils.parseEther("0.3") })
      .catch(() => { })
      .then(() => { throw Error("Should not be able to buy sold NFT") });

    await hardhatToken.connect(addr2).approve(marketplace.address, 0);

    await marketplace
      .connect(addr2).listNft(hardhatToken.address, 0, ethers.utils.parseEther("0.3"), {
        value: listingPrice,
      });

    expect(await hardhatToken.ownerOf(0)).to.equal(marketplace.address);
    expect((await marketplace.items(1)).tokenId).to.equal(0);
  })
});
