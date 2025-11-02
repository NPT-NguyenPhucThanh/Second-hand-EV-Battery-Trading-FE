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
  BarChartOutlined,
  GiftOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";

export default function MenuSiderManager() {
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
      label: "Tác Vụ (Staff)",
      type: "group",
      children: [
        {
          label: <Link to="/manager/posts">Quản lý bài đăng</Link>,
          icon: <AuditOutlined />,
          key: "/manager/posts",
        },
        {
          label: <Link to="/manager/user-upgrade">Duyệt Seller</Link>,
          icon: <UserSwitchOutlined />,
          key: "/manager/user-upgrade",
        },
        {
          label: <Link to="/manager/orders">Quản lý đơn hàng</Link>,
          icon: <TransactionOutlined />,
          key: "/manager/orders",
        },
        {
          label: <Link to="/manager/refund">Xử lý hoàn tiền</Link>,
          icon: <WarningOutlined />,
          key: "/manager/refund",
        },
      ],
    },
    {
      label: "Quản Lý Hệ Thống",
      type: "group",
      children: [
        {
          label: <Link to="/manager/users">Quản lý người dùng</Link>,
          icon: <UserOutlined />,
          key: "/manager/users",
        },
        {
          label: <Link to="/manager/disputes">Quản lý Tranh chấp</Link>,
          icon: <WarningOutlined />,
          key: "/manager/disputes",
        },
        {
          label: <Link to="/manager/packages">Quản lý gói dịch vụ</Link>,
          icon: <GiftOutlined />,
          key: "/manager/packages",
        },
      ],
    },
    {
      label: "Báo Cáo",
      type: "group",
      children: [
        {
          label: <Link to="/manager/revenue">Báo cáo doanh thu</Link>,
          icon: <DollarCircleOutlined />,
          key: "/manager/revenue",
        },
        {
          label: <Link to="/manager/system">Báo cáo hệ thống</Link>,
          icon: <BarChartOutlined />,
          key: "/manager/system",
        },
      ],
    },
    {
      type: "divider",
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
