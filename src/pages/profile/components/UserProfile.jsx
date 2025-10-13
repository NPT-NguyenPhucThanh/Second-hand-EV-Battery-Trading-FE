import React from "react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex ">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r p-6 hidden md:block mt-15">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <i className="fa-regular fa-user text-white text-xl"></i>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Dang Hieu</p>
            <button className="text-sm text-blue-500 hover:underline">
              Sửa Hồ Sơ
            </button>
          </div>
        </div>

        <nav className="space-y-3 text-gray-700 text-sm">
          <p className="font-semibold text-gray-400 text-xs uppercase mb-2">
            Tài Khoản Của Tôi
          </p>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2 text-blue-500 font-medium">
              <i className="fa-regular fa-user"></i>
              <span>Hồ Sơ</span>
            </li>
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-regular fa-credit-card"></i>
              <span>Ngân Hàng</span>
            </li>
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-solid fa-location-dot"></i>
              <span>Địa Chỉ</span>
            </li>
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-solid fa-lock"></i>
              <span>Đổi Mật Khẩu</span>
            </li>
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-regular fa-bell"></i>
              <span>Cài Đặt Thông Báo</span>
            </li>
          </ul>

          <hr className="my-4" />

          <ul className="space-y-2">
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-solid fa-box"></i>
              <span>Đơn Mua</span>
            </li>
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-solid fa-ticket"></i>
              <span>Kho Voucher</span>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Profile Form */}
      <main className="flex-1 p-8 bg-white shadow-sm mt-6 md:mt-10 mx-auto max-w-4xl rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">Hồ Sơ Của Tôi</h2>
        <p className="text-gray-500 text-sm mb-8">
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </p>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Left: Form Info */}
          <form className="flex-1 space-y-6">
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Tên đăng nhập
              </label>
              <p className="text-gray-800">dagnhieu.work@gmail.com</p>
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">Tên</label>
              <input
                type="text"
                className="w-full border rounded-md p-2 text-gray-800 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Số điện thoại
              </label>
              <p className="text-gray-800">
                ********56{" "}
                <span className="text-blue-500 cursor-pointer hover:underline">
                  Thay Đổi
                </span>
              </p>
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">Giới tính</label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="gender"
                    defaultChecked
                    className="text-blue-500 focus:ring-blue-400"
                  />
                  <span>Nam</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input type="radio" name="gender" className="text-blue-500" />
                  <span>Nữ</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input type="radio" name="gender" className="text-blue-500" />
                  <span>Khác</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Ngày sinh
              </label>
              <p className="text-gray-800">
                **/**/2005{" "}
                <span className="text-blue-500 cursor-pointer hover:underline">
                  Thay Đổi
                </span>
              </p>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-md font-medium hover:from-blue-500 hover:to-blue-700 transition"
            >
              Lưu
            </button>
          </form>

          {/* Right: Upload Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center overflow-hidden shadow-md">
              <i className="fa-regular fa-user text-white text-5xl"></i>
            </div>
            <button className="mt-4 px-4 py-1 border border-blue-400 text-blue-600 rounded-md text-sm hover:bg-blue-50 transition">
              Chọn Ảnh
            </button>
            <p className="text-xs text-gray-400 text-center mt-2 leading-tight">
              Dụng lượng file tối đa 1 MB<br />
              Định dạng: JPEG, PNG
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
