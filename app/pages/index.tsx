import { useWeb3Store } from "../store/web3Store";
import MyNFT from "./components/home/MyNFTs";
import { MarketplaceNFTs } from "./components/home/MarketplaceNFTs";
import { MarketplaceUnsold } from "./components/home/MarketplaceUnsold";

const Home = () => {
  const { isConnected } = useWeb3Store();

  return (
    <main className="space-y-2">
      {isConnected && <MyNFT />}

      <MarketplaceNFTs />
      <MarketplaceUnsold />
    </main>
  );
};

Home.title = "Home Page";

export default Home;
