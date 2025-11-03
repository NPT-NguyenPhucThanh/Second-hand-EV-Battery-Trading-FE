// src/components/seller/MyPackages.jsx
import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Spin, message, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getMyPackages } from "../../services/packagePayment";

export default function MyPackages() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const list = await getMyPackages();
        setPackages(list);
      } catch (err) {
        message.error("Không thể tải gói đã mua");
      } finally {
        setLoading(false);
      }
    };
    loadPackages();
  }, []);

  const columns = [
    { title: "Gói", dataIndex: "packageName", render: t => <strong>{t}</strong> },
    { title: "Giá", dataIndex: "amount", render: a => <span className="text-red-600 font-bold">{Number(a).toLocaleString("vi-VN")}đ</span> },
    { title: "Ngày mua", dataIndex: "purchaseDate", render: d => new Date(d).toLocaleDateString("vi-VN") },
    {
      title: "Hết hạn",
      dataIndex: "expiryDate",
      render: d => {
        const days = Math.ceil((new Date(d) - new Date()) / 86400000);
        return <Tag color={days > 0 ? "green" : "red"}>{new Date(d).toLocaleDateString("vi-VN")}</Tag>;
      },
    },
  ];

  return (
    // SỬA: Thêm pt-16 để tránh bị Header che
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card
          title={<span className="text-xl font-bold">Lịch sử mua gói</span>}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/seller/packages")}>
              Mua gói mới
            </Button>
          }
        >
          {loading ? (
            <div className="text-center py-12"><Spin size="large" /></div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">Bạn chưa mua gói nào</p>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate("/seller/packages")}>
                Mua gói ngay
              </Button>
            </div>
          ) : (
            <Table dataSource={packages} columns={columns} rowKey="purchaseId" pagination={false} />
          )}
        </Card>
      </div>
    </div>
  );
}