import React, { useState, useEffect } from "react";
import { Spin, Empty, Alert, Tag, Button, Select } from "antd";
import api from "../../utils/api";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FileText,
  Clock,
  CheckCircle,
  Car,
  User,
  ShoppingCart,
  Store,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const { Option } = Select;

const formatDate = (dateString) => {
  if (!dateString) return "Chưa có";
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusConfig = (status) => {
  if (status === false) {
    return {
      text: "Chưa ký",
      color: "warning",
      icon: <Clock className="w-4 h-4" />,
    };
  }
  return {
    text: "Đã ký",
    color: "success",
    icon: <CheckCircle className="w-4 h-4" />,
  };
};

const getContractTitle = (contract) => {
  if (contract.contractType === "SALE_TRANSACTION" && contract.orders) {
    return `Hợp đồng mua bán #${contract.orders.orderid}`;
  }
  if (contract.contractType === "PRODUCT_LISTING" && contract.products) {
    return `Hợp đồng đăng bán #${contract.products.productid}`;
  }
  return `Hợp đồng #${contract.contractid}`;
};

const getContractSubtitle = (contract) => {
  if (contract.contractType === "SALE_TRANSACTION" && contract.orders) {
    return contract.orders.status === "DA_DAT_COC" ? "Đã đặt cọc" : "Đơn hàng";
  }
  if (contract.contractType === "PRODUCT_LISTING" && contract.products) {
    return contract.products.productname || "Sản phẩm";
  }
  return "Không xác định";
};

const ContractCard = ({ contract, isDark, onOpenDocuSeal, isOpening }) => {
  const statusConfig = getStatusConfig(contract.status);
  const isPending = contract.status === false;

  return (
    <div
      className={`border rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {getContractTitle(contract)}
          </h3>
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {getContractSubtitle(contract)}
          </p>
        </div>
        <div className="text-3xl text-blue-600">
          {contract.contractType === "SALE_TRANSACTION" ? (
            <ShoppingCart />
          ) : (
            <Store />
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {contract.contractType === "SALE_TRANSACTION" && contract.orders && (
          <>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-500" />
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                Địa điểm:{" "}
                <strong>
                  {contract.orders.transactionLocation || "Chưa xác định"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                Hẹn giao:{" "}
                <strong>{formatDate(contract.orders.appointmentDate)}</strong>
              </span>
            </div>
          </>
        )}

        {contract.contractType === "PRODUCT_LISTING" && contract.products && (
          <>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-500" />
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                Biển số:{" "}
                <strong>
                  {contract.products.brandcars?.licensePlate || "Chưa có"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Tag color="blue">Đăng bán</Tag>
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                Giá:{" "}
                <strong>
                  {contract.products.cost?.toLocaleString("vi-VN")} ₫
                </strong>
              </span>
            </div>
          </>
        )}

        {contract.buyers && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className={isDark ? "text-gray-300" : "text-gray-600"}>
              Người mua: <strong>{contract.buyers.username}</strong>
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className={isDark ? "text-gray-400" : "text-gray-600"}>
            Ngày tạo
          </span>
          <span
            className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {formatDate(contract.startDate)}
          </span>
        </div>

        {contract.status === true && contract.signedat && (
          <div className="flex justify-between">
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>
              Ngày ký
            </span>
            <span className="font-medium text-green-600">
              {formatDate(contract.signedat)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Tag color={statusConfig.color} className="flex items-center gap-1">
          {statusConfig.icon}
          {statusConfig.text}
        </Tag>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        <Button type="primary" size="small">
          Xem chi tiết
        </Button>

        {isPending && (
          <Button
            size="small"
            type="default"
            icon={<ExternalLink className="w-4 h-4" />}
            onClick={() =>
              onOpenDocuSeal(contract.contractid, contract.docusealSubmissionId)
            }
            loading={isOpening}
          >
            {isOpening ? "Đang mở..." : "Ký trên DocuSeal"}
          </Button>
        )}

        {contract.docusealSubmissionId && contract.status === true && (
          <Button
            size="small"
            ghost
            icon={<ExternalLink className="w-4 h-4" />}
          >
            Xem hợp đồng đã ký
          </Button>
        )}
      </div>
    </div>
  );
};

export default function ContractsContent() {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const { isDark } = useTheme();

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("api/buyer/contracts");
      const data = res.contracts || [];
      setContracts(data);
      setFilteredContracts(data);
    } catch (err) {
      console.error("Lỗi khi tải hợp đồng:", err);
      setError("Không thể tải danh sách hợp đồng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const openDocuSealSigning = async (contractId, submissionId) => {
    if (!submissionId) {
      toast.error("Không tìm thấy link ký hợp đồng");
      return;
    }

    setOpeningId(contractId);
    try {
      // Gọi API để lấy signing URL từ DocuSeal
      const response = await api.post(`api/buyer/contracts/${contractId}/sign`);

      if (response.docusealSubmissionId) {
        // Gọi API lấy URL ký
        const urlRes = await api.get(
          `api/docuseal/submissions/${submissionId}/status`
        );

        // Giả sử API trả về URL trong response.data.signing_url hoặc tương tự
        // Nếu không có API riêng, dùng link mặc định DocuSeal
        const signingUrl =
          urlRes.signing_url || `https://docuseal.co/s/${submissionId}`;

        toast.success("Đang mở trang ký hợp đồng...");
        window.open(signingUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Lỗi mở DocuSeal:", err);
      toast.error(
        err.response?.data?.message ||
          "Không thể mở trang ký. Vui lòng thử lại."
      );
    } finally {
      setOpeningId(null);
    }
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    if (value === "all") {
      setFilteredContracts(contracts);
    } else if (value === "pending") {
      setFilteredContracts(contracts.filter((c) => c.status === false));
    } else if (value === "signed") {
      setFilteredContracts(contracts.filter((c) => c.status === true));
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    handleFilterChange(filterStatus);
  }, [contracts]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <p className={`mt-3 ${isDark ? "text-gray-200" : "text-gray-500"}`}>
          Đang tải danh sách hợp đồng...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="py-8">
        <Alert
          message="Chưa có hợp đồng nào"
          description="Khi có khách đặt cọc hoặc bạn đăng bán xe, hợp đồng sẽ xuất hiện tại đây."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <h2
        className={`text-2xl font-semibold mb-6 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        Quản Lý Hợp Đồng
      </h2>

      {/* Filter duy nhất */}
      <div
        className={`p-5 rounded-xl mb-8 ${
          isDark
            ? "bg-gray-700/50 border border-gray-600"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Trạng thái:
            </span>
            <Select
              value={filterStatus}
              onChange={handleFilterChange}
              style={{ width: 180 }}
              size="large"
            >
              <Option value="all">Tất cả hợp đồng</Option>
              <Option value="pending">Chưa ký</Option>
              <Option value="signed">Đã ký</Option>
            </Select>
          </div>
          <div
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            Hiển thị: <strong>{filteredContracts.length}</strong> hợp đồng
          </div>
        </div>
      </div>

      {/* Danh sách hợp đồng */}
      {filteredContracts.length === 0 ? (
        <Empty
          description={
            filterStatus === "all"
              ? "Không có hợp đồng nào"
              : filterStatus === "pending"
              ? "Không có hợp đồng chờ ký"
              : "Không có hợp đồng đã ký"
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.contractid}
              contract={contract}
              isDark={isDark}
              onOpenDocuSeal={openDocuSealSigning}
              isOpening={openingId === contract.contractid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
