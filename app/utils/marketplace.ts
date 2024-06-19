import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useWeb3Store } from "../store/web3Store";
import { ERC721__factory } from "../typechain";

export interface BaseListReturn {
  items: any[];
  meta?: {
    totalItem: number;
    totalPage: number;
  };
}

export const getMarketplaceNFTs = async (
  _url: string,
  offset: number,
  limit: number
): Promise<BaseListReturn> => {
  const { marketplaceContract } = useWeb3Store.getState();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const nfts = await marketplaceContract!.getListingItems(offset, limit);
  const totalItem = await marketplaceContract!.totalListingItems();

  return {
    items: await Promise.all(
      nfts.map(async (nft, index) => {
        const contract = ERC721__factory.connect(nft.tokenAddress, provider);
        const tokenURI = await contract.tokenURI(nft.tokenId);
        const { data } = await axios.get(tokenURI);

        return {
          ...data,
          price: ethers.utils.formatEther(nft.price),
          tokenId: nft.tokenId,
          tokenAddress: nft.tokenAddress,
          marketplaceItemIndex: index + offset,
          isSold: nft.isSold,
        };
      })
    ),
    meta: {
      totalItem: totalItem.toNumber(),
      totalPage: Math.ceil(totalItem.toNumber() / limit),
    },
  };
};

export const getMarketplaceNFTById = async (_url: string, itemId: number) => {
  const { marketplaceContract } = useWeb3Store.getState();

  if (!marketplaceContract) return null;

  const item = await marketplaceContract.listingItems(itemId);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const nftContract = ERC721__factory.connect(item.tokenAddress, provider);

  const tokenId = item.tokenId;

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
    price: ethers.utils.formatEther(item.price),
    marketplaceItemId: itemId,
    isSold: item.isSold,
  };
};

export const getUnsoldItems = async (
  _url: string,
  offset: number,
  limit: number
): Promise<BaseListReturn> => {
  const { marketplaceContract } = useWeb3Store.getState();

  if (!marketplaceContract)
    return {
      items: [],
    };

  const [items, totalItem] = await Promise.all([
    marketplaceContract.getUnsoldItems(offset, limit).then(([items, ids]) =>
      Promise.all(
        items.map(async (item, index) => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const nftContract = ERC721__factory.connect(
            item.tokenAddress,
            provider
          );

          const tokenId = item.tokenId;

          if (item.tokenId.toNumber() === 0) {
            return null;
          }

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
            price: ethers.utils.formatEther(item.price),
            isSold: item.isSold,
            marketplaceItemIndex: ids[index].toNumber(),
          };
        })
      )
    ),
    marketplaceContract.getTotalUnsoldItems(),
  ]);

  return {
    items,
    meta: {
      totalItem: totalItem.toNumber(),
      totalPage: Math.ceil(totalItem.toNumber() / limit),
    },
  };
};
