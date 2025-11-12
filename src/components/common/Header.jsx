import { Button, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import {
  NotificationOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  MessageOutlined,
  BoxPlotOutlined,
} from "@ant-design/icons";
import { Sun, Moon } from "lucide-react";
import AuroraText from "./AuroraText";
import React, { useState, useEffect, useRef } from "react";
import { useNotifications } from "../../contexts/NotificationContext.jsx";
import Notification from "./Notification";

/* ----------------------- ICONS ----------------------- */
const User = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const Package = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 8h18M8 4v16" />
  </svg>
);

const LogOut = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

/* ----------------------- DROPDOWN CƠ BẢN (SERA UI) ----------------------- */
const DropdownMenu = ({ children, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useTheme();
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
          className="origin-top-right absolute right-0 mt-3 w-80 rounded-3xl shadow-2xl ring-1 ring-opacity-5 focus:outline-none z-50 p-1 transition-all duration-300"
          style={{
            background: isDark
              ? "rgba(17, 24, 39, 0.98)"
              : "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(30px)",
            border: isDark
              ? "1px solid rgba(239, 68, 68, 0.3)"
              : "1px solid rgba(251, 146, 60, 0.3)",
            animation: "slideDown 0.2s ease-out",
          }}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, isDark, icon: Icon }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      if (onClick) onClick();
    }}
    className={`w-full group flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition-all duration-200 ${
      isDark
        ? "text-gray-200 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-orange-500/10"
        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5"
    }`}
    style={{
      border: "1px solid transparent",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.border = isDark
        ? "1px solid rgba(239, 68, 68, 0.2)"
        : "1px solid rgba(59, 130, 246, 0.2)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.border = "1px solid transparent";
    }}
    role="menuitem"
  >
    {Icon && (
      <div
        className="p-2 rounded-xl transition-all duration-200 group-hover:scale-110"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))"
            : "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
        }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: isDark ? "#ef4444" : "#3b82f6" }}
        />
      </div>
    )}
    <span className="font-medium">{children}</span>
  </button>
);

const DropdownMenuSeparator = ({ isDark }) => (
  <div
    className="my-2 h-px mx-2"
    style={{
      background: isDark
        ? "linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.3), transparent)"
        : "linear-gradient(90deg, transparent, rgba(251, 146, 60, 0.3), transparent)",
    }}
  />
);

