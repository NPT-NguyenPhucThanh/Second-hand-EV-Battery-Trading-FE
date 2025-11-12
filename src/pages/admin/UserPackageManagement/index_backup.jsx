import React, { useState, useEffect, useCallback } from "react";
import { Table, Tabs, message, Tag, Spin } from "antd";
import {
  getAllActiveUserPackages,
  getActiveUserPackagesByType,
} from "../../../services/userPackageService";

export default function UserPackageManagement() {
  const [userPackages, setUserPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = useCallback(async (tabKey) => {
    setLoading(true);
    try {
      let response;
      if (tabKey === "ALL") {
        response = await getAllActiveUserPackages();
      } else {
        response = await getActiveUserPackagesByType(tabKey);
      }

      if (response && response.status === "success") {
        setUserPackages(response.userPackages || []);
      } else {
        messageApi.error(response.message || "Không thể tải dữ liệu gói.");
      }
    } catch (error) {
      messageApi.error("Lỗi kết nối: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [messageApi]); 

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const columns = [
    {
      title: "Mã User",
      dataIndex: "userId",
      key: "userId",
      sorter: (a, b) => a.userId - b.userId,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Tên hiển thị",
      dataIndex: "displayName",
      key: "displayName",
    },
    {
      title: "Tên gói",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "Loại gói",
      dataIndex: "packageType",
      key: "packageType",
      render: (type) => (
        <Tag color={type === "CAR" ? "blue" : "green"}>{type}</Tag>
      ),
      filters: [
        { text: 'CAR', value: 'CAR' },
        { text: 'BATTERY', value: 'BATTERY' },
      ],
      onFilter: (value, record) => record.packageType === value,
    },
    {
      title: "Ngày mua",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      render: (text) => (text ? new Date(text).toLocaleDateString("vi-VN") : "N/A"),
      sorter: (a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (text) => (text ? new Date(text).toLocaleDateString("vi-VN") : "N/A"),
      sorter: (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
    },
    {
      title: "Xe còn lại",
      dataIndex: "remainingCars",
      key: "remainingCars",
    },
    {
      title: "Pin còn lại",
      dataIndex: "remainingBatteries",
      key: "remainingBatteries",
    },
  ];

  const tabItems = [
    {
      key: "ALL",
      label: `Tất cả (${activeTab === 'ALL' ? userPackages.length : ''})`,
    },
    {
      key: "CAR",
      label: `Gói CAR (${activeTab === 'CAR' ? userPackages.length : ''})`,
    },
    {
      key: "BATTERY",
      label: `Gói BATTERY (${activeTab === 'BATTERY' ? userPackages.length : ''})`,
    },
  ];

  return (
    <>
      {contextHolder}
      <h2>Quản lý Gói Dịch Vụ Của Người Dùng</h2>
      <Tabs
        defaultActiveKey="ALL"
        onChange={handleTabChange}
        items={tabItems}
      />
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={userPackages}
          rowKey="userPackageId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Spin>
    </>
  );
}