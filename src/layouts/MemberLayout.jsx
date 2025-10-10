import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Outlet } from "react-router";

function MemberLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default MemberLayout;
