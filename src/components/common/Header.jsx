"use client";
import { Button, Popover, List, Badge, Dropdown } from "antd";
import { Link } from "react-router";
import {
  NotificationOutlined,
  DownOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect, useRef } from "react";

/* ----------------------- ICONS ----------------------- */
const User = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const Settings = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6" />
    <path d="M1 12h6m6 0h6" />
  </svg>
);
const CreditCard = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);
const LogOut = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

/* ----------------------- DROPDOWN CƠ BẢN ----------------------- */
const DropdownMenu = ({ children, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTriggerClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in-0 zoom-in-95 p-2"
          role="menu"
          aria-orientation="vertical"
        >
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      if (onClick) onClick();
    }}
    className="text-zinc-700 group flex items-center px-3 py-2.5 text-sm rounded-lg hover:bg-zinc-100 transition-colors duration-150"
    role="menuitem"
  >
    {children}
  </a>
);

const DropdownMenuSeparator = () => <div className="my-2 h-px bg-zinc-200" />;

/* ----------------------- HỒ SƠ NGƯỜI DÙNG ----------------------- */
function UserProfileDropdown() {
  return (
    <DropdownMenu
      trigger={
        <button className="flex items-center space-x-3 px-3 py-2 rounded-lg shadow-sm hover:bg-gray-300 transition-all">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-sm">
            DH
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-white">Đăng Hiệu</div>
          </div>
        </button>
      }
    >
      {/* dropdown header */}
      <div className="px-3 py-3 border-b border-zinc-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            DH
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900">Đăng Hiệu</div>
            <div className="text-xs text-zinc-500">dagnhieu.work@gmail.com</div>
            <div className="text-xs text-blue-600 font-medium">Gói Pro</div>
          </div>
        </div>
      </div>

      <div className="py-1">
        <DropdownMenuItem onClick={() => console.log("Trang cá nhân")}>
          <User className="mr-3 h-4 w-4 text-zinc-500" />
          <Link to={"/profile"}>Trang cá nhân</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("Cài đặt")}>
          <Settings className="mr-3 h-4 w-4 text-zinc-500" />
          Cài đặt
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("Thanh toán")}>
          <CreditCard className="mr-3 h-4 w-4 text-zinc-500" />
          Gói & thanh toán
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator />

      <div className="py-1">
        <DropdownMenuItem onClick={() => console.log("Đăng xuất")}>
          <LogOut className="mr-3 h-4 w-4 text-zinc-500" />
          Đăng xuất
        </DropdownMenuItem>
      </div>
    </DropdownMenu>
  );
}

/* ----------------------- HEADER CHÍNH ----------------------- */
export default function Header({ user = 1 }) {
  const notifications = [
    { id: 1, message: "Đơn hàng #1234 của bạn đã được gửi đi." },
    { id: 2, message: "Bạn có tin nhắn mới từ đội hỗ trợ." },
    { id: 3, message: "Tin đăng pin đã được phê duyệt." },
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
        <p className="text-gray-500 text-center text-sm">
          Chưa có thông báo nào
        </p>
      )}
    </div>
  );

  return (
    <header className="bg-gradient-to-r from-blue-500 to-green-400 shadow-md fixed z-50 w-full top-0 h-16 flex items-center justify-between">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={"/"} className="text-2xl font-bold text-white">
            TradeEV
          </Link>

          {/* Thanh tìm kiếm */}
          <div className="flex-1 bg-white rounded-lg mx-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
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

          {/* Điều hướng & tài khoản */}
          <div className="flex items-center space-x-4">
            <CategoryDropdown />
            <Link to={"/support"} className="text-white font-bold">
              Hỗ trợ
            </Link>

            <Popover
              content={notificationContent}
              title={<span className="font-semibold text-gray-700">Thông báo</span>}
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

            {user === 1 ? (
              <nav className="ml-6 flex items-center">
                <UserProfileDropdown />
              </nav>
            ) : (
              <Link to={"/login"}>
                <Button className="ml-5 font-bold">Đăng nhập / Đăng ký</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ----------------------- DANH MỤC ----------------------- */
export function CategoryDropdown() {
  const items = [
    {
      key: "bike",
      label: "Xe điện",
      children: [
        {
          key: "vinfast",
          label: <Link to="/categories/bike/vinfast">VinFast</Link>,
        },
        {
          key: "wuling",
          label: <Link to="/categories/bike/wuling">Wuling</Link>,
        },
      ],
    },
    {
      key: "batteries",
      label: "Pin",
      children: [
        { key: "lithium", label: "Pin Lithium-ion" },
        { key: "solid", label: "Pin thể rắn" },
      ],
    },
  ];

  return (
    <Dropdown
      menu={{
        items,
        onClick: (e) => {
          console.log("Danh mục đã chọn:", e.key);
        },
      }}
      placement="bottomLeft"
      arrow
    >
      <Button
        type="text"
        className="font-bold"
        icon={<AppstoreOutlined style={{ color: "white" }} />}
        style={{ color: "white" }}
      >
        Danh mục{" "}
        <DownOutlined
          style={{ fontSize: "12px", marginLeft: "4px", color: "white" }}
        />
      </Button>
    </Dropdown>
  );
}
