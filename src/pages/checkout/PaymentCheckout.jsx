// src/features/checkout/PaymentCheckout.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, Button, Spin, Alert, QRCode, message, Typography, Divider } from "antd";
import { createPaymentUrl, mockPaymentSuccess } from "../../utils/services/paymentService";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [mocking, setMocking] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("orderId");
  const type = searchParams.get("type"); // "Car EV" | "Battery"

  useEffect(() => {
    if (!orderId || !type) {
      message.error("Thiếu thông tin đơn hàng");
      navigate("/");
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        const amount = type === "Car EV" ? 10000000 : 5000000; // 10M xe, 5M pin
        const transactionCode = `ORD_${orderId}_${Date.now()}`;
        const qrText = `vnp://pay?txnRef=${transactionCode}&amount=${amount * 100}&orderId=${orderId}`;

        setPkg({ orderId, type, amount });
        setQrData({ qrCode: qrText, transactionCode, amount, orderId });
      } catch (err) {
        message.error("Không tạo được thanh toán");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [orderId, type, navigate]);

  const handleMockSuccess = async () => {
    if (!qrData) return;
    try {
      setMocking(true);
      const res = await mockPaymentSuccess(qrData.transactionCode, qrData.amount, qrData.orderId);
      if (res.status === "success") {
        message.success("Thanh toán thành công!");
        navigate(`/checkout/result?transactionCode=${qrData.transactionCode}`);
      }
    } catch (err) {
      message.error("Lỗi lưu giao dịch");
    } finally {
      setMocking(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen pt-20"><Spin size="large" tip="Chuẩn bị thanh toán..." /></div>;
  if (!pkg || !qrData) return <Alert message="Lỗi" description="Không tải được thông tin" type="error" />;

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-6 text-blue-600">
          Quay lại
        </Button>

        <Card className="shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 text-center">
            <Title level={3} className="text-white mb-0">Thanh toán đơn hàng</Title>
            <Text className="text-white/80 text-sm">SANDBOX – Không trừ tiền thật</Text>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Card className="h-full border-2 border-green-100">
                  <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl text-white text-3xl font-bold">
                      {type === "Car EV" ? "Xe" : "Pin"}
                    </div>
                  </div>
                  <Title level={4} className="text-center">Đơn hàng #{orderId}</Title>
                  <Text type="secondary" className="block text-center mb-6">
                    {type === "Car EV" ? "Đặt cọc 10%" : "Thanh toán 100%"}
                  </Text>

                  <Divider />

                  <div className="flex justify-between items-center pt-4">
                    <Text strong className="text-xl">Tổng tiền:</Text>
                    <Text className="text-3xl font-bold text-red-600">
                      {Number(qrData.amount).toLocaleString("vi-VN")}đ
                    </Text>
                  </div>
                </Card>
              </div>

              <div>
                <Card className="h-full text-center p-6">
                  <Title level={4} className="text-green-600 mb-6">Quét QR thanh toán</Title>
                  <div className="flex justify-center mb-6">
                    <QRCode value={qrData.qrCode} size={240} className="border-4 border-gray-200 rounded-xl p-2" />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl space-y-3 mb-6 text-left">
                    <div className="flex justify-between">
                      <Text strong>Mã GD:</Text>
                      <Text className="font-mono text-xs text-blue-600 break-all">{qrData.transactionCode}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text strong>Số tiền:</Text>
                      <Text className="text-xl font-bold text-red-600">{Number(qrData.amount).toLocaleString("vi-VN")}đ</Text>
                    </div>
                  </div>

                  <Alert message="Quét bằng VNPAY/Momo → Xác nhận (giả lập)" type="info" showIcon className="mb-6" />

                  <Button
                    type="primary"
                    size="large"
                    block
                    className="h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-lg font-semibold"
                    onClick={handleMockSuccess}
                    loading={mocking}
                  >
                    Giả lập thành công
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}