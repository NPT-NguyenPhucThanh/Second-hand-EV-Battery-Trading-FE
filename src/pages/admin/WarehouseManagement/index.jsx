import { useEffect, useState } from "react";
import { message, Tabs } from "antd";
import { getWarehouse, getWarehousePending } from "../../../services/warehouseService";
import TableWarehouseList from "./components/TableWarehouseList";
import WarehouseDetailModal from "./components/WarehouseDetailModal";

export default function WarehouseManagement() {
  const [products, setProducts] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingProducts, setPendingProducts] = useState([]);


  const fetchApi = async () => {
  // Sản phẩm trong kho
  const res = await getWarehouse();
  if (res) {
    setProducts(res || []);
  } else {
    messageApi.error("Không nhận được dữ liệu từ server cho sản phẩm trong kho");
  }

  // Sản phẩm chờ nhập kho
  const pendingRes = await getWarehousePending();
  if (pendingRes) {
    setPendingProducts(pendingRes || []);
  } else {
    messageApi.error("Không nhận được dữ liệu từ server cho sản phẩm chờ nhập kho");
  }
};


  useEffect(() => {
    fetchApi();
  }, []);

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleReload = () => {
    fetchApi();
  }
 const inWarehouse = products.filter((p) => p.inWarehouse === true);
 const soldOut = products.filter((p) => p.inWarehouse === false);

const tabItems = [
  {
    key: "1",
    label: `Trong kho (${inWarehouse.length})`,
    children: (
      <TableWarehouseList
        products={inWarehouse}
        onViewDetail={handleViewDetail}
        onReload={handleReload}
        tabType={"inWarehouse"}
      />
    ),
  },
  {
    key: "2",
    label: `Chờ nhập kho (${pendingProducts.length})`,
    children: (
      <TableWarehouseList
        products={pendingProducts}
        onViewDetail={handleViewDetail}
        tabType={"pending"}
      />
    ),
  },
  {
    key: "3",
    label: `Đã xuất kho (${soldOut.length})`,
    children: (
      <TableWarehouseList
        products={soldOut}
        onViewDetail={handleViewDetail}
        onReload={fetchApi}
        
      />
    ),
  },
];

  return (
    <>
      {contextHolder}
      <h2>Danh sách sản phẩm trong kho</h2>
      <Tabs defaultActiveKey="1" items={tabItems} />

      <WarehouseDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />
    </>
  );
}
