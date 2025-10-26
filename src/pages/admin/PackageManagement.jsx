import React, { useState, useEffect, useMemo } from "react";
import { Tabs, Table } from "antd";

import AdminBreadcrumb from "../../components/admin/AdminBreadcrumb";
import PackageTable from "../../components/admin/PackageTable";
import PackageModal from "../../components/admin/PackageModal";
import { usePackages } from "../../services/packageService";

export default function PackageManagement() {
  const { packages, loading, fetchPackages, addPackage, updatePackage, deletePackage } = usePackages();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [currentType, setCurrentType] = useState("BATTERY");

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
      console.log(pkg)
      updatePackage(pkg.packageid, pkg);
    } else {
      addPackage({ ...pkg, packageType: currentType });
    }
    setIsModalVisible(false);
    setEditingPackage(null);
  };

  const userPackageColumns = [
    { title: "Tên đăng nhập", dataIndex: "username", key: "username" },
    { title: "Mã UserPackage", dataIndex: "userpackageid", key: "userpackageid" },
  ];

  const packageTabs = [
    {
      key: "BATTERY",
      label: "Gói cho pin",
      children: (
        <PackageTable
          dataSource={batteryPackages}
          loading={loading}
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
          loading={loading}
          packageType="CAR"
          onAdd={handleShowCreateModal}
          onEdit={handleShowEditModal}
          onDelete={deletePackage}
        />
      ),
    },
  ];

  const mainTabs = [
    {
      key: "1",
      label: "Danh sách gói dịch vụ",
      children: <Tabs defaultActiveKey="BATTERY" items={packageTabs} onChange={(key) => setCurrentType(key)} />,
    },
    {
      key: "2",
      label: "Người dùng đang sử dụng gói",
      children: <Table columns={userPackageColumns} dataSource={[]} rowKey="userpackageid" />,
    },
  ];

  return (
    <>
      <AdminBreadcrumb />
      <Tabs defaultActiveKey="1" items={mainTabs} />
      <PackageModal
        open={isModalVisible}
        onSave={handleSavePackage}
        onCancel={handleCancelModal}
        editingPackage={editingPackage}
        packageType={currentType}
      />
    </>
  );
}
