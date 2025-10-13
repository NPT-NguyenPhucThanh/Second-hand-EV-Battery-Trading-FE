import { Table } from "antd";
import { Button, Tag } from "antd";
import { useState } from "react";
import { Modal, Input } from "antd";
import { post } from "../../dataAdmin";
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb';

export default function PostManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [note, setNote] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const columns = [
    { title: "Mã", dataIndex: "id", key: "id" },
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Người tạo", dataIndex: "createdBy", key: "createdBy" },
    { title: "Ngày tạo", dataIndex: "createAt", key: "createAt" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        if (status === "PENDING") return <Tag color="orange">Chờ duyệt</Tag>;
        if (status === "APPROVED") return <Tag color="blue">Chờ kiểm định</Tag>;
        if (status === "REJECTED") return <Tag color="red">Từ chối</Tag>;
      },
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedPost(record);
            setIsModalVisible(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
    <AdminBreadcrumb />
      <Table columns={columns} dataSource={post} pagination={{ pageSize: 8 }} scroll={{ x: "max-content" }} />
      <Modal open={isModalVisible} onCancel={() => setIsModalVisible(false)} title={selectedPost?.title} footer={null} width={700}>
        {selectedPost && (
          <>
            <p>
              <strong>Người bán:</strong> {selectedPost.createdBy}
            </p>
            <p>
              <strong>Mô tả:</strong> {selectedPost.description}
            </p>
            <p>
              <strong>Trạng thái:</strong> {selectedPost.status}
            </p>

            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú (nếu từ chối)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button danger>Từ chối</Button>
              <Button type="primary">Chuyển sang chờ kiểm định</Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
