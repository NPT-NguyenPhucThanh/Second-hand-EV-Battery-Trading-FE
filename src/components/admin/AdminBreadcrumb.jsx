// src/components/AdminBreadcrumb.jsx
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";

export default function AdminBreadcrumb() {
  const location = useLocation();
  const path = location.pathname;

  const nameMap = {
    "/admin": "Bảng điều khiển",
    "/admin/users": "Quản lý người dùng",
    "/admin/posts": "Quản lý bài đăng",
    "/admin/vehicle-inspection": "Kiểm định xe",
    "/admin/vehicle-storage": "Quản lý kho xe",
    "/admin/transactions": "Quản lý giao dịch",
    "/admin/disputes": "Giải quyết tranh chấp",
    "/admin/packages": "Quản lý gói dịch vụ",
  };

  const breadcrumbItems = [];

  breadcrumbItems.push({
    title: <Link to="/admin">Bảng điều khiển</Link>,
  });

  if (path !== "/admin") {
    breadcrumbItems.push({
      title: nameMap[path] || "Trang hiện tại",
    });
  }

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{ marginBottom: 16, fontSize: "16px" }}
    />
  );
}
