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
      label: <Link to="/manager/users">Quản lý người dùng</Link>,
      icon: <UserOutlined />,
      key: "/manager/users",
    },

    {
      label: <Link to="/manager/packages">Quản lý gói dịch vụ</Link>,
      icon: <DollarOutlined />,
      key: "/manager/packages",
    },
    {
      label: <Link to="/manager/revenue">Báo cáo doanh thu</Link>,
      icon: <DollarOutlined />,
      key: "/manager/revenue",
    },
    {
      label: <Link to="/manager/system">Báo cáo hệ thống</Link>,
      icon: <DollarOutlined />,
      key: "/manager/system",
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
