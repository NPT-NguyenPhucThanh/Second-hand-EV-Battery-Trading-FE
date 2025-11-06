import React, { useState, useEffect } from "react";
import { useUser } from "../../../contexts/UserContext";
import { useNavigate } from "react-router-dom"; 
import api from "../../../utils/api"; 
import { Tag, Button, Spin, Empty } from "antd"; 

const currency = (value) => {
  if (value === null || value === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const OrderStatusTag = ({ status }) => {
  let color = "default";
  if (status === "DA_DUYET") color = "cyan";
  if (status === "DA_HOAN_TAT") color = "success";
  if (status === "CHO_DUYET" || status === "CHO_DAT_COC") color = "processing";
  if (status === "BI_TU_CHOI" || status === "DA_HUY" || status === "THAT_BAI") color = "error";
  if (status === "TRANH_CHAP") color = "warning";
  
  return <Tag color={color}>{status}</Tag>;
};

export default function ProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [editingPhone, setEditingPhone] = useState(false);
  const [editingBirthDate, setEditingBirthDate] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [birthDate, setBirthDate] = useState(user?.birthDate || "");

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const response = await api.get("api/buyer/orders");
        if (response.status === "success") {
          const sortedOrders = (response.orders || []).sort(
            (a, b) => new Date(b.createdat) - new Date(a.createdat)
          );
          setOrders(sortedOrders);
        } else {
          setErrorOrders(response.message || "Không thể tải đơn hàng.");
        }
      } catch (err) {
        setErrorOrders(err.message || "Lỗi kết nối.");
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-700 mb-4">
            Bạn cần đăng nhập để xem trang cá nhân.
          </p>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  const handleFinalPayment = (orderId) => {
    navigate(`/checkout/final-payment/${orderId}`);
  };

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
              <p className="text-gray-800">{user.email}</p>
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">Tên</label>
              <input
                type="text"
                defaultValue={user.username || ""}
                className="w-full border rounded-md p-2 text-gray-800 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Số điện thoại
              </label>
              {editingPhone ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border rounded-md p-2 flex-1 focus:ring-blue-400 focus:border-blue-400"
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
                <p className="text-gray-800">
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

            {/* Ngày sinh */}
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Ngày sinh
              </label>
              {editingBirthDate ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="border rounded-md p-2 focus:ring-blue-400 focus:border-blue-400"
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
                <p className="text-gray-800">
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
              className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-md font-medium hover:from-blue-500 hover:to-blue-700 transition"
            >
              Lưu
            </button>
          </form>

          {/* Right: Upload Avatar */}
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
            <button className="mt-4 px-4 py-1 border border-blue-400 text-blue-600 rounded-md text-sm hover:bg-blue-50 transition">
              Chọn Ảnh
            </button>
            <p className="text-xs text-gray-400 text-center mt-2 leading-tight">
              Dụng lượng file tối đa 1 MB<br />
              Định dạng: JPEG, PNG
            </p>
          </div>
        </div>


              {/* --- 8. Add Order History Section --- */}
        <hr className="my-10" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Lịch Sử Đơn Hàng</h2>
          {loadingOrders ? (
            <div className="text-center">
              <Spin size="large" />
              <p>Đang tải lịch sử đơn hàng...</p>
            </div>
          ) : errorOrders ? (
            <Empty description={`Không thể tải đơn hàng: ${errorOrders}`} />
          ) : orders.length === 0 ? (
            <Empty description="Bạn chưa có đơn hàng nào." />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderid} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold">Đơn hàng #{order.orderid}</p>
                    <p className="text-sm text-gray-600">Ngày đặt: {new Date(order.createdat).toLocaleDateString("vi-VN")}</p>
                    <p className="font-semibold">Tổng tiền: {currency(order.totalfinal)}</p>
                  </div>
                  <div className="text-right">
                    <OrderStatusTag status={order.status} />
                    
                    {/* NÚT THANH TOÁN 90% */}
                    {order.status === "DA_DUYET" && (
                      <Button
                        type="primary"
                        onClick={() => handleFinalPayment(order.orderid)}
                        style={{ marginTop: '8px' }}
                      >
                        Thanh toán 90% còn lại
                      </Button>
                    )}

                    {/* NÚT THANH TOÁN LẠI (NẾU 90% THẤT BẠI) */}
                    {order.status === "THAT_BAI" && order.paymentmethod === "VNPAY" && (
                       <Button
                        danger
                        type="primary"
                        onClick={() => handleFinalPayment(order.orderid)}
                        style={{ marginTop: '8px' }}
                      >
                        Thanh toán lại
                      </Button>
                    )}
                    
                     {/* NÚT THANH TOÁN LẠI (NẾU ĐẶT CỌC 10% THẤT BẠI) */}
                    {order.status === "THAT_BAI" && order.paymentmethod === "VNPAY" && (
                       <Button
                        danger
                        type="primary"
                        onClick={() => navigate(`/checkout/deposit/${order.orderid}`)}
                        style={{ marginTop: '8px' }}
                      >
                        Đặt cọc lại 10%
                      </Button>
                    )}

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* ---------------------------------- */}


      </main>
    </div>
  );
}
