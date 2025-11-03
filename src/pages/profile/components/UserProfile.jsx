// src/pages/profile/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "../../../contexts/UserContext";
import { Button, Card, Spin } from "antd";
import { get } from "../../../utils/api";
import BecomeSellerModal from "../components/BecomeSellerModal";

export default function UserProfile() {
  const { user } = useUser();
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingBirthDate, setEditingBirthDate] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [birthDate, setBirthDate] = useState(user?.birthDate || "");
  
  // Modal
  const [showModal, setShowModal] = useState(false);

  // Sản phẩm
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "SELLER") {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        const res = await get("/api/seller/products");
        setProducts(res.products || []);
      } catch {
        setProducts([
          { productid: 1, productname: "Pin 48V Pro", cost: 12500000, images: [""], status: "DANG_BAN" },
          { productid: 2, productname: "Sạc 60V", cost: 8900000, images: [""], status: "DANG_BAN" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

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

        {/* Form cũ */}
        <div className="flex flex-col md:flex-row gap-10 mb-12">
          <form className="flex-1 space-y-6">
            <div><label className="block text-gray-600 text-sm mb-1">Tên đăng nhập</label>
              <p className="text-gray-800">{user.email}</p>
            </div>
            <div><label className="block text-gray-600 text-sm mb-1">Tên</label>
              <input type="text" defaultValue={user.username || ""} className="w-full border rounded-md p-2" />
            </div>
            <div><label className="block text-gray-600 text-sm mb-1">Số điện thoại</label>
              {editingPhone ? (
                <div className="flex gap-2">
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="border rounded p-2 flex-1" />
                  <button type="button" onClick={() => setEditingPhone(false)} className="text-blue-500">Lưu</button>
                </div>
              ) : (
                <p className="text-gray-800">{phone || "Chưa cập nhật"} <span onClick={() => setEditingPhone(true)} className="text-blue-500 cursor-pointer hover:underline">Thay Đổi</span></p>
              )}
            </div>
            <div><label className="block text-gray-600 text-sm mb-1">Ngày sinh</label>
              {editingBirthDate ? (
                <div className="flex gap-2">
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="border rounded p-2" />
                  <button type="button" onClick={() => setEditingBirthDate(false)} className="text-blue-500">Lưu</button>
                </div>
              ) : (
                <p className="text-gray-800">{birthDate || "**/**/****"} <span onClick={() => setEditingBirthDate(true)} className="text-blue-500 cursor-pointer hover:underline">Thay Đổi</span></p>
              )}
            </div>
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded font-medium">
              Lưu
            </button>
          </form>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center overflow-hidden shadow-md">
              {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <i className="fa-regular fa-user text-white text-5xl"></i>}
            </div>
            <button className="mt-4 px-4 py-1 border border-blue-400 text-blue-600 rounded text-sm hover:bg-blue-50">
              Chọn Ảnh
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">Dụng lượng file tối đa 1 MB<br />Định dạng: JPEG, PNG</p>
          </div>
        </div>

        {/* SẢN PHẨM ĐANG BÁN */}
        <div className="border-t pt-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <i className="fa-solid fa-store mr-3 text-blue-600"></i>
            Sản phẩm đang bán
          </h3>

          {/* CHƯA LÀ SELLER */}
          {user.role !== "SELLER" && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-10 text-center border-2 border-blue-200">
              <i className="fa-solid fa-crown text-7xl text-purple-600 mb-6"></i>
              <p className="text-3xl font-bold mb-4">Bắt đầu bán hàng ngay!</p>
              <p className="text-lg text-gray-600 mb-8">Chỉ 30 giây để trở thành <strong>Người bán</strong></p>
              <Button type="primary" size="large" className="h-14 text-xl px-12" onClick={() => setShowModal(true)}>
                Trở thành Người bán
              </Button>
            </div>
          )}

          {/* ĐANG CHỜ DUYỆT */}
          {user.role === "SELLER" && user.sellerUpgradeStatus === "PENDING" && (
            <div className="bg-yellow-50 rounded-2xl p-10 text-center border-2 border-yellow-300">
              <i className="fa-solid fa-hourglass-half text-7xl text-yellow-600 mb-6"></i>
              <p className="text-3xl font-bold text-yellow-800">Đang chờ duyệt</p>
              <p className="text-lg mt-4">Yêu cầu đã gửi. Vui lòng chờ <strong>24h</strong>.</p>
            </div>
          )}

          {/* CHƯA CÓ SP */}
          {user.role === "SELLER" && user.sellerUpgradeStatus === "APPROVED" && products.length === 0 && !loading && (
            <div className="bg-green-50 rounded-2xl p-10 text-center border-2 border-green-200">
              <i className="fa-solid fa-box-open text-7xl text-green-600 mb-6"></i>
              <p className="text-3xl font-bold mb-4">Chưa có sản phẩm</p>
              <p className="text-lg mb-8">Đăng ngay sản phẩm đầu tiên!</p>
              <Button type="primary" size="large" className="bg-green-600 h-14 text-xl px-12" onClick={() => window.location.href = "/listings/new"}>
                Đăng sản phẩm
              </Button>
            </div>
          )}

          {/* CÓ SP */}
          {products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(p => (
                <Card key={p.productid} hoverable cover={<img src={p.images?.[0] || "https://via.placeholder.com/300"} alt={p.productname} className="h-56 object-cover" />}
                  onClick={() => window.location.href = `/listings/${p.productid}`} className="shadow-lg hover:shadow-2xl transition">
                  <div className="p-4">
                    <h4 className="font-bold text-lg line-clamp-2">{p.productname}</h4>
                    <p className="text-red-600 font-bold text-2xl mt-2">{p.cost?.toLocaleString()}đ</p>
                    <span className={`inline-block px-4 py-1 rounded-full text-sm mt-3 ${p.status === "DANG_BAN" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {p.status === "DANG_BAN" ? "Đang bán" : "Tạm ẩn"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {loading && <div className="text-center py-16"><Spin size="large" /></div>}
        </div>

        {/* MODAL TRỞ THÀNH SELLER */}
        <BecomeSellerModal visible={showModal} onClose={() => setShowModal(false)} />
      </main>
    </div>
  );
}