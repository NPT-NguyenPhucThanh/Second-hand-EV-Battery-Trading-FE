import React, { useEffect } from "react";

import PromotionBanner from "../components/PromotionBanner";
import Listing from "../components/Listing";

function Home() {
  // CUỘN LÊN ĐẦU TRANG KHI VÀO TRANG CHỦ
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <PromotionBanner />
      <Listing />
    </>
  );
}

export default Home;