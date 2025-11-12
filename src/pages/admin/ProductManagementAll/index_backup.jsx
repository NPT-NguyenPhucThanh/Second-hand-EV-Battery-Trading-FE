import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Tag, message, Space, Popconfirm, Input, Image, Badge } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { getAllProductsForManager, deleteProductByManager } from "../../../services/managerProductService"; // Dùng service mới
import { useNavigate } from "react-router-dom";

const { Search } = Input;

// Helper map trạng thái sản phẩm sang Tag màu
const getStatusTag = (status) => {
  const statusMap = {
    CHO_DUYET: { color: "blue", label: "Chờ duyệt" },
    CHO_KIEM_DUYET: { color: "cyan", label: "Chờ kiểm định" },
    DA_DUYET: { color: "geekblue", label: "Đã duyệt" },
    DANG_BAN: { color: "green", label: "Đang bán" },
    DA_BAN: { color: "volcano", label: "Đã bán" },
    BI_TU_CHOI: { color: "red", label: "Bị từ chối" },
    KHONG_DAT_KIEM_DINH: { color: "magenta", label: "Không đạt KĐ" },
    HET_HAN: { color: "gray", label: "Hết hạn" },
    REMOVED_FROM_WAREHOUSE: { color: "purple", label: "Đã gỡ" },
  };
  // Lấy config từ map, hoặc dùng default nếu không tìm thấy
  const config = statusMap[status] || { color: "default", label: status };
  return <Tag color={config.color}>{config.label}</Tag>;
};

export default function ProductManagementAll() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getAllProductsForManager();
      if (res.status === 'success') {
        // Gán 'key' cho mỗi row để Ant Design Table hoạt động
        setAllProducts(res.products.map(p => ({ ...p, key: p.productid })));
      } else {
        message.error(res.message || "Không thể tải danh sách sản phẩm!");
      }
    } catch (error) {
      message.error("Lỗi kết nối khi tải sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Xử lý hành động xóa của Manager
  const handleDelete = async (productId) => {
    try {
      const res = await deleteProductByManager(productId);
      // Giả định backend trả về { status: "success", message: "..." }
      if (res.status === 'success') {
        message.success(res.message);
        fetchProducts(); // Tải lại danh sách sau khi xóa
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      message.error(`Xóa thất bại: ${error.message}`);
    }
  };

  // Lọc danh sách sản phẩm dựa trên thanh tìm kiếm
  const filteredProducts = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    if (!lowerSearch) return allProducts;
    
    return allProducts.filter(p =>
      p.productname.toLowerCase().includes(lowerSearch) ||
      p.productid.toString().includes(lowerSearch) ||
      p.type.toLowerCase().includes(lowerSearch) ||
      (p.users && p.users.username.toLowerCase().includes(lowerSearch))
    );
  }, [allProducts, searchTerm]);

  // Định nghĩa các cột cho bảng
  const columns = [
    { 
      title: "Mã SP", 
      dataIndex: "productid", 
      key: "productid", 
      width: 80, 
      sorter: (a, b) => a.productid - b.productid 
    },
    {
      title: "Ảnh",
      dataIndex: "imgs",
      key: "imgs",
      render: (imgs) => (
        <Image
          src={imgs && imgs.length > 0 ? imgs[0].url : "/placeholder.jpg"} // Giả sử /placeholder.jpg là ảnh mặc định
          width={60}
          preview={{ mask: <EyeOutlined /> }}
        />
      ),
    },
    { 
      title: "Tên sản phẩm", 
      dataIndex: "productname", 
      key: "productname", 
      ellipsis: true,
      sorter: (a, b) => a.productname.localeCompare(b.productname)
    },
    { 
      title: "Giá (VNĐ)", 
      dataIndex: "cost", 
      key: "cost",
      render: (cost) => (cost ? cost.toLocaleString('vi-VN') : '0'),
      sorter: (a, b) => a.cost - b.cost
    },
    { 
      title: "Loại", 
      dataIndex: "type", 
      key: "type", 
      width: 100,
      filters: [
        { text: 'Car EV', value: 'Car EV' },
        { text: 'Battery', value: 'Battery' },
      ],
      onFilter: (value, record) => record.type.indexOf(value) === 0,
    },
    { 
      title: "Người bán", 
      dataIndex: "users", 
      key: "seller",
      render: (users) => users ? users.username : 'N/A'
    },
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      key: "status",
      render: (status) => getStatusTag(status),
      // Bạn có thể thêm bộ lọc (filters) cho trạng thái ở đây nếu muốn
    },
    {
      title: "Trong kho",
      dataIndex: "inWarehouse",
      key: "inWarehouse",
      render: (inWarehouse) => (
        inWarehouse ? <Badge status="processing" text="Trong kho" /> : <Badge status="default" text="Ngoài kho" />
      ),
      filters: [
        { text: 'Trong kho', value: true },
        { text: 'Ngoài kho', value: false },
      ],
      onFilter: (value, record) => record.inWarehouse === value,
    },
    {
      title: "Hành động (Manager)",
      key: "action",
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Xóa sản phẩm vĩnh viễn?"
            description={`Bạn có chắc muốn xóa "${record.productname}"? Hành động này sẽ xóa sản phẩm và ảnh liên quan trên Cloudinary.`}
            onConfirm={() => handleDelete(record.productid)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <h2>Quản lý Toàn bộ Sản phẩm (Giám sát)</h2>
      <Search
        placeholder="Tìm kiếm theo Mã SP, Tên, Loại, Người bán..."
        onSearch={setSearchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
        style={{ marginBottom: 16, width: '100%' }}
      />
      <Table
        dataSource={filteredProducts}
        columns={columns}
        rowKey="key"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1300 }} // Cho phép cuộn ngang trên màn hình nhỏ
      />
    </>
  );
}