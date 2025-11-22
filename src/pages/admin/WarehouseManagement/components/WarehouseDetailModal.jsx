import React from "react";
import { Modal, Descriptions, Tag, Image, Space, Card } from "antd";
import {
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  Car,
  FileText,
  Hash,
  MessageCircle,
  Eye,
  Package,
} from "lucide-react";

// Hàm hỗ trợ định dạng tiền tệ
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
};

// Hàm hỗ trợ định dạng ngày
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Hàm hiển thị trạng thái
const getStatusTag = (status) => {
  const statusMap = {
    CHO_DUYET: { color: "blue", label: "Chờ duyệt sơ bộ" },
    CHO_KIEM_DUYET: { color: "cyan", label: "Chờ kiểm định" },
    DA_DUYET: { color: "geekblue", label: "Đã duyệt" },
    DANG_BAN: { color: "green", label: "Đang bán" },
    DA_BAN: { color: "volcano", label: "Đã bán" },
    BI_TU_CHOI: { color: "red", label: "Bị từ chối" },
  };
  const config = statusMap[status] || { color: "default", label: status };
  return <Tag color={config.color}>{config.label}</Tag>;
};

export default function WarehouseDetailModal({ open, onClose, product }) {
  if (!product) return null;

  const { users, imgs, brandcars } = product;

  // Dữ liệu người bán
  const sellerPhone = users?.phone || "Chưa cập nhật";
  const sellerDisplayName = users?.displayname || users?.username || "";

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <Car className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold">
            Chi tiết Bài đăng Xe #{product.productid}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000} 
      style={{ top: 20 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card
            title={
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5" /> {product.productname}
              </span>
            }
            bordered={false}
            className="shadow-md"
            extra={getStatusTag(product.status)}
          >
            <div className="mb-4">
              <Image
                src={imgs?.[0]?.url || "/placeholder.jpg"}
                alt={product.productname}
                width="100%"
                height={400}
                style={{ objectFit: "cover", borderRadius: "8px" }}
              />
            </div>
            {imgs && imgs.length > 1 && (
              <Image.PreviewGroup>
                <Space size="small" wrap>
                  {imgs.map((img) => (
                    <Image
                      key={img.imgid}
                      width={100}
                      height={100}
                      src={img.url}
                      style={{ objectFit: "cover", borderRadius: "4px" }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            )}

            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-gray-700">
                <FileText className="w-4 h-4" /> Mô tả sản phẩm
              </h3>
              <p className="text-base text-gray-700">
                {product.description || "Không có mô tả chi tiết."}
              </p>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-4">
          <Card className="shadow-md" bodyStyle={{ padding: 16 }}>
            <p className="text-sm text-gray-500 mb-1">Giá yêu cầu:</p>
            <span className="text-3xl font-black text-red-600">
              {formatCurrency(product.cost)}
            </span>
          </Card>

          <Card title={<span className="font-bold">Thông số Xe</span>} className="shadow-md">
            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item label="Hãng xe:">{brandcars?.brand || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Năm Sản xuất:">{brandcars?.year || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Biển số xe:">{brandcars?.licensePlate || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Model:">{product.model || "N/A"}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Khối Người bán */}
          <Card title={<span className="font-bold">Thông tin Người bán</span>} className="shadow-md">
            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item label="Tên hiển thị:">{sellerDisplayName}</Descriptions.Item>
              <Descriptions.Item label="Username:">{users?.username || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Email:">{users?.email || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="SĐT:">{sellerPhone}</Descriptions.Item>
              <Descriptions.Item label="Ngày đăng:">{formatDate(product.createdat)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    </Modal>
  );
}