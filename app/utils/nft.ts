import axios from "axios";
import { useWeb3Store } from "../store/web3Store";
import { BaseListReturn } from "./marketplace";

export const getUserNFTs = async (
  _url: string,
  walletAddress: string,
  offset: number,
  limit: number
): Promise<BaseListReturn> => {
  const { nftContract } = useWeb3Store.getState();

  const totalNfts = await nftContract!.balanceOf(walletAddress);

  if (totalNfts.toNumber() < offset)
    return {
      items: [],
      meta: {
        totalItem: 0,
        totalPage: 0,
      },
    };

  return {
    items: (
      await Promise.all(
        Array.from(Array(limit).keys()).map(async (i) => {
          if (i + offset >= totalNfts.toNumber()) return null;

          const nftId = (
            await nftContract!.tokenOfOwnerByIndex(walletAddress, i + offset)
          ).toNumber();

          const tokenURI = await nftContract!.tokenURI(nftId);

          return {
            ...(await axios.get(tokenURI)).data,
            tokenId: nftId,
          };
        })
      )
    ).filter((nft) => nft),
    meta: {
      totalItem: totalNfts.toNumber(),
      totalPage: Math.ceil(totalNfts.toNumber() / limit),
    },
  };
};

export const getNFTById = async (_url: string, tokenId: number) => {
  const { nftContract } = useWeb3Store.getState();

  if (!nftContract) return null;

  const [tokenURI, owner, getApproved] = await Promise.all([
    nftContract.tokenURI(tokenId),
    nftContract.ownerOf(tokenId),
    nftContract.getApproved(tokenId),
  ]);

  return {
    ...(await axios.get(tokenURI)).data,
    tokenId,
    owner,
    getApproved,
  };
};
