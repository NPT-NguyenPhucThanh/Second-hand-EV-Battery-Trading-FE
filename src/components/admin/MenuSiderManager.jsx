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
      label: <Link to="/manager">Bảng điều khiển</Link>,
      icon: <PieChartOutlined />,
      key: "/manager",
    },
    {
      label: (
        <Link to="/manager/user-upgrade">Duyệt nâng cấp Seller</Link>
      ),
      icon: <UserSwitchOutlined />,
      key: "/manager/user-upgrade",
    },
    {
      label: <Link to="/manager/users">Quản lý người dùng</Link>,
      icon: <UserOutlined />,
      key: "/manager/users",
    },
    {
      label: <Link to="/manager/posts">Quản lý bài đăng</Link>,
      icon: <FileTextOutlined />,
      key: "/manager/posts",
    },
    {
      label: <Link to="/manager/warehouse/pending">Chờ nhập kho</Link>,
      icon: <AuditOutlined />,
      key: "/manager/warehouse/pending",
    },

    {
      label: <Link to="/manager/vehicle-storage">Quản lý kho xe</Link>,
      icon: <CarOutlined />,
      key: "/manager/vehicle-storage",
    },
    {
      label: <Link to="/manager/transactions">Quản lý giao dịch</Link>,
      icon: <TransactionOutlined />,
      key: "/manager/transactions",
    },
    {
      label: <Link to="/manager/refund">Xử lý hoàn tiền</Link>,
      icon: <WarningOutlined />,
      key: "/manager/refund",
    },
    {
      label: <Link to="/manager/packages">Quản lý gói dịch vụ</Link>,
      icon: <DollarOutlined />,
      key: "/manager/packages",
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
