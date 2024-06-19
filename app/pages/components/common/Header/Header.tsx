import React, { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import Button, { ButtonPreset } from "../Button/Button";
import {
  CHAIN_ID,
  CHAIN_NAME,
  useWeb3Store,
} from "../../../../store/web3Store";
import toast from "react-hot-toast";

type Props = {};

declare global {
  interface Window {
    ethereum: any;
  }
}

function Header({}: Props) {
  const { connect, isConnected, walletAddress, disconnect } = useWeb3Store();

  const [chainId, setChainId] = useState<any>(null);

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    setChainId(window.ethereum.chainId);
  }, [ethers]);


  // change network
  const changeNetwork = async () => {
    if (!chainId) {
      toast.error("Please install Metamask");
    }

    if (window.ethereum.chainId !== CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_ID }],
        });
      } catch (err: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainName: "Localnet",
                chainId: CHAIN_ID,
                nativeCurrency: {
                  name: "ETH",
                  decimals: 18,
                  symbol: "ETH",
                },
                rpcUrls: ["http://localhost:8545"],
              },
            ],
          });
        }
      }
    }
  };

  return (
    <div className="m-4 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <Button onClick={() => connect()}>
          <span>{isConnected ? walletAddress : "Connect"}</span>
        </Button>

        {isConnected && (
          <Button onClick={() => disconnect()} preset={ButtonPreset.Outlined}>
            <span>Disconnect</span>
          </Button>
        )}
      </div>

      {chainId !== CHAIN_ID && (
        <div className="bg-yellow-100 p-2 rounded-md mt-4">
          <p>
            You are not connected to the correct network. Please switch to{" "}
            {CHAIN_NAME}
          </p>

          <div className="h-4"></div>

          <Button onClick={() => changeNetwork()}>
            <span>Change Network</span>
          </Button>
        </div>
      )}
    </div>
  );
}

export default Header;
