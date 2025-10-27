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
  UserSwitchOutlined,
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
      label: (
        <Link to="/admin/user-upgrade">Duyệt yêu cầu nâng cấp Seller</Link>
      ),
      icon: <UserSwitchOutlined />,
      key: "/admin/user-upgrade",
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
      label: <Link to="/admin/warehouse/pending">Chờ nhập kho</Link>,
      icon: <AuditOutlined />,
      key: "/admin/warehouse/pending",
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
      label: <Link to="/admin/warehouse">Kho</Link>,
      icon: <DollarOutlined />,
      key: "/admin/warehouse",
    },
    {
      label: <Link to="/admin/seller">seller</Link>,
      icon: <DollarOutlined />,
      key: "/admin/seller",
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

  return <Menu mode="inline" items={items} selectedKeys={[selectedKey]} />;
}
