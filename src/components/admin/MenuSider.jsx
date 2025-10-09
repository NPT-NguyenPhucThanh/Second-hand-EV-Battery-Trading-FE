import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
  PieChartOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  DollarOutlined,
  TransactionOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function MenuSider() {
  const items = [
    {
      label: <Link to="/admin">Dashboard</Link>,
      icon:  <PieChartOutlined />,
      key: "dashboard",
    },
    {
      label: <Link to="/admin/manage-product">Manage Orders</Link>,
      icon:  <ShoppingCartOutlined />,
      key: "manage-orders",
     
    },
    {
      label: <Link to="/admin/complaints">Complaints</Link>,
      icon:  <WarningOutlined />,
      key: "complaints",
    },
    {
      label: <Link to="/admin/money">Platform Fees Management</Link>,
      icon:  <DollarOutlined />,
      key: "platform-fees-management",
      
    },
    {
    label: <Link to="/admin/transactions">Transactions</Link>,
    icon: <TransactionOutlined />,
    key: "transactions",
  },
  {
    label: <Link to="/admin/posts">Posts</Link>,
    icon: <FileTextOutlined />,
    key: "posts",
  },
  {
    label: <Link to="/admin/users">Users</Link>,
    icon: <UserOutlined />,
    key: "users",
  },
  ];
  return (
    <Menu
      mode="inline"
      items={items}
      defaultSelectedKeys={["/"]}
      defaultOpenKeys={["menu1"]}
    />
  )
}

