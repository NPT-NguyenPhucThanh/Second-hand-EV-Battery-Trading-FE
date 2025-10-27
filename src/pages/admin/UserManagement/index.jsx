import { useEffect, useState } from "react";
import { getAllCustomer } from "../../../services/userService";
import TableUserList from "./components/TableUserList";
import { message, Tabs } from "antd";

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchApi = async () => {
      const res = await getAllCustomer();
      if (res) {
        if (res.status === "success") {
          setUsers(res.users || []);
        } else {
          messageApi.error(res.message || "Không thể tải dữ liệu người dùng");
        }
      } else {
        messageApi.error("Không nhận được dữ liệu từ server");
      }
   
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const handleReload = () => {
    fetchApi();
  };

  const buyers = users.filter((user) => user.roles.includes("BUYER"));
  const sellers = users.filter((user) => user.roles.includes("SELLER"));

  const tabItems = [
    {
      key: "1",
      label: `Buyer (${buyers.length})`,
      children: <TableUserList users={buyers} onReload={handleReload} />,
    },
    {
      key: "2",
      label: `Seller (${sellers.length})`,
      children: <TableUserList users={sellers} onReload={handleReload} />,
    },
  ];

  return (
    <>
      {contextHolder}
      <h2>Danh sách người dùng</h2>
      <Tabs defaultActiveKey="1" items={tabItems} />
    </>
  );
}
