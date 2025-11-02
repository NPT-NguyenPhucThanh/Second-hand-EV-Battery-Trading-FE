import React, { useState, useEffect } from "react";
import { Table, Button, Tag, Modal, Input, message, Tabs, Space, Popconfirm } from "antd";
import { getProductPendingApproval, getProductPendingInsspection, approveProduct, inputInspection } from "../../../services/productService";
import WarehouseDetailModal from "../WarehouseManagement/components/WarehouseDetailModal";

export default function PostManagement() {
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); 
    const [note, setNote] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeTab, setActiveTab] = useState("approval");
    const [messageApi, contextHolder] = message.useMessage();

    const [approvalList, setApprovalList] = useState([]);
    const [inspectionList, setInspectionList] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const approvalRes = await getProductPendingApproval();
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

    const handleApprove = async (productId) => {
        const payload = { approved: true, note: "Approved" };
        try {
            let success = activeTab === 'approval' 
                ? await approveProduct(productId, payload) 
                : await inputInspection(productId, payload);
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
        if (!selectedProduct || !note.trim()) {
            message.warning("Vui lòng nhập lý do từ chối!");
            return;
        }
        const payload = { approved: false, note: note };
        try {
            let success = activeTab === 'approval' 
                ? await approveProduct(selectedProduct.productid, payload) 
                : await inputInspection(selectedProduct.productid, payload);
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

    const showDetailModal = (product) => {
        setSelectedProduct(product);
        setIsDetailModalVisible(true);
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
        setSelectedProduct(null);
    };

    const columns = [
        { title: "Mã SP", dataIndex: "productid", key: "productid" },
        { title: "Tên sản phẩm", dataIndex: "productname", key: "productname" },
        { title: "Người bán", dataIndex: ["users", "username"], key: "seller" },
        { title: "Giá (VNĐ)", dataIndex: "cost", key: "cost", render: (cost) => cost?.toLocaleString('vi-VN') },
        { title: "Ngày tạo", dataIndex: "createdat", key: "createdat", render: (text) => new Date(text).toLocaleDateString('vi-VN') },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => showDetailModal(record)}>Xem chi tiết</Button>
                    <Popconfirm
                        title="Xác nhận duyệt sản phẩm?"
                        description={`Bạn có chắc muốn duyệt "${record.productname}"?`}
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
    const tabItems = [
        {
            key: 'approval',
            label: `Chờ duyệt sơ bộ (${approvalList.length})`,
            children: <Table columns={columns} dataSource={approvalList} loading={loading} rowKey="productid" pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />
        },
        {
            key: 'inspection',
            label: `Chờ kiểm định (${inspectionList.length})`,
            children: <Table columns={columns} dataSource={inspectionList} loading={loading} rowKey="productid" pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />
        }
    ];

    return (
        <>
            {contextHolder}
            <h2>Quản lý Bài đăng (Duyệt sản phẩm)</h2>

            <Tabs 
                defaultActiveKey="approval" 
                onChange={(key) => setActiveTab(key)} 
                items={tabItems} 
            />

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
                        <Input.TextArea rows={3} placeholder="Ví dụ: Thông tin không chính xác..." value={note} onChange={(e) => setNote(e.target.value)} />
                    </>
                )}
            </Modal>
            <WarehouseDetailModal 
                open={isDetailModalVisible}
                onClose={handleDetailCancel}
                product={selectedProduct}
            />
        </>
    );
}