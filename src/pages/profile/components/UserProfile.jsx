import React, { useState, useEffect } from "react";
import { useUser } from "../../../contexts/UserContext";
import { Button, Card, Spin, message } from "antd";
import { get } from "../../../utils/api";
import BecomeSellerModal from "../components/BecomeSellerModal";

export default function UserProfile() {
  const { user, updateUser } = useUser();
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingBirthDate, setEditingBirthDate] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [birthDate, setBirthDate] = useState(user?.birthDate || "");
  
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟦 Load danh sách sản phẩm nếu là seller
  useEffect(() => {
    if (!user || user.role !== "SELLER") {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        const res = await get("api/seller/products");
        setProducts(res.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  // 🟩 Hàm reload thông tin user sau khi gửi request seller upgrade
  const reloadUserProfile = async () => {
    try {
      const res = await get("api/client/profile");
      if (res?.profile) {
        updateUser(res.profile);
        localStorage.setItem("user", JSON.stringify(res.profile));
        message.success("Tài khoản đã cập nhật trạng thái mới nhất!");
      }
    } catch (err) {
      console.error("Không thể tải lại user:", err);
      message.warning("Không thể tải lại thông tin user, thử lại sau.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-700 mb-4">Bạn cần đăng nhập để xem trang cá nhân.</p>
          <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r p-6 hidden md:block mt-15">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <i className="fa-regular fa-user text-white text-xl"></i>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user.username}</p>
            <button className="text-sm text-blue-500 hover:underline">Sửa Hồ Sơ</button>
          </div>
        </div>
        <nav className="space-y-3 text-gray-700 text-sm">
          <p className="font-semibold text-gray-400 text-xs uppercase mb-2">Tài Khoản Của Tôi</p>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2 text-blue-500 font-medium">
              <i className="fa-regular fa-user"></i><span>Hồ Sơ</span>
            </li>
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-regular fa-credit-card"></i><span>Ngân Hàng</span>
            </li>
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-solid fa-location-dot"></i><span>Địa Chỉ</span>
            </li>
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-solid fa-lock"></i><span>Đổi Mật Khẩu</span>
            </li>
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-regular fa-bell"></i><span>Cài Đặt Thông Báo</span>
            </li>
          </ul>
          <hr className="my-4" />
          <ul className="space-y-2">
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-solid fa-box"></i><span>Đơn Mua</span>
            </li>
            <li className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
              <i className="fa-solid fa-ticket"></i><span>Kho Voucher</span>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 bg-white shadow-sm mt-6 md:mt-10 mx-auto max-w-4xl rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">Hồ Sơ Của Tôi</h2>
        <p className="text-gray-500 text-sm mb-8">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

        {/* Form thông tin cơ bản */}
        <div className="flex flex-col md:flex-row gap-10 mb-12">
          <form className="flex-1 space-y-6">
            <div>
              <label className="block text-gray-600 text-sm mb-1">Tên đăng nhập</label>
              <p className="text-gray-800">{user.email}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Tên</label>
              <input type="text" defaultValue={user.username || ""} className="w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Số điện thoại</label>
              {editingPhone ? (
                <div className="flex gap-2">
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="border rounded p-2 flex-1" />
                  <button type="button" onClick={() => setEditingPhone(false)} className="text-blue-500">Lưu</button>
                </div>
              ) : (
                <p className="text-gray-800">
                  {phone || "Chưa cập nhật"}{" "}
                  <span onClick={() => setEditingPhone(true)} className="text-blue-500 cursor-pointer hover:underline">
                    Thay Đổi
                  </span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Ngày sinh</label>
              {editingBirthDate ? (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="border rounded p-2"
                  />
                  <button type="button" onClick={() => setEditingBirthDate(false)} className="text-blue-500">Lưu</button>
                </div>
              ) : (
                <p className="text-gray-800">
                  {birthDate || "**/**/****"}{" "}
                  <span onClick={() => setEditingBirthDate(true)} className="text-blue-500 cursor-pointer hover:underline">
                    Thay Đổi
                  </span>
                </p>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded font-medium"
            >
              Lưu
            </button>
          </form>

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center overflow-hidden shadow-md">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <i className="fa-regular fa-user text-white text-5xl"></i>
              )}
            </div>
            <button className="mt-4 px-4 py-1 border border-blue-400 text-blue-600 rounded text-sm hover:bg-blue-50">
              Chọn Ảnh
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Dụng lượng file tối đa 1 MB<br />Định dạng: JPEG, PNG
            </p>
          </div>
        </div>

        {/* SẢN PHẨM ĐANG BÁN */}
        <div className="border-t pt-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <i className="fa-solid fa-store mr-3 text-blue-600"></i>
            Sản phẩm đang bán
          </h3>

          {/* 1. CHƯA LÀ SELLER */}
          {user.role !== "SELLER" && !user.sellerUpgradeStatus && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-12 text-center border-4 border-indigo-200 shadow-xl">
              <i className="fa-solid fa-crown text-9xl text-purple-600 mb-8"></i>
              <p className="text-4xl font-bold mb-6 text-purple-900">Mở shop riêng ngay hôm nay!</p>
              <p className="text-xl text-gray-700 mb-10">Chỉ 30 giây → Upload CCCD → Chờ duyệt → Bán hàng!</p>
              <Button
                type="primary"
                size="large"
                className="h-16 text-2xl px-16 rounded-2xl shadow-lg"
                onClick={() => setShowModal(true)}
              >
                Trở thành Người bán
              </Button>
            </div>
          )}

          {/* 2. PENDING */}
          {user.sellerUpgradeStatus === "PENDING" && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-12 text-center border-4 border-yellow-300 shadow-2xl">
              <i className="fa-solid fa-clock text-9xl text-yellow-600 mb-8 animate-pulse"></i>
              <p className="text-5xl font-bold text-yellow-800 mb-6">ĐANG CHỜ DUYỆT</p>
              <p className="text-2xl text-gray-700 mb-4">Yêu cầu đã gửi thành công!</p>
              <div className="bg-white rounded-2xl p-6 shadow-inner max-w-2xl mx-auto">
                <p className="text-lg text-gray-600">
                  Thời gian duyệt: <span className="text-red-600 font-bold">Trong 24 giờ</span>
                </p>
                <p className="text-lg text-gray-600 mt-3">
                  Email: <strong>{user.email}</strong>
                </p>
              </div>
            </div>
          )}

          {/* 3. APPROVED */}
          {user.role === "SELLER" && user.sellerUpgradeStatus === "APPROVED" && products.length === 0 && !loading && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12 text-center border-4 border-green-200">
              <i className="fa-solid fa-gift text-9xl text-green-600 mb-8"></i>
              <p className="text-4xl font-bold mb-6 text-green-800">Chào mừng Seller mới!</p>
              <Button
                type="primary"
                size="large"
                className="bg-green-600 h-16 text-2xl px-16 rounded-2xl"
                onClick={() => (window.location.href = "/listings/new")}
              >
                Đăng sản phẩm ngay
              </Button>
            </div>
          )}

          {/* 4. APPROVED + có sản phẩm */}
          {user.role === "SELLER" && user.sellerUpgradeStatus === "APPROVED" && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map((p) => (
                <Card
                  key={p.productid}
                  hoverable
                  cover={
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/400"}
                      alt={p.productname}
                      className="h-64 object-cover rounded-t-3xl"
                    />
                  }
                  onClick={() => (window.location.href = `/listings/${p.productid}`)}
                  className="shadow-2xl hover:shadow-3xl rounded-3xl overflow-hidden transition"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold line-clamp-2 mb-3">{p.productname}</h3>
                    <p className="text-3xl font-bold text-red-600 mb-4">
                      {p.cost?.toLocaleString()}đ
                    </p>
                    <span
                      className={`px-5 py-2 rounded-full text-sm font-bold ${
                        p.status === "DANG_BAN"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.status === "DANG_BAN" ? "Đang bán" : "Tạm ẩn"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {loading && (
            <div className="text-center py-20">
              <Spin size="large" />
            </div>
          )}
        </div>

        {/* MODAL */}
        <BecomeSellerModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={reloadUserProfile}
        />
      </main>
    </div>
  );
}
