import { Menu } from "antd";
import { Link } from "react-router-dom";
import {
  PieChartOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  DollarOutlined,
  TransactionOutlined,
  FileTextOutlined,
  UserOutlined,
  AuditOutlined,
  CarOutlined,
} from "@ant-design/icons";

export default function MenuSider() {
  const items = [
    {
      label: <Link to="/admin">Bảng điều khiển</Link>,
      icon: <PieChartOutlined />,
      key: "dashboard",
    },
    {
      label: <Link to="/admin/posts">Quản lý bài đăng</Link>,
      icon: <FileTextOutlined />,
      key: "posts",
    },
    {
      label: <Link to="/admin/vehicle-inspection">Kiểm định xe</Link>,
      icon: <AuditOutlined />,
      key: "audit",
    },
    {
      label: <Link to="/admin/vehicle-storage">Quản lý kho xe</Link>,
      icon: <CarOutlined />,
      key: "vehicle-storage",
    },
    {
      label: <Link to="/admin/transactions">Quản lý giao dịch</Link>,
      icon: <TransactionOutlined />,
      key: "transactions",
    },

     {
      label: <Link to="/admin/users">Quản lý người dùng</Link>,
      icon: <UserOutlined />,
      key: "users",
    },
    {
      label: <Link to="/admin/manage-product">Quản lý đơn hàng</Link>,
      icon: <ShoppingCartOutlined />,
      key: "manage-orders",
    },
    {
      label: <Link to="/admin/complaints">Khiếu nại</Link>,
      icon: <WarningOutlined />,
      key: "complaints",
    },
    {
      label: <Link to="/admin/money">Quản lý phí nền tảng</Link>,
      icon: <DollarOutlined />,
      key: "platform-fees-management",
    },
    
   
  ];
  return (
    <Menu
      mode="inline"
      items={items}
      defaultSelectedKeys={["/"]}
      defaultOpenKeys={["menu1"]}
    />
  );
}
