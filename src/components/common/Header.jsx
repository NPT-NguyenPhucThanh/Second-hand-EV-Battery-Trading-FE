import { Button, Popover, List, Badge, Dropdown } from "antd";
import { href, Link } from "react-router";
import { NotificationOutlined } from "@ant-design/icons";
import { DownOutlined, AppstoreOutlined } from "@ant-design/icons";
export default function Header() {
  const notifications = [
    { id: 1, message: "Your order #1234 has been shipped." },
    { id: 2, message: "New message from support team." },
    { id: 3, message: "Battery listing approved." },
  ];
  const notificationContent = (
    <div className="w-64">
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item className="hover:bg-gray-50 cursor-pointer px-2 rounded">
            <span className="text-gray-700 text-sm">{item.message}</span>
          </List.Item>
        )}
      />
      {notifications.length === 0 && (
        <p className="text-gray-500 text-center text-sm">No notifications</p>
      )}
    </div>
  );

  return (
    <header className="bg-gradient-to-r from-blue-500 to-green-400 shadow-md fixed z-50 w-full top-0 h-16 ">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={"/"} className="text-2xl font-bold text-white">
            TradeEV
          </Link>
          {/* Search Bar */}
          <div className="flex-1 bg-white rounded-lg   mx-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <button className="absolute right-3 top-2.5">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Auth Buttons */}

          <div className="flex items-center space-x-4">
            <CategoryDropdown />
            {/* Support ngay đây */}
            <Link to={"/support"} className="text-white font-bold">
              Support
            </Link>
            <Popover
              content={notificationContent}
              title={
                <span className="font-semibold text-gray-700">
                  Notifications
                </span>
              }
              trigger="click"
              placement="bottomRight"
            >
              <Badge count={notifications.length} size="small" offset={[0, 5]}>
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <NotificationOutlined
                      style={{ fontSize: "20px", color: "white" }}
                    />
                  }
                />
              </Badge>
            </Popover>
            <Link to={"/login"}>
              <Button className="ml-5" style={{ fontWeight: "bold" }}>
                Login/Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
export function CategoryDropdown() {
  const items = [
    {
      key: "bike",
      label: "Bike",
      children: [
        {
          key: "vinfast",
          label: <Link to="/categories/bike/vinfast">VinFast</Link>,
        },
        {
          key: "wuling",
          label: <Link to="/categories/bike/wuling">wuling</Link>,
        },
      ],
    },
    {
      key: "batteries",
      label: "Batteries",
      children: [
        { key: "lithium", label: "Lithium-ion" },
        { key: "solid", label: "Solid-state" },
      ],
    },
  ];

  return (
    <>
      <Dropdown
        menu={{
          items,
          onClick: (e) => {
            console.log("Selected category:", e.key);
          },
        }}
        placement="bottomLeft"
        arrow
      >
        <Button
          type="text"
          className="text-white font-semibold hover:text-gray-200"
          style={{ color: "white", fontWeight: "bold" }}
          icon={<AppstoreOutlined />}
        >
          Categories{" "}
          <DownOutlined
            style={{ fontSize: "12px", marginLeft: "4px", color: "white " }}
          />
        </Button>
      </Dropdown>
    </>
  );
}
