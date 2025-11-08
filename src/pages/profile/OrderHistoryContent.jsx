// src/components/profile/OrderHistoryContent.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { Tag, Button, Spin, Empty } from "antd";

const currency = (value) => {
  if (value === null || value === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

const OrderStatusTag = ({ status }) => {
  let color = "default";
  if (status === "DA_DUYET") color = "cyan";
  if (status === "DA_HOAN_TAT") color = "success";
  if (status === "CHO_DUYET" || status === "CHO_DAT_COC") color = "processing";
  if (status === "BI_TU_CHOI" || status === "DA_HUY" || status === "THAT_BAI") color = "error";
  if (status === "TRANH_CHAP") color = "warning";

  const statusText = {
    DA_DUYET: "Đã duyệt",
    DA_HOAN_TAT: "Hoàn tất",
    CHO_DUYET: "Chờ duyệt",
    CHO_DAT_COC: "Chờ đặt cọc",
    BI_TU_CHOI: "Bị từ chối",
    DA_HUY: "Đã hủy",
    THAT_BAI: "Thất bại",
    TRANH_CHAP: "Tranh chấp",
  }[status] || status;

  return <Tag color={color}>{statusText}</Tag>;
};

export default function OrderHistoryContent() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await api.get("api/buyer/orders");
        if (response.status === "success") {
          const sortedOrders = (response.orders || []).sort(
            (a, b) => new Date(b.createdat) - new Date(a.createdat)
          );
          setOrders(sortedOrders);
        } else {
          setError(response.message || "Không thể tải đơn hàng.");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleFinalPayment = (orderId) => {
    navigate(`/checkout/final-payment/${orderId}`);
  };

  const handleDepositAgain = (orderId) => {
    navigate(`/checkout/deposit/${orderId}`);
  };

  // MỚI: Xem chi tiết giao dịch
  const handleViewTransactions = (orderId) => {
    navigate(`/profile/orders/${orderId}/transactions`);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Lịch Sử Đơn Hàng</h2>

      {loading ? (
        <div className="text-center py-10">
          <Spin size="large" />
          <p className="mt-2 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      ) : error ? (
        <Empty description={`Lỗi: ${error}`} />
      ) : orders.length === 0 ? (
        <Empty description="Bạn chưa có đơn hàng nào." />
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const orderNumber = orders.length - index;
            return (
              <div
                key={order.orderid}
                className="border rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition cursor-pointer"
                onClick={() => handleViewTransactions(order.orderid)} // Click toàn bộ card
              >
                <div className="flex-1">
                  <p className="font-bold text-lg">
                    Đơn hàng #{orderNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Ngày đặt: {new Date(order.createdat).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="font-semibold text-lg mt-1">
                    Tổng tiền: {currency(order.totalfinal)}
                  </p>
                </div>

                <div className="text-right space-y-2 flex flex-col items-end">
                  <OrderStatusTag status={order.status} />

                  {/* Nút hành động */}
                  <div className="flex gap-2 mt-2 flex-wrap justify-end">
                    {order.status === "DA_DUYET" && (
                      <Button
                        type="primary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFinalPayment(order.orderid);
                        }}
                      >
                        Thanh toán 90%
                      </Button>
                    )}

                    {order.status === "THAT_BAI" && order.paymentmethod === "VNPAY" && (
                      <>
                        <Button
                          danger
                          type="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFinalPayment(order.orderid);
                          }}
                        >
                          Thanh toán lại
                        </Button>
                        <Button
                          danger
                          type="link"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDepositAgain(order.orderid);
                          }}
                        >
                          Đặt cọc lại
                        </Button>
                      </>
                    )}

                    {/* Luôn có nút Xem chi tiết */}
                    <Button
                      type="link"
                      size="small"
                      className="text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTransactions(order.orderid);
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}