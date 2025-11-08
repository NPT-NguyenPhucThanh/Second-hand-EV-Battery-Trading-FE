// ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "../../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { Alert, Button, Modal, Form, Upload, message, Spin } from "antd";
import { SolutionOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { getSelfUpgradeStatus, requestSellerUpgrade, resubmitSellerUpgrade } from "../../../services/sellerUpgradeService";

import ProfileInfo from "../../profile/ProfileInfo";
import OrderHistoryContent from "../../profile/OrderHistoryContent";
import DisputesContent from "../DisputesContent";
const MENU = {
  PROFILE: "profile",
  ORDERS: "orders",
  DISPUTES: "disputes",
  ADDRESS: "address",
  PASSWORD: "password",
  NOTIFICATIONS: "notifications",
  VOUCHERS: "vouchers",
};

export default function ProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(MENU.PROFILE);

  const [upgradeStatus, setUpgradeStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
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
    fetchUpgradeStatus();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-700 mb-4">Bạn cần đăng nhập để xem trang cá nhân.</p>
          <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  const showUpgradeModal = () => setIsModalOpen(true);
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

  const normFile = (e) => (Array.isArray(e) ? e : e && e.fileList);

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
            description="Yêu cầu nâng cấp của bạn đã được gửi và đang chờ quản trị viên xét duyệt."
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

  const renderContent = () => {
    if (activeMenu === MENU.PROFILE) {
      return (
        <>
          <ProfileInfo />
          <hr className="my-10" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Trở thành Người bán</h2>
            {renderUpgradeSection()}
          </div>
        </>
      );
    }

    if (activeMenu === MENU.ORDERS) {
      return <OrderHistoryContent />;
    }
    if (activeMenu === MENU.DISPUTES){
      return <DisputesContent/>
    }

    return (
      <div className="text-center py-16 text-gray-500">
        <i className="fa-regular fa-face-meh text-6xl mb-4"></i>
        <p>Chức năng này đang được phát triển...</p>
      </div>
    );
  };

  return (
    <div className="pt-14 min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r p-6 hidden md:block">
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
            <MenuItem
              icon="fa-regular fa-user"
              label="Hồ Sơ"
              active={activeMenu === MENU.PROFILE}
              onClick={() => setActiveMenu(MENU.PROFILE)}
            />
            <MenuItem
              icon="fa-regular fa-credit-card"
              label="Khiếu nại"
              active={activeMenu === MENU.DISPUTES}
              onClick={() => setActiveMenu(MENU.DISPUTES)}
            />
            <MenuItem
              icon="fa-solid fa-location-dot"
              label="Địa Chỉ"
              active={activeMenu === MENU.ADDRESS}
              onClick={() => setActiveMenu(MENU.ADDRESS)}
            />
            <MenuItem
              icon="fa-solid fa-lock"
              label="Đổi Mật Khẩu"
              active={activeMenu === MENU.PASSWORD}
              onClick={() => setActiveMenu(MENU.PASSWORD)}
            />
            <MenuItem
              icon="fa-regular fa-bell"
              label="Cài Đặt Thông Báo"
              active={activeMenu === MENU.NOTIFICATIONS}
              onClick={() => setActiveMenu(MENU.NOTIFICATIONS)}
            />
          </ul>

          <hr className="my-4" />

          <ul className="space-y-2">
            <MenuItem
              icon="fa-solid fa-box"
              label="Đơn Mua"
              active={activeMenu === MENU.ORDERS}
              onClick={() => setActiveMenu(MENU.ORDERS)}
            />
            <MenuItem
              icon="fa-solid fa-ticket"
              label="Kho Voucher"
              active={activeMenu === MENU.VOUCHERS}
              onClick={() => setActiveMenu(MENU.VOUCHERS)}
            />
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-white shadow-sm mx-auto max-w-4xl">
        {renderContent()}
      </main>

      {/* Modal nâng cấp */}
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
    </div>
  );
}

// Component con để tái sử dụng menu
const MenuItem = ({ icon, label, active, onClick }) => (
  <li
    className={`flex items-center space-x-2 cursor-pointer transition ${
      active ? "text-blue-500 font-medium" : "hover:text-blue-500"
    }`}
    onClick={onClick}
  >
    <i className={icon}></i>
    <span>{label}</span>
  </li>
);