/* ----------------------- HỒ SƠ NGƯỜI DÙNG (SERA UI) ----------------------- */
function UserProfileDropdown() {
  const { user, logout } = useUser();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user || !user.username) return null;

  return (
    <DropdownMenu
      trigger={
        <button
          className="flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 group"
          style={{
            background: isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
            border: isDark
              ? "1px solid rgba(239, 68, 68, 0.3)"
              : "1px solid rgba(251, 146, 60, 0.3)",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #ef4444, #f97316)"
                : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            }}
          >
            {user.username?.toUpperCase().split(" ").slice(-1)[0][0] || "U"}
          </div>
          <div
            className={`text-left hidden md:block ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <div
              className="text-sm font-bold group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
              style={{
                backgroundImage: isDark
                  ? "linear-gradient(135deg, #ef4444, #f97316)"
                  : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            >
              {user.username || "User"}
            </div>
          </div>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      }
    >
      {/* Header Info with Enhanced Glassmorphism */}
      <div
        className="p-4 rounded-2xl mb-2"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))"
            : "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08))",
          border: isDark
            ? "1px solid rgba(239, 68, 68, 0.2)"
            : "1px solid rgba(59, 130, 246, 0.15)",
        }}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #ef4444, #f97316)"
                : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            }}
          >
            {user.username?.toUpperCase().split(" ").slice(-1)[0][0] || "U"}
          </div>
          <div className="flex-1">
            <div
              className={`text-base font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {user.username}
            </div>
            <div
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {user.email || "user@example.com"}
            </div>
            <div
              className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-lg text-xs font-bold"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.2))"
                  : "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))",
                color: isDark ? "#fbbf24" : "#3b82f6",
                border: isDark
                  ? "1px solid rgba(251, 191, 36, 0.3)"
                  : "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              VIP Pro
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1 px-2">
        <DropdownMenuItem
          onClick={() => navigate("/profile")}
          isDark={isDark}
          icon={User}
        >
          Trang cá nhân
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/seller/packages")}
          isDark={isDark}
          icon={Package}
        >
          Gói dịch vụ
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator isDark={isDark} />

      <div className="py-1 px-2">
        <DropdownMenuItem onClick={handleLogout} isDark={isDark} icon={LogOut}>
          Đăng xuất
        </DropdownMenuItem>
      </div>
    </DropdownMenu>
  );
}

/* ----------------------- HEADER CHÍNH (SERA UI) ----------------------- */
export default function Header() {
  const { user } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const { totalUnreadMessages } = useNotifications();

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header
      className="fixed z-50 w-full top-0 h-16 shadow-2xl transition-all duration-300"
      style={{
        background: isDark
          ? "rgba(17, 24, 39, 0.8)"
          : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: isDark
          ? "1px solid rgba(239, 68, 68, 0.2)"
          : "1px solid rgba(251, 146, 60, 0.2)",
      }}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo with Aurora Effect */}
          <Link to="/" className="flex items-center">
            <AuroraText
              key={`header-logo-${isDark}`}
              text="TradeEV"
              colors={
                isDark
                  ? ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"]
                  : ["#3b82f6", "#8b5cf6", "#06b6d4", "#3b82f6"]
              }
              speed={3}
              className="text-2xl md:text-3xl font-black"
            />
          </Link>

          {/* Search Bar with Glassmorphism */}
          <form
            onSubmit={handleSearch}
            className="flex-1 mx-4 md:mx-10 max-w-2xl"
          >
            <div
              className="relative rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.03)",
                border: isDark
                  ? "1px solid rgba(239, 68, 68, 0.2)"
                  : "1px solid rgba(251, 146, 60, 0.2)",
              }}
            >
              <input
                type="text"
                placeholder="Tìm kiếm xe điện, pin..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={`w-full px-4 py-2 bg-transparent focus:outline-none transition-colors ${
                  isDark
                    ? "text-white placeholder-gray-400"
                    : "text-gray-900 placeholder-gray-500"
                }`}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-300 hover:scale-110"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, #ef4444, #f97316)"
                    : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                }}
              >
                <svg
                  className="w-4 h-4 text-white"
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
          </form>

          {/* Right Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Theme Toggle Button with Sera UI */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-110"
              style={{
                background: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
                border: isDark
                  ? "1px solid rgba(239, 68, 68, 0.3)"
                  : "1px solid rgba(251, 146, 60, 0.3)",
              }}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" style={{ color: "#fbbf24" }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: "#6366f1" }} />
              )}
            </button>

            <Notification />

            {user && (
              <>
                <Link to="/messages">
                  <Badge
                    count={totalUnreadMessages}
                    size="small"
                    offset={[0, 5]}
                  >
                    <button
                      className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
                      style={{
                        background: isDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.05)",
                        border: isDark
                          ? "1px solid rgba(239, 68, 68, 0.3)"
                          : "1px solid rgba(251, 146, 60, 0.3)",
                      }}
                    >
                      <MessageOutlined
                        style={{
                          fontSize: "20px",
                          color: isDark ? "#e5e7eb" : "#1f2937",
                        }}
                      />
                    </button>
                  </Badge>
                </Link>
                <Link to="/favorites">
                  <Badge count={0} size="small" offset={[0, 5]}>
                    <button
                      className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
                      style={{
                        background: isDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.05)",
                        border: isDark
                          ? "1px solid rgba(239, 68, 68, 0.3)"
                          : "1px solid rgba(251, 146, 60, 0.3)",
                      }}
                    >
                      <HeartOutlined
                        style={{
                          fontSize: "20px",
                          color: isDark ? "#ef4444" : "#ef4444",
                        }}
                      />
                    </button>
                  </Badge>
                </Link>
                <Link to="/cart">
                  <Badge count={0} size="small" offset={[0, 5]}>
                    <button
                      className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
                      style={{
                        background: isDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.05)",
                        border: isDark
                          ? "1px solid rgba(239, 68, 68, 0.3)"
                          : "1px solid rgba(251, 146, 60, 0.3)",
                      }}
                    >
                      <ShoppingCartOutlined
                        style={{
                          fontSize: "20px",
                          color: isDark ? "#e5e7eb" : "#1f2937",
                        }}
                      />
                    </button>
                  </Badge>
                </Link>
              </>
            )}

            {user ? (
              <UserProfileDropdown />
            ) : (
              <Link to="/login">
                <button
                  className="px-4 py-2 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                  }}
                >
                  Đăng nhập
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
