import { Menu } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  PieChartOutlined,
  WarningOutlined,
  DollarOutlined,
  TransactionOutlined,
  FileTextOutlined,
  UserOutlined,
  AuditOutlined,
  CarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

export default function MenuSider() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const items = [
    {
      label: <Link to="/admin">Bảng điều khiển</Link>,
      icon: <PieChartOutlined />,
      key: "/admin",
    },
    {
      label: <Link to="/admin/users">Quản lý người dùng</Link>,
      icon: <UserOutlined />,
      key: "/admin/users",
    },
    {
      label: <Link to="/admin/posts">Quản lý bài đăng</Link>,
      icon: <FileTextOutlined />,
      key: "/admin/posts",
    },
    {
      label: <Link to="/admin/vehicle-inspection">Kiểm định xe</Link>,
      icon: <AuditOutlined />,
      key: "/admin/vehicle-inspection",
    },
    {
      label: <Link to="/admin/vehicle-storage">Quản lý kho xe</Link>,
      icon: <CarOutlined />,
      key: "/admin/vehicle-storage",
    },
    {
      label: <Link to="/admin/transactions">Quản lý giao dịch</Link>,
      icon: <TransactionOutlined />,
      key: "/admin/transactions",
    },
    {
      label: <Link to="/admin/disputes">Xử lý tranh chấp</Link>,
      icon: <WarningOutlined />,
      key: "/admin/disputes",
    },
    {
      label: <Link to="/admin/packages">Quản lý gói dịch vụ</Link>,
      icon: <DollarOutlined />,
      key: "/admin/packages",
    },
    {
      label: (
        <span style={{ color: "red" }} onClick={handleLogout}>
          Đăng xuất
        </span>
      ),
      icon: <LogoutOutlined style={{ color: "red" }} />,
      key: "logout",
    },
  ];

  return (
    <Menu
      mode="inline"
      items={items}
      selectedKeys={[selectedKey]} 
    />
  );
}
