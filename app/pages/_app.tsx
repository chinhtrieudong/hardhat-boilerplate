import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./components/common/Layout/Layout";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "../store/web3Store";

interface CustomAppProps extends AppProps {
  Component: AppProps["Component"] & {
    title?: string;
  };
}

function MyApp({ Component, pageProps }: CustomAppProps) {
  const title = Component.title || "Default title";

  return (
    <Web3Provider>
      <Layout>
        <Head>
          <title>{title}</title>
        </Head>
        <Component {...pageProps} />
        <Toaster />
      </Layout>
    </Web3Provider>
  );
}

export default MyApp;
