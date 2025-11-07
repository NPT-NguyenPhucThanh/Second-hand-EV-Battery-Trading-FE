import React, { useState, useEffect } from "react";
import { useUser } from "../../../contexts/UserContext";
import { useNavigate } from "react-router-dom"; 
import api from "../../../utils/api"; 
import { Tag, Button, Spin, Empty, Modal, Form, Upload, message, Alert } from "antd"; 
import { UploadOutlined, SolutionOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { getSelfUpgradeStatus, requestSellerUpgrade, resubmitSellerUpgrade } from "../../../services/sellerUpgradeService";

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

  const [upgradeStatus, setUpgradeStatus] = useState(null); 
  const [statusLoading, setStatusLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
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
          if(res.upgradeStatus === 'REJECTED') {
            setRejectionReason(res.rejectionReason);
          }
        }
      } catch (err) {
        message.error("Không thể tải trạng thái nâng cấp.");
      } finally {
        setStatusLoading(false);
      }
    };

    fetchOrders();
    fetchUpgradeStatus(); 
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

  const showUpgradeModal = () => {
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

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
      let res;
      if (upgradeStatus === 'REJECTED') {
        res = await resubmitSellerUpgrade(formData);
      } else {
        res = await requestSellerUpgrade(formData);
      }

      if (res.status === "success") {
        message.success(res.message);
        setUpgradeStatus(res.upgradeStatus || 'PENDING');
        setIsModalOpen(false);
      } else {
        throw new Error(res.message || "Gửi yêu cầu thất bại");
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const renderUpgradeSection = () => {
    if (statusLoading) {
      return (
        <div className="text-center p-4">
          <Spin />
        </div>
      );
    }

    if (user.roles && user.roles.includes("SELLER")) {
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
      case "NOT_REQUESTED":
      default:
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <SolutionOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <p className="mt-2 text-gray-700">
              Bạn muốn trở thành Người bán để đăng bán sản phẩm?
            </p>
            <Button type="primary" onClick={showUpgradeModal} className="mt-2">
              Nâng cấp ngay
            </Button>
          </div>
        );
    }
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

        <hr className="my-10" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Trở thành Người bán</h2>
          {renderUpgradeSection()}
        </div>

        {/* --- Order History Section (giữ nguyên) --- */}
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
                    
                    {order.status === "DA_DUYET" && (
                      <Button
                        type="primary"
                        onClick={() => handleFinalPayment(order.orderid)}
                        style={{ marginTop: '8px' }}
                      >
                        Thanh toán 90% còn lại
                      </Button>
                    )}
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
      </main>

      <Modal
        title={upgradeStatus === 'REJECTED' ? "Gửi lại yêu cầu nâng cấp" : "Nâng cấp tài khoản Seller"}
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={[
          <Button key="back" onClick={handleModalCancel} disabled={submitting}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" loading={submitting} onClick={() => form.submit()}>
            Gửi yêu cầu
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          disabled={submitting}
        >
          <Alert
            message="Yêu cầu thông tin"
            description="Vui lòng tải lên ảnh chụp 2 mặt Căn cước công dân (CCCD) của bạn để xác thực. (File < 5MB)"
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
          <Form.Item
            name="cccdFront"
            label="CCCD mặt trước"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Vui lòng tải lên mặt trước CCCD" }]}
          >
            <Upload
              name="cccdFront"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false} 
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="cccdBack"
            label="CCCD mặt sau"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Vui lòng tải lên mặt sau CCCD" }]}
          >
            <Upload
              name="cccdBack"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false} 
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}