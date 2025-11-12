import React, { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function ProfileInfo() {
  const { user } = useUser();
  const { isDark } = useTheme();
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingBirthDate, setEditingBirthDate] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [birthDate, setBirthDate] = useState(user?.birthDate || "");

  return (
    <div>
      <h2
        className={`text-2xl font-semibold mb-1 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        Hồ Sơ Của Tôi
      </h2>
      <p
        className={`text-sm mb-8 ${isDark ? "text-gray-200" : "text-gray-500"}`}
      >
        Quản lý thông tin hồ sơ để bảo mật tài khoản
      </p>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Form Info */}
        <form className="flex-1 space-y-6">
          <div>
            <label
              className={`block text-sm mb-1 ${
                isDark ? "text-gray-200" : "text-gray-600"
              }`}
            >
              Tên đăng nhập
            </label>
            <p className={isDark ? "text-white" : "text-gray-800"}>
              {user.email}
            </p>
          </div>

          <div>
            <label
              className={`block text-sm mb-1 ${
                isDark ? "text-gray-200" : "text-gray-600"
              }`}
            >
              Tên
            </label>
            <input
              type="text"
              defaultValue={user.username || ""}
              className={`w-full border rounded-md p-2 focus:ring-blue-400 focus:border-blue-400 ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-800"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm mb-1 ${
                isDark ? "text-gray-200" : "text-gray-600"
              }`}
            >
              Số điện thoại
            </label>
            {editingPhone ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`border rounded-md p-2 flex-1 ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setEditingPhone(false)}
                  className="text-blue-500 hover:underline"
                >
                  Lưu
                </button>
              </div>
            ) : (
              <p className={isDark ? "text-white" : "text-gray-800"}>
                {phone || "Chưa cập nhật"}{" "}
                <span
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={() => setEditingPhone(true)}
                >
                  Thay Đổi
                </span>
              </p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm mb-1 ${
                isDark ? "text-gray-200" : "text-gray-600"
              }`}
            >
              Ngày sinh
            </label>
            {editingBirthDate ? (
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={`border rounded-md p-2 ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setEditingBirthDate(false)}
                  className="text-blue-500 hover:underline"
                >
                  Lưu
                </button>
              </div>
            ) : (
              <p className={isDark ? "text-white" : "text-gray-800"}>
                {birthDate || "**/**/****"}{" "}
                <span
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={() => setEditingBirthDate(true)}
                >
                  Thay Đổi
                </span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-md font-medium"
          >
            Lưu
          </button>
        </form>

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center overflow-hidden shadow-md">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="object-cover w-full h-full"
              />
            ) : (
              <i className="fa-regular fa-user text-white text-5xl"></i>
            )}
          </div>
          <button
            className={`mt-4 px-4 py-1 border rounded-md text-sm ${
              isDark
                ? "border-blue-400 text-blue-400 hover:bg-blue-900/20"
                : "border-blue-400 text-blue-600 hover:bg-blue-50"
            }`}
          >
            Chọn Ảnh
          </button>
          <p
            className={`text-xs text-center mt-2 leading-tight ${
              isDark ? "text-gray-200" : "text-gray-400"
            }`}
          >
            Dụng lượng file tối đa 1 MB
            <br />
            Định dạng: JPEG, PNG
          </p>
        </div>
      </div>
    </div>
  );
}
