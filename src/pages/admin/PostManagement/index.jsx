import React, { useState, useEffect } from "react";
import { Table, Button, Tag, Modal, Input, message, Tabs, Space, Popconfirm } from "antd"; // Thêm Popconfirm
import AdminBreadcrumb from '../../../components/admin/AdminBreadcrumb';
import { getProductApproval, getProductPendingInsspection, approveProduct, inputInspection } from "../../../services/productService";

const { TabPane } = Tabs;

export default function PostManagement() {
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [note, setNote] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("approval");
  const [messageApi,contextHolder] = message.useMessage();

  const [approvalList, setApprovalList] = useState([]);
  const [inspectionList, setInspectionList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm tải dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const approvalRes = await getProductApproval();
      const inspectionRes = await getProductPendingInsspection();
      setApprovalList(approvalRes.products || []);
      setInspectionList(inspectionRes.products || []);
    } catch (error) {
      messageApi.error("Lỗi khi tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Xử lý Duyệt (sử dụng Popconfirm) ---
  const handleApprove = async (productId) => {
    const payload = { approved: true, note: "Approved" };
    try {
      let success = false;
      if (activeTab === 'approval') {
        success = await approveProduct(productId, payload);
      } else {
        success = await inputInspection(productId, payload);
      }
      if (success) {
        messageApi.success(`Đã duyệt sản phẩm thành công!`);
        fetchData();
      } else {
        throw new Error("Phản hồi từ server không hợp lệ.");
      }
    } catch (error) {
      messageApi.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  // --- Xử lý Từ chối (sử dụng Modal) ---
  const showRejectModal = (product) => {
    setSelectedProduct(product);
    setIsRejectModalVisible(true);
  };

  const handleRejectCancel = () => {
    setIsRejectModalVisible(false);
    setNote("");
    setSelectedProduct(null);
  };

  const handleRejectConfirm = async () => {
    if (!selectedProduct) return;
    if (!note.trim()) {
      messageApi.warning("Vui lòng nhập lý do từ chối!");
      return;
    }
    const payload = { approved: false, note: note };
    try {
      let success = false;
      if (activeTab === 'approval') {
        success = await approveProduct(selectedProduct.productid, payload);
      } else {
        success = await inputInspection(selectedProduct.productid, payload);
      }
      if (success) {
        messageApi.success(`Đã từ chối sản phẩm thành công!`);
        fetchData();
        handleRejectCancel();
      } else {
        throw new Error("Phản hồi từ server không hợp lệ.");
      }
    } catch (error) {
      messageApi.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const columns = [
    { title: "Mã SP", dataIndex: "productid", key: "productid" },
    { title: "Tên sản phẩm", dataIndex: "productname", key: "productname" },
    { title: "Người bán", dataIndex: ["users", "username"], key: "seller" },
    {
      title: "Giá",
      dataIndex: "cost",
      key: "cost",
      render: (cost) => cost.toLocaleString('vi-VN') + ' ₫'
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdat",
      key: "createdat",
      render: (text) => new Date(text).toLocaleDateString('vi-VN')
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Xác nhận duyệt sản phẩm?"
            description={`Bạn có chắc muốn duyệt sản phẩm "${record.productname}"?`}
            onConfirm={() => handleApprove(record.productid)}
            okText="Duyệt"
            cancelText="Hủy"
          >
            <Button type="primary" size="small">Duyệt</Button>
          </Popconfirm>
          <Button danger size="small" onClick={() => showRejectModal(record)}>Từ chối</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
    {contextHolder}
      <Tabs defaultActiveKey="approval" onChange={(key) => setActiveTab(key)}>
        <TabPane tab={`Chờ duyệt sơ bộ (${approvalList.length})`} key="approval">
          <Table columns={columns} dataSource={approvalList} loading={loading} rowKey="productid" pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }}/>
        </TabPane>
        <TabPane tab={`Chờ kiểm định (${inspectionList.length})`} key="inspection">
          <Table columns={columns} dataSource={inspectionList} loading={loading} rowKey="productid" pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }}/>
        </TabPane>
      </Tabs>

      <Modal
        title="Từ chối sản phẩm"
        open={isRejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={handleRejectCancel}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
      >
        {selectedProduct && (
          <>
            <p><strong>Sản phẩm:</strong> {selectedProduct.productname}</p>
            <p>Vui lòng nhập lý do từ chối:</p>
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Thông tin không chính xác, hình ảnh không rõ ràng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </>
        )}
      </Modal>
    </>
  );
}