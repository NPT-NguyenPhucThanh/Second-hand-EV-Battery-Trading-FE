// src/components/profile/MySellingContent.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Spin,
  Empty,
  Table,
  Tag,
  Button,
  Space,
  Image,
  message,
  Popconfirm,
} from "antd";
import { get, del } from "../../utils/api";
import { Navigate, useNavigate } from "react-router";
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const ProductStatusTag = ({ status }) => {
  const map = {
    DANG_BAN: { text: "Đang bán", color: "success" },
    CHO_DUYET: { text: "Chờ duyệt", color: "processing" },
    CHO_KIEM_DUYET: { text: "Chờ kiểm", color: "warning" },
    BI_TU_CHOI: { text: "Bị từ chối", color: "error" },
    DA_BAN: { text: "Đã bán", color: "default" },
  };
  const item = map[status] || { text: status, color: "default" };
  return <Tag color={item.color}>{item.text}</Tag>;
};

export default function MySellingContent() {
  const [sellingProducts, setSellingProducts] = useState([]); // DANG_BAN
  const [otherProducts, setOtherProducts] = useState([]); // Các trạng thái khác
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // === HÀM LẤY DỮ LIỆU (có thể gọi lại) ===
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get("api/seller/products");
      if (res.status !== "success" || !Array.isArray(res.products)) {
        throw new Error("Không thể tải sản phẩm");
      }

      const products = res.products.map((p) => ({
        key: p.productid,
        productid: p.productid,
        name: p.productname || "Không tên",
        description: p.description || "—",
        price: p.cost || 0,
        amount: p.amount || 1,
        status: p.status,
        specs: p.specs || "—",
        createdat: p.createdat,
        viewCount: p.viewCount || 0,
        type:
          p.type === "Car EV"
            ? "Car"
            : p.type === "Battery"
            ? "Battery"
            : "Unknown",
        inWarehouse: p.inWarehouse,
        brandcars: p.brandcars,
        brandbattery: p.brandbattery,
      }));

      const selling = products.filter((p) => p.status === "DANG_BAN");
      const others = products.filter((p) => p.status !== "DANG_BAN");

      setSellingProducts(selling);
      setOtherProducts(others);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      message.error(err.message || "Không thể tải sản phẩm");
      setSellingProducts([]);
      setOtherProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // === GỌI LẦN ĐẦU + TỰ ĐỘNG CẬP NHẬT SAU KHI ĐĂNG ===
  useEffect(() => {
    fetchProducts();

    const handleRefetch = () => fetchProducts();
    window.addEventListener("refetch-products", handleRefetch);

    return () => window.removeEventListener("refetch-products", handleRefetch);
  }, [fetchProducts]);

  // === XÓA SẢN PHẨM PIN ===
  const handleDelete = async (productid) => {
    try {
      const res = await del(`api/seller/products/batteries/${productid}`);
      if (res.status === "success") {
        message.success("Gỡ sản phẩm thành công!");
        fetchProducts(); // Tự động reload
      } else {
        throw new Error(res.message || "Không thể gỡ");
      }
    } catch (err) {
      message.error(err.message || "Không thể gỡ (có thể đã có đơn hàng)");
    }
  };

  // === CỘT CHUNG ===
  const baseColumns = [
   
    {
      title: "Tên sản phẩm",
      key: "name",
      render: (_, r) => (
        <div>
          <p className="font-medium text-gray-800 line-clamp-2">{r.name}</p>
        
          {r.description !== "—" && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
              {r.description}
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (p) => (
        <span className="font-bold text-green-600">{formatCurrency(p)}</span>
      ),
      width: 130,
    },
    {
      title: "Lượt xem",
      dataIndex: "viewCount",
      key: "view",
      render: (c) => (
        <div className="flex items-center">
          <i className="fa-solid fa-eye text-blue-600 mr-1"></i>
          <span>{c}</span>
        </div>
      ),
      width: 100,
    },
    {
      title: "Ngày đăng",
      dataIndex: "createdat",
      key: "date",
      render: (d) => <span className="text-xs">{formatDate(d)}</span>,
      width: 110,
    },
  ];

  // === BẢNG ĐANG BÁN ===
  const sellingColumns = [
    ...baseColumns,
    {
      title: "Hành động",
      key: "action",
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" className="text-blue-600">
            Xem
          </Button>
          <Button type="link" size="small">
            Sửa
          </Button>
          {r.type === "Battery" && (
            <Popconfirm
              title="Gỡ sản phẩm này?"
              onConfirm={() => handleDelete(r.productid)}
              okText="Gỡ"
              cancelText="Hủy"
            >
              <Button type="link" size="small" danger>
                Gỡ
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
      width: 160,
    },
  ];

  // === BẢNG KHÁC ===
  const otherColumns = [
    ...baseColumns,
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => <ProductStatusTag status={s} />,
      width: 130,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" className="text-blue-600">
            Xem
          </Button>
          {r.type === "Battery" && (
            <Button type="link" size="small" disabled>
              Gỡ
            </Button>
          )}
        </Space>
      ),
      width: 120,
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <p className="mt-3 text-gray-500">Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Sản Phẩm Của Tôi
        </h2>
        <Space>
          <Button
            icon={<i className="fa-solid fa-rotate-right"></i>}
            onClick={fetchProducts}
            loading={loading}
          >
            Làm mới
          </Button>

          <Button
            type="primary"
            icon={<i className="fa-solid fa-plus mr-1"></i>}
            onClick={() => navigate("/listings/new")}
          >
            Đăng sản phẩm mới
          </Button>
        </Space>
      </div>

      {/* ĐANG BÁN */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
          <i className="fa-solid fa-store mr-2"></i>
          Đang bán ({sellingProducts.length})
        </h3>
        {sellingProducts.length > 0 ? (
          <Table
            dataSource={sellingProducts}
            columns={sellingColumns}
            rowKey="key"
            pagination={{ pageSize: 6 }}
            scroll={{ x: 1000 }}
            bordered
            size="middle"
          />
        ) : (
          <Empty description="Chưa có sản phẩm đang bán" className="py-8" />
        )}
      </div>

      {/* KHÁC */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <i className="fa-solid fa-clock mr-2"></i>
          Đang xử lý ({otherProducts.length})
        </h3>
        {otherProducts.length > 0 ? (
          <Table
            dataSource={otherProducts}
            columns={otherColumns}
            rowKey="key"
            pagination={{ pageSize: 6 }}
            scroll={{ x: 1000 }}
            bordered
            size="middle"
          />
        ) : (
          <Empty description="Không có sản phẩm đang xử lý" className="py-8" />
        )}
      </div>
    </div>
  );
}
