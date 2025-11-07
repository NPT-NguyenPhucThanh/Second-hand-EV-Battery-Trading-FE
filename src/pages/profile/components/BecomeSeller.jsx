import React, { useState, useEffect } from "react";
import { useUser } from "../../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import {
  Tag, Button, Spin, Empty, Modal, Form, Upload, message, Alert, Card
} from "antd";
import {
  UploadOutlined, SolutionOutlined, CheckCircleOutlined, SyncOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import {
  getSelfUpgradeStatus, requestSellerUpgrade, resubmitSellerUpgrade
} from "../../../services/sellerUpgradeService";
import {
  getSellerUpgradeStatus, getUserProfile, updateUserProfile,
  changePassword as svcChangePassword
} from "../../../utils/services/userService";
import BecomeSellerModal from "../components/BecomeSellerModal";
import { get } from "../../../utils/api";

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
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  // === Profile edit states ===
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingBirthDate, setEditingBirthDate] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [birthDate, setBirthDate] = useState(user?.birthDate || "");
  const [username, setUsername] = useState(user?.displayname || user?.username || "");

  // === Order history states ===
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  // === Seller upgrade states ===
  const [upgradeStatus, setUpgradeStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // === Seller products states ===
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // === View mode: profile | password ===
  const [viewMode, setViewMode] = useState("profile");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // === useEffect: Load orders + upgrade status + products ===
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

    const fetchUpgradeStatus = async () => {
      if (!user) return;
      setStatusLoading(true);
      try {
        const res = await getSelfUpgradeStatus();
        if (res.status === "success") {
          setUpgradeStatus(res.upgradeStatus);
          if (res.upgradeStatus === 'REJECTED') {
            setRejectionReason(res.rejectionReason);
          }
        }
      } catch (err) {
        message.error("Không thể tải trạng thái nâng cấp.");
      } finally {
        setStatusLoading(false);
      }
    };

    const fetchProducts = async () => {
      if (!user || !user.roles?.includes("SELLER")) {
        setLoadingProducts(false);
        return;
      }
      try {
        const res = await get("api/seller/products");
        setProducts(res.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchOrders();
    fetchUpgradeStatus();
    fetchProducts();
  }, [user]);

  // === Reload user profile after upgrade ===
  const reloadUserProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res) {
        updateUser(res);
        message.success("Tài khoản đã cập nhật trạng thái mới nhất!");
        setUsername(res.displayname || res.username || "");
        setPhone(res.phone || "");
        setBirthDate(res.dateofbirth || res.dateOfBirth || "");
      }
    } catch (err) {
      message.warning("Không thể tải lại thông tin user, thử lại sau.");
    }
  };

  // === Update profile ===
  const handleUpdate = async (e) => {
    e?.preventDefault();
    try {
      const payload = { displayname: username, phone, dateofbirth: birthDate };
      const res = await updateUserProfile(payload);
      if (res) {
        await reloadUserProfile();
        message.success("Cập nhật hồ sơ thành công");
      }
    } catch (err) {
      message.error(err.message || "Cập nhật thất bại");
    }
  };

  // === Change password ===
  const handleChangePassword = async (e) => {
    e?.preventDefault();
    if (newPass !== confirmPass) return message.error("Mật khẩu xác nhận không khớp!");
    if (!newPass || newPass.length < 6) return message.error("Mật khẩu mới phải ít nhất 6 ký tự!");

    try {
      const res = await svcChangePassword(oldPass, newPass);
      if (res?.status === "success" || res === true) {
        setOldPass(""); setNewPass(""); setConfirmPass("");
        message.success("Đổi mật khẩu thành công!");
        setViewMode("profile");
      } else {
        throw new Error(res?.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      message.error(err.message || "Có lỗi khi đổi mật khẩu");
    }
  };

  // === Seller upgrade form ===
  const showUpgradeModal = () => setIsModalOpen(true);
  const handleModalCancel = () => { setIsModalOpen(false); form.resetFields(); };

  const handleFormSubmit = async (values) => {
    if (!values.cccdFront || !values.cccdBack) {
      message.error("Vui lòng tải lên đủ 2 mặt CCCD");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("cccdFront", values.cccdFront[0].originFileObj);
    formData.append("cccdBack", values.cccdBack[0].originFileObj);

    try {
      const res = upgradeStatus === 'REJECTED'
        ? await resubmitSellerUpgrade(formData)
        : await requestSellerUpgrade(formData);

      if (res.status === "success") {
        message.success(res.message);
        setUpgradeStatus(res.upgradeStatus || 'PENDING');
        setIsModalOpen(false);
        await reloadUserProfile();
      } else {
        throw new Error(res.message || "Gửi yêu cầu thất bại");
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const normFile = (e) => (Array.isArray(e) ? e : e && e.fileList);

  // === Render upgrade section ===
  const renderUpgradeSection = () => {
    if (statusLoading) return <div className="text-center p-4"><Spin /></div>;

    if (user.roles?.includes("SELLER")) {
      return (
        <Alert
          message="Bạn đã là Người bán"
          description="Tài khoản của bạn đã có đầy đủ quyền đăng bán sản phẩm."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      );
    }

    switch (upgradeStatus) {
      case "APPROVED":
        return (
          <Alert
            message="Nâng cấp thành công"
            description="Yêu cầu của bạn đã được duyệt. Vui lòng đăng xuất và đăng nhập lại để cập nhật quyền."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        );
      case "PENDING":
        return (
          <Alert
            message="Đang chờ duyệt"
            description="Yêu cầu nâng cấp của bạn đã được gửi và đang chờ quản trị viên xét duyệt. Vui lòng quay lại sau."
            type="info"
            showIcon
            icon={<SyncOutlined spin />}
          />
        );
      case "REJECTED":
        return (
          <Alert
            message="Yêu cầu bị từ chối"
            description={
              <>
                <p>Lý do: {rejectionReason || "Không có lý do cụ thể."}</p>
                <Button type="primary" onClick={showUpgradeModal} style={{ marginTop: 10 }}>
                  Gửi lại yêu cầu
                </Button>
              </>
            }
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
          />
        );
      default:
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <SolutionOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <p className="mt-2 text-gray-700">Bạn muốn trở thành Người bán để đăng bán sản phẩm?</p>
            <Button type="primary" onClick={showUpgradeModal} className="mt-2">
              Nâng cấp ngay
            </Button>
          </div>
        );
    }
  };

  // === Render products section (gộp từ UserProfile) ===
  const renderProductsSection = () => {
    if (!user.roles?.includes("SELLER")) return null;

    if (loadingProducts) {
      return <div className="text-center py-20"><Spin size="large" /></div>;
    }

    if (products.length === 0) {
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12 text-center border-4 border-green-200">
          <i className="fa-solid fa-gift text-9xl text-green-600 mb-8"></i>
          <p className="text-4xl font-bold mb-6 text-green-800">Chào mừng Seller mới!</p>
          <Button
            type="primary"
            size="large"
            className="bg-green-600 h-16 text-2xl px-16 rounded-2xl"
            onClick={() => navigate("/listings/new")}
          >
            Đăng sản phẩm ngay
          </Button>
        </div>
      );
    }

    return (
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
            onClick={() => navigate(`/listings/${p.productid}`)}
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
    );
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
            <li
              className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer"
              onClick={() => setViewMode("password")}
            >
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

        {/* Profile & Password Form */}
        <div className="flex flex-col md:flex-row gap-10 mb-12">
          {viewMode === "profile" ? (
            <form onSubmit={handleUpdate} className="flex-1 space-y-6">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Tên đăng nhập</label>
                <p className="text-gray-800">{user.email}</p>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Tên</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Số điện thoại</label>
                {editingPhone ? (
                  <div className="flex gap-2">
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="border rounded p-2 flex-1" />
                    <button type="button" onClick={() => { setEditingPhone(false); handleUpdate(); }} className="text-blue-500">Lưu</button>
                  </div>
                ) : (
                  <p className="text-gray-800">
                    {phone || "Chưa cập nhật"}{" "}
                    <span onClick={() => setEditingPhone(true)} className="text-blue-500 cursor-pointer hover:underline">Thay Đổi</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Ngày sinh</label>
                {editingBirthDate ? (
                  <div className="flex gap-2">
                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="border rounded p-2" />
                    <button type="button" onClick={() => { setEditingBirthDate(false); handleUpdate(); }} className="text-blue-500">Lưu</button>
                  </div>
                ) : (
                  <p className="text-gray-800">
                    {birthDate || "**/**/****"}{" "}
                    <span onClick={() => setEditingBirthDate(true)} className="text-blue-500 cursor-pointer hover:underline">Thay Đổi</span>
                  </p>
                )}
              </div>
              <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded font-medium">
                Lưu
              </button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Đổi mật khẩu</h3>
                <button type="button" onClick={() => setViewMode("profile")} className="text-sm text-blue-500">Quay lại</button>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Mật khẩu cũ</label>
                <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} required className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Mật khẩu mới</label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={6} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Xác nhận mật khẩu</label>
                <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required className="w-full border rounded-md p-2" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white rounded font-medium">
                  Đổi mật khẩu
                </button>
                <button type="button" onClick={() => setViewMode("profile")} className="px-6 py-2 border rounded">Hủy</button>
              </div>
            </form>
          )}

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

        {/* Seller Upgrade */}
        <hr className="my-10" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Trở thành Người bán</h2>
          {renderUpgradeSection()}
        </div>

        {/* Products Section */}
        {user.roles?.includes("SELLER") && (
          <>
            <hr className="my-10" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <i className="fa-solid fa-store mr-3 text-blue-600"></i>
                Sản phẩm đang bán
              </h2>
              {renderProductsSection()}
            </div>
          </>
        )}

        {/* Order History */}
        <hr className="my-10" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Lịch Sử Đơn Hàng</h2>
          {loadingOrders ? (
            <div className="text-center"><Spin size="large" /><p>Đang tải...</p></div>
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
                    {order.status === "DA_DUYET" && (
                      <Button type="primary" onClick={() => handleFinalPayment(order.orderid)} style={{ marginTop: '8px' }}>
                        Thanh toán 90% còn lại
                      </Button>
                    )}
                    {order.status === "THAT_BAI" && order.paymentmethod === "VNPAY" && (
                      <>
                        <Button danger type="primary" onClick={() => handleFinalPayment(order.orderid)} style={{ marginTop: '8px' }}>
                          Thanh toán lại
                        </Button>
                        <Button danger type="primary" onClick={() => navigate(`/checkout/deposit/${order.orderid}`)} style={{ marginTop: '8px' }}>
                          Đặt cọc lại 10%
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      <Modal
        title={upgradeStatus === 'REJECTED' ? "Gửi lại yêu cầu nâng cấp" : "Nâng cấp tài khoản Seller"}
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={[
          <Button key="back" onClick={handleModalCancel} disabled={submitting}>Hủy</Button>,
          <Button key="submit" type="primary" loading={submitting} onClick={() => form.submit()}>Gửi yêu cầu</Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} disabled={submitting}>
          <Alert
            message="Yêu cầu thông tin"
            description="Vui lòng tải lên ảnh chụp 2 mặt Căn cước công dân (CCCD) của bạn để xác thực. (File < 5MB)"
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
          <Form.Item name="cccdFront" label="CCCD mặt trước" valuePropName="fileList" getValueFromEvent={normFile}
            rules={[{ required: true, message: "Vui lòng tải lên mặt trước CCCD" }]}>
            <Upload name="cccdFront" listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="cccdBack" label="CCCD mặt sau" valuePropName="fileList" getValueFromEvent={normFile}
            rules={[{ required: true, message: "Vui lòng tải lên mặt sau CCCD" }]}>
            <Upload name="cccdBack" listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* BecomeSellerModal */}
      <BecomeSellerModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={reloadUserProfile}
      />
    </div>
  );
}