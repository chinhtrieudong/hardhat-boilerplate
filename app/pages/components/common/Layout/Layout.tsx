import React from "react";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return (
    <>
      <div className="max-w-5xl mx-auto">
        <Header />

        <main>{children}</main>

        <Footer />
      </div>
    </>
  );
}

export default Layout;
