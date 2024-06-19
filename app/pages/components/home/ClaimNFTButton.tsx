import { ethers } from "ethers";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoGift } from "react-icons/io5";
import { useMatchMutate } from "../../../lib/common/hooks/useMatchMutate";
import {
  GET_TOTAL_PAGE_KEY,
  GET_USER_NFTS_KEY,
} from "../../../lib/home/hooks/getUserNFTs";
import { useWeb3Store } from "../../../store/web3Store";
import Button, { ButtonPreset } from "../common/Button/Button";

type Props = {};

function ClaimNFTButton({}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { walletAddress, isConnected, nftContract, isInit } = useWeb3Store();
  const matchMutate = useMatchMutate();

  return (
    <Button
      className="px-3 py-1"
      onClick={async () => {
        if (!window.ethereum || !nftContract) {
          return;
        }

        try {
          setIsLoading(true);

          const signerProvider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          const signerSigner = signerProvider.getSigner();
          const connectNFTContract = nftContract.connect(signerSigner);

          await Promise.all([
            (
              await connectNFTContract?.giveAway(
                await signerSigner.getAddress()
              )
            ).wait(),
          ]);

          matchMutate(GET_USER_NFTS_KEY);
          matchMutate(GET_TOTAL_PAGE_KEY);

          toast.success("NFT sent to your wallet!");
        } catch (error: any) {
          toast.error(error.message);
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {!isLoading ? (
        <div className="flex items-center gap-2">
          <IoGift />
          <span>Claim free NFT</span>
        </div>
      ) : (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </>
      )}
    </Button>
  );
}

export default ClaimNFTButton;
