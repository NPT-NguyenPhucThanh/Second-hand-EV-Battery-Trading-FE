// src/pages/Warehouse/WarehousePending.jsx
import { useEffect, useState } from "react";
import { message } from "antd";
import { getWarehousePending } from "../../../services/warehouseService";
import TableWarehouseList from "../WarehouseManagement/components/TableWarehouseList";
import WarehouseDetailModal from "../WarehouseManagement/components/WarehouseDetailModal";

export default function WarehousePending() {
  const [products, setProducts] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchApi = async () => {
    const res = await getWarehousePending();
    if (res) {
      setProducts(res || []);
    } else {
      messageApi.error("Không nhận được dữ liệu từ server");
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <>
      {contextHolder}
      <h2>Danh sách sản phẩm chờ nhập kho</h2>
      <TableWarehouseList products={products} onViewDetail={handleViewDetail} tabType={"pending"} onReload={fetchApi}/>
      <WarehouseDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />
    </>
  );
}
