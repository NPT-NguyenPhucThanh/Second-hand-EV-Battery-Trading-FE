import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Tabs, Table, message, Tag, Spin } from "antd"; 
import PackageTable from "./components/PackageTable";
import PackageModal from "./components/PackageModal";
import { usePackages } from "../../../services/packageService";
import {
  getAllActiveUserPackages,
  getActiveUserPackagesByType,
} from "../../../services/userPackageService"; 

export default function PackageManagement() {

  const { packages, loading: pkgListLoading, fetchPackages, addPackage, updatePackage, deletePackage } = usePackages();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [currentPkgTypeTab, setCurrentPkgTypeTab] = useState("BATTERY"); 

  const [userPackages, setUserPackages] = useState([]);
  const [userPkgLoading, setUserPkgLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("1"); 
  const [activeUserPkgTab, setActiveUserPkgTab] = useState("ALL"); 
  
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const { batteryPackages, carPackages } = useMemo(() => {
    return {
      batteryPackages: packages.filter((p) => p.packageType?.toUpperCase() === "BATTERY"),
      carPackages: packages.filter((p) => p.packageType?.toUpperCase() === "CAR"),
    };
  }, [packages]);

  const handleShowCreateModal = () => {
    setEditingPackage(null);
    setIsModalVisible(true);
  };

  const handleShowEditModal = (pkg) => {
    setEditingPackage(pkg);
    setIsModalVisible(true);
  };
  
  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingPackage(null);
  };

  const handleSavePackage = (pkg) => {
    if (pkg.packageid) {
      updatePackage(pkg.packageid, pkg);
    } else {
      addPackage({ ...pkg, packageType: currentPkgTypeTab });
    }
    setIsModalVisible(false);
    setEditingPackage(null);
  };

  const fetchUserPackages = useCallback(async (tabKey) => {
    setUserPkgLoading(true);
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
        messageApi.error(response.message || "Không thể tải dữ liệu gói người dùng.");
      }
    } catch (error) {
      messageApi.error("Lỗi kết nối: " + error.message);
    } finally {
      setUserPkgLoading(false);
    }
  }, [messageApi]); 

  useEffect(() => {
    if (activeMainTab === "2") {
      fetchUserPackages(activeUserPkgTab);
    }
  }, [activeMainTab, activeUserPkgTab, fetchUserPackages]);

  const userPackageColumns = [
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

  const packageTabs = [
    {
      key: "BATTERY",
      label: "Gói cho pin",
      children: (
        <PackageTable
          dataSource={batteryPackages}
          loading={pkgListLoading}
          packageType="BATTERY"
          onAdd={handleShowCreateModal}
          onEdit={handleShowEditModal}
          onDelete={deletePackage}
        />
      ),
    },
    {
      key: "CAR",
      label: "Gói cho xe",
      children: (
        <PackageTable
          dataSource={carPackages}
          loading={pkgListLoading}
          packageType="CAR"
          onAdd={handleShowCreateModal}
          onEdit={handleShowEditModal}
          onDelete={deletePackage}
        />
      ),
    },
  ];

  const userPackageSubTabs = [
    {
      key: "ALL",
      label: `Tất cả (${activeUserPkgTab === 'ALL' ? userPackages.length : ''})`,
    },
    {
      key: "CAR",
      label: `Gói CAR (${activeUserPkgTab === 'CAR' ? userPackages.length : ''})`,
    },
    {
      key: "BATTERY",
      label: `Gói BATTERY (${activeUserPkgTab === 'BATTERY' ? userPackages.length : ''})`,
    },
  ];

  const mainTabs = [
    {
      key: "1",
      label: "Danh sách gói dịch vụ",
      children: <Tabs defaultActiveKey="BATTERY" items={packageTabs} onChange={(key) => setCurrentPkgTypeTab(key)} />,
    },
    {
      key: "2",
      label: "Người dùng đang sử dụng gói",
      children: (
        <Spin spinning={userPkgLoading}>
          <Tabs 
            defaultActiveKey="ALL" 
            items={userPackageSubTabs} 
            onChange={(key) => setActiveUserPkgTab(key)} 
          />
          <Table 
            columns={userPackageColumns} 
            dataSource={userPackages} 
            rowKey="userPackageId"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      ),
    },
  ];

  return (
    <>
      {contextHolder} 
      <Tabs 
        defaultActiveKey="1" 
        items={mainTabs} 
        onChange={(key) => setActiveMainTab(key)} 
      />
      <PackageModal
        open={isModalVisible}
        onSave={handleSavePackage}
        onCancel={handleCancelModal}
        editingPackage={editingPackage}
        packageType={currentPkgTypeTab}
      />
    </>
  );
}