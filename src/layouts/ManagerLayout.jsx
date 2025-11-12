import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "../components/common/ThemeToggle";
import Notify from "../components/admin/Notify";
import AuroraText from "../components/common/AuroraText";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ShoppingCart,
  AlertTriangle,
  LogOut,
  Menu as MenuIcon,
  X,
  UserPlus,
  BarChart3,
  Gift,
  DollarSign,
  AppWindow,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function ManagerLayout() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState([
    "staff",
    "system",
    "reports",
  ]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const menuGroups = [
    {
      id: "dashboard",
      label: "Tổng Quan",
      items: [
        { icon: LayoutDashboard, label: "Bảng điều khiển", path: "/manager" },
      ],
    },
    {
      id: "staff",
      label: "Tác Vụ (Staff)",
      items: [
        { icon: FileText, label: "Quản lý bài đăng", path: "/manager/posts" },
        {
          icon: UserPlus,
          label: "Duyệt Seller",
          path: "/manager/user-upgrade",
        },
        {
          icon: ShoppingCart,
          label: "Quản lý đơn hàng",
          path: "/manager/orders",
        },
        {
          icon: AlertTriangle,
          label: "Xử lý hoàn tiền",
          path: "/manager/refund",
        },
      ],
    },
    {
      id: "system",
      label: "Quản Lý Hệ Thống",
      items: [
        { icon: Users, label: "Quản lý người dùng", path: "/manager/users" },
        {
          icon: AppWindow,
          label: "Giám sát sản phẩm",
          path: "/manager/products-all",
        },
        {
          icon: AlertTriangle,
          label: "Quản lý Tranh chấp",
          path: "/manager/disputes",
        },
        { icon: Gift, label: "Quản lý gói dịch vụ", path: "/manager/packages" },
      ],
    },
    {
      id: "reports",
      label: "Báo Cáo",
      items: [
        {
          icon: DollarSign,
          label: "Báo cáo doanh thu",
          path: "/manager/revenue",
        },
        { icon: BarChart3, label: "Báo cáo hệ thống", path: "/manager/system" },
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Floating gradient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-float [animation-delay:2s]" />
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
            <AuroraText text="Manager Panel" className="text-2xl font-bold" />
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Notify />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-20 bottom-0 z-40 transition-all duration-300 border-r backdrop-blur-xl overflow-y-auto ${
          sidebarOpen ? "w-72" : "w-0"
        } ${
          isDark
            ? "bg-gray-900/90 border-gray-800"
            : "bg-white/90 border-gray-200"
        }`}
      >
        <nav className="p-4 space-y-4">
          {menuGroups.map((group) => (
            <div key={group.id}>
              {/* Group Header */}
              {group.id !== "dashboard" && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 mb-2 rounded-lg transition-colors ${
                    isDark
                      ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {group.label}
                  </span>
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Group Items */}
              {(group.id === "dashboard" ||
                expandedGroups.includes(group.id)) && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? isDark
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "bg-purple-50 text-purple-600 border border-purple-200"
                            : isDark
                            ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm whitespace-nowrap">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Divider */}
          <div
            className={`h-px my-4 ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
          />

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
          sidebarOpen ? "ml-72" : "ml-0"
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
