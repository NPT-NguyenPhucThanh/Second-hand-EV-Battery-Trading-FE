import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "../components/common/ThemeToggle";
import Notification from "../components/common/Notification";
import AuroraText from "../components/common/AuroraText";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Warehouse,
  ShoppingCart,
  AlertTriangle,
  LogOut,
  Menu as MenuIcon,
  X,
  UserPlus,
  CreditCard,
} from "lucide-react";

export default function AdminLayout() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { icon: UserPlus, label: "Duyệt Seller", path: "/staff/user-upgrade" },
    { icon: Users, label: "Quản lý người dùng", path: "/staff/users" },
    {
      icon: CreditCard,
      label: "Quản lý gói User",
      path: "/staff/user-packages",
    },
    { icon: FileText, label: "Quản lý bài đăng", path: "/staff/post" },
    { icon: Package, label: "Chờ nhập kho", path: "/staff/warehouse/pending" },
    {
      icon: Warehouse,
      label: "Quản lý kho xe",
      path: "/staff/vehicle-storage",
    },
    { icon: ShoppingCart, label: "Quản lý đơn hàng", path: "/staff/orders" },
    { icon: AlertTriangle, label: "Xử lý hoàn tiền", path: "/staff/refund" },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Floating gradient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-float [animation-delay:2s]" />
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl ${
          isDark
            ? "bg-gray-900/90 border-gray-800"
            : "bg-white/90 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
            <AuroraText text="Staff Panel" className="text-2xl font-bold" />
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Notification />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-20 bottom-0 z-40 transition-all duration-300 border-r backdrop-blur-xl ${
          sidebarOpen ? "w-64" : "w-0"
        } ${
          isDark
            ? "bg-gray-900/90 border-gray-800"
            : "bg-white/90 border-gray-200"
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-blue-50 text-blue-600 border border-blue-200"
                    : isDark
                    ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isDark
                ? "text-red-400 hover:bg-red-500/20 border border-red-500/30"
                : "text-red-600 hover:bg-red-50 border border-red-200"
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">Đăng xuất</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-20 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
