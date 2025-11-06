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
  SolutionOutlined,
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
      label: (
        <Link to="/staff/user-upgrade">Duyệt Seller</Link>
      ),
      icon: <UserSwitchOutlined />,
      key: "/staff/user-upgrade",
    },
    {
      label: <Link to="/staff/users">Quản lý người dùng</Link>,
      icon: <UserOutlined />,
      key: "/staff/users",
    },
    {
      label: <Link to="/staff/user-packages">Quản lý gói User</Link>,
      icon: <SolutionOutlined />, 
      key: "/staff/user-packages",
    },
         {
      label: <Link to="/staff/post">Quản lý bài đăng</Link>,
      icon: <FileTextOutlined />,
      key: "/staff/post",
    },
    {
      label: <Link to="/staff/warehouse/pending">Chờ nhập kho</Link>,
      icon: <AuditOutlined />,
      key: "/staff/warehouse/pending",
    },

    {
      label: <Link to="/staff/vehicle-storage">Quản lý kho xe</Link>,
      icon: <CarOutlined />,
      key: "/staff/vehicle-storage",
    },
    {
      label: <Link to="/staff/orders">Quản lý đơn hàng</Link>,
      icon: <TransactionOutlined />,
      key: "/staff/orders",
    },
    {
      label: <Link to="/staff/refund">Xử lý hoàn tiền</Link>,
      icon: <WarningOutlined />,
      key: "/staff/refund",
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
