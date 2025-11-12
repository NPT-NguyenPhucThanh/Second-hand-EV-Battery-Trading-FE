import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import UserDetailModal from "./components/UserDetailModal";
import {
  getAllUser,
  getAllCustomer,
  lockUserById,
  getUser,
  getCustomer,
} from "../../../services/userService";
import { useTheme } from "../../../contexts/ThemeContext";
import { toast } from "sonner";
import AuroraText from "../../../components/common/AuroraText";
import {
  Users,
  ShoppingBag,
  Shield,
  Mail,
  Lock,
  Unlock,
  Search,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function UserManagement() {
  const { isDark } = useTheme();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const [activeTabKey, setActiveTabKey] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();
  const isManager = location.pathname.startsWith("/manager");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = isManager ? await getAllUser() : await getAllCustomer();
      if (res && res.status === "success") {
        setAllUsers(res.users.map((u) => ({ ...u, key: u.userId })));
      } else {
        toast.error(res.message || "Không thể tải danh sách người dùng!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối khi tải danh sách người dùng!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManager]);

  const displayedUsers = useMemo(() => {
    let filtered = [...allUsers];

    if (!isManager) {
      if (activeTabKey === "buyer") {
        filtered = filtered.filter(
          (user) =>
            user.roles.includes("BUYER") && !user.roles.includes("SELLER")
        );
      } else if (activeTabKey === "seller") {
        filtered = filtered.filter((user) => user.roles.includes("SELLER"));
      }
    }

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(lowercasedSearchTerm) ||
          (user.displayName &&
            user.displayName.toLowerCase().includes(lowercasedSearchTerm)) ||
          user.email.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    return filtered;
  }, [allUsers, activeTabKey, searchTerm, isManager]);

  const handleLockToggle = async (userId, isCurrentlyActive) => {
    try {
      const isLock = isCurrentlyActive;
      const response = await lockUserById(userId, isLock);
      if (response === "User locked/unlocked") {
        toast.success(
          `Đã ${isLock ? "khóa" : "mở khóa"} tài khoản thành công!`
        );
        fetchUsers();
      } else {
        throw new Error("Phản hồi từ server không hợp lệ.");
      }
    } catch (err) {
      toast.error("Thao tác thất bại, vui lòng thử lại!");
      console.error(err);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const res = isManager ? await getUser(userId) : await getCustomer(userId);
      if (res.status === "success") {
        setSelectedUser(res.user);
        setIsDetailModalVisible(true);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Không thể tải chi tiết người dùng!");
      console.error(err);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      MANAGER: {
        color: "bg-red-500/20 text-red-400",
        label: "Manager",
        icon: Shield,
      },
      STAFF: {
        color: "bg-blue-500/20 text-blue-400",
        label: "Staff",
        icon: Users,
      },
      SELLER: {
        color: "bg-green-500/20 text-green-400",
        label: "Seller",
        icon: ShoppingBag,
      },
      BUYER: {
        color: "bg-purple-500/20 text-purple-400",
        label: "Buyer",
        icon: Users,
      },
    };
    return badges[role] || badges.BUYER;
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <Loader2
          className={`w-12 h-12 animate-spin ${
            isDark ? "text-blue-400" : "text-blue-500"
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Header */}
      <div className="mb-8">
        <AuroraText className="text-4xl font-bold mb-2">
          Quản Lý Người Dùng
        </AuroraText>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Quản lý tài khoản và phân quyền người dùng
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-6">
        <div
          className={`flex items-center gap-3 p-4 rounded-xl ${
            isDark ? "bg-gray-800/50" : "bg-white shadow-md"
          }`}
        >
          <Search className={isDark ? "text-gray-400" : "text-gray-500"} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 bg-transparent border-none outline-none ${
              isDark
                ? "text-white placeholder-gray-500"
                : "text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>

        {/* Tabs for Staff */}
        {!isManager && (
          <div className="flex gap-4 mt-4">
            {[
              { key: "all", label: "Tất cả" },
              { key: "buyer", label: "Người Mua" },
              { key: "seller", label: "Người Bán" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTabKey(tab.key)}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  activeTabKey === tab.key
                    ? isDark
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-blue-500 text-white"
                    : isDark
                    ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedUsers.map((user) => (
          <div
            key={user.userId}
            className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 ${
              isDark ? "bg-gray-800/50 backdrop-blur-sm" : "bg-white shadow-lg"
            }`}
          >
            {/* User Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <Users
                    className={`w-6 h-6 ${
                      isDark ? "text-blue-400" : "text-blue-500"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.displayName || user.username}
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    @{user.username}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {user.isActive ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-medium text-green-400">
                    Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-red-400">
                    Locked
                  </span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 mb-4">
              <Mail
                className={`w-4 h-4 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <p
                className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {user.email}
              </p>
            </div>

            {/* Roles */}
            <div className="flex flex-wrap gap-2 mb-4">
              {user.roles.map((role) => {
                const badge = getRoleBadge(role);
                const RoleIcon = badge.icon;
                return (
                  <div
                    key={role}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg ${badge.color}`}
                  >
                    <RoleIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{badge.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button
                onClick={() => handleViewDetails(user.userId)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                  isDark
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <Eye className="w-4 h-4" />
                Chi tiết
              </button>

              {isManager && !user.roles.includes("MANAGER") && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Bạn chắc muốn ${
                          user.isActive ? "khóa" : "mở khóa"
                        } tài khoản này?`
                      )
                    ) {
                      handleLockToggle(user.userId, user.isActive);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    user.isActive
                      ? isDark
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-red-500 text-white hover:bg-red-600"
                      : isDark
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {user.isActive ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayedUsers.length === 0 && (
        <div className="text-center py-12">
          <Users
            className={`w-16 h-16 mx-auto mb-4 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Không tìm thấy người dùng nào
          </p>
        </div>
      )}

      <UserDetailModal
        user={selectedUser}
        visible={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
      />
    </div>
  );
}
