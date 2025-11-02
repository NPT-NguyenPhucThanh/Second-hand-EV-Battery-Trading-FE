import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Tag, Form, message, Select, InputNumber } from "antd";
import AdminBreadcrumb from '../../../components/admin/AdminBreadcrumb';
import { getAllDisputes, resolveDispute } from "../../../services/disputeService";

const { Option } = Select;

export default function DisputeManagement() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await getAllDisputes();
      if (res.status === 'success') {
        setDisputes(res.disputes || []);
      } else {
        messageApi.error(res.message || "Không thể tải danh sách tranh chấp!");
      }
    } catch (error) {
      messageApi.error("Lỗi khi tải dữ liệu tranh chấp!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleView = (record) => {
    setSelectedDispute(record);
    form.setFieldsValue({
      resolution: record.resolution || "",
      amount: null,
      reason: "",
      status: "PENDING", 
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedDispute(null);
    form.resetFields();
  };

  const handleResolve = async () => {
    try {
      const values = await form.validateFields();
      
      let refundRequest = null;
      if (values.amount && values.amount > 0) {
        refundRequest = {
          amount: values.amount,
          reason: values.reason || `Hoàn tiền cho tranh chấp #${selectedDispute.disputeId}`,
          status: values.status || "PENDING", 
        };
      }

      const payload = {
        decision: refundRequest ? "APPROVE_REFUND" : "REJECT_DISPUTE", 
        managerNote: values.resolution,
     
      };
    
      const managerPayload = {
         decision: (values.amount && values.amount > 0) ? "APPROVE_REFUND" : "REJECT_DISPUTE",
         managerNote: values.resolution
      };
      setLoading(true);
      const response = await resolveDispute(selectedDispute.disputeId, managerPayload);
      
      if (response && response.status === 'success') {
        messageApi.success("Giải quyết tranh chấp thành công!");
        setIsModalOpen(false);
        fetchDisputes(); 
      } else {
        throw new Error(response.message || "Phản hồi không hợp lệ từ server");
      }

    } catch (error) {
      messageApi.error(`Giải quyết thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    { title: "Mã tranh chấp", dataIndex: "disputeId", key: "disputeId" },
    { title: "Mã đơn hàng", dataIndex: "orderId", key: "orderId" },
    { title: "Người mua", dataIndex: "buyerName", key: "buyerName" },
    { title: "Người bán", dataIndex: "sellerName", key: "sellerName" },
    { title: "Lý do", dataIndex: "description", key: "description", ellipsis: true },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "OPEN" || status === "IN_PROGRESS") color = "orange";
        else if (status === "RESOLVED" || status === "CLOSED") color = "green";
        else if (status === "CANCELLED") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => text ? new Date(text).toLocaleString('vi-VN') : 'N/A'
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleView(record)}
          disabled={record.status !== 'OPEN' && record.status !== 'IN_PROGRESS'}
        >
          Xử lý
        </Button>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <h2>Quản lý Tranh chấp</h2>
      <Table
        columns={columns}
        dataSource={disputes}
        pagination={{ pageSize: 7 }}
        scroll={{ x: "max-content" }}
        rowKey="disputeId"
        loading={loading}
      />

      <Modal
        title={`Giải quyết tranh chấp #${selectedDispute?.disputeId}`}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleResolve}
        confirmLoading={loading}
        okText="Xác nhận giải quyết"
        cancelText="Hủy"
        destroyOnHidden 
      >
        {selectedDispute && (
          <>
            <p>
              <b>Đơn hàng:</b> {selectedDispute.orderId}
            </p>
            <p>
              <b>Lý do:</b> {selectedDispute.description}
            </p>
            <Form layout="vertical" form={form} initialValues={{ status: "PENDING" }}>
              <Form.Item
                name="resolution"
                label="Hướng xử lý của Manager"
                rules={[{ required: true, message: "Vui lòng nhập hướng xử lý!" }]}
              >
                <Input.TextArea rows={3} placeholder="Nhập cách giải quyết... (ví dụ: Đồng ý hoàn tiền 50%, hoặc Từ chối khiếu nại...)" />
              </Form.Item>

              <p style={{ fontWeight: 'bold', marginTop: '16px' }}>Tùy chọn hoàn tiền (Nếu chấp nhận hoàn tiền, backend sẽ tự động xử lý):</p>
              
              <Form.Item 
                name="amount" 
                label="Số tiền hoàn trả (VNĐ)"
                help="Nếu bạn nhập số tiền > 0, quyết định sẽ được hiểu là 'APPROVE_REFUND'."
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số tiền..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}