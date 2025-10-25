// src/pages/admin/SellerRequestManagement.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, Tag, Space, message } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import AdminBreadcrumb from "../../components/admin/AdminBreadcrumb";
import { getSellerUpgradeRequests, approveSellerRequest } from "../../services/sellerUpgradeService";

export default function SellerRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getSellerUpgradeRequests();
      if (response && Array.isArray(response.requests)) {
        setRequests(response.requests);
      } else {
        setRequests([]);
        message.error("Không thể tải danh sách yêu cầu.");
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Đã xảy ra lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
      
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (userId) => {
    try {
      
      const payload = {
        approved: true,
        rejectionReason: null, 
      };
      await approveSellerRequest(userId, payload);
      message.success("Duyệt yêu cầu thành công!");
      fetchRequests();
    } catch (error) {
      message.error("Có lỗi xảy ra khi duyệt yêu cầu.");
      console.error("Lỗi khi duyệt:", error);
    }
  };
  
  const handleReject = async (userId) => {
  try {
    const reason = prompt("Vui lòng nhập lý do từ chối yêu cầu này:");
    if (reason === null || reason.trim() === "") {
      message.info("Hành động từ chối đã được hủy.");
      return; 
    }
    const payload = {
      approved: false,         
      rejectionReason: reason, 
    };
    await approveSellerRequest(userId, payload);
    message.success("Đã từ chối yêu cầu thành công.");
    fetchRequests();

  } catch (error) {
    console.error("Lỗi khi từ chối yêu cầu:", error);
    message.error("Đã có lỗi xảy ra khi thực hiện từ chối.");
    }
  };

  const showDetails = (request) => {
    setSelectedRequest(request);
    setIsModalVisible(true);
  };

  const columns = [
    { title: "Mã User", dataIndex: "userid", key: "userid" },
    { title: "Tên tài khoản", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"), 
    },
    {
        title: "Trạng thái",
        key: "status",
        render: () => <Tag color="orange">Chờ duyệt</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
            type="primary"
          >
            Xem chi tiết
          </Button>
          <Button
            icon={<CheckOutlined />}
            type="primary"
            onClick={() => handleApprove(record.userId)}
            style={{ backgroundColor: "#52c41a", borderColor: '#52c41a' }}
          >
            Duyệt
          </Button>
          <Button
            icon={<CloseOutlined />}
            danger
            onClick={() => handleReject(record.userId)}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <AdminBreadcrumb />
      <h2>Yêu cầu nâng cấp tài khoản Seller</h2>
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="userid"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Thông tin chi tiết yêu cầu"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã User">{selectedRequest.userid}</Descriptions.Item>
            <Descriptions.Item label="Tên tài khoản">{selectedRequest.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedRequest.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedRequest.phone}</Descriptions.Item>
            <Descriptions.Item label="Ngày yêu cầu">
              {new Date(selectedRequest.requestdate).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Hình ảnh giấy tờ">
              <Image.PreviewGroup>
                <Space direction="vertical">
                    <p>CCCD mặt trước:</p>
                    <Image width={200} src={selectedRequest.cccdfronturl} />
                    <p>CCCD mặt sau:</p>
                    <Image width={200} src={selectedRequest.cccdbackurl} />
                    <p>Giấy đăng ký xe:</p>
                    <Image width={200} src={selectedRequest.vehicleRegistrationUrl} />
                </Space>
              </Image.PreviewGroup>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
}