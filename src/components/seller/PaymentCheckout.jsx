// src/components/seller/PaymentCheckout.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Spin, Alert, QRCode, message, Typography, Divider } from "antd";
import { usePackages } from "../../services/packageService";
import { mockPackagePayment } from "../../services/packagePayment";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getPackageById } = usePackages();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [mocking, setMocking] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const packageid = searchParams.get("packageid");

  useEffect(() => {
    if (!packageid) {
      message.error("Thiếu ID gói");
      navigate("/seller/packages");
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        const data = await getPackageById(packageid);
        setPkg(data);

        const transactionCode = `PKG_${packageid}_${Date.now()}`;
        const amount = data.price;
        const qrText = `vnp://pay?txnRef=${transactionCode}&amount=${amount * 100}&packageId=${packageid}`;

        setQrData({ qrCode: qrText, transactionCode, amount, packageId: packageid });
      } catch (err) {
        message.error("Không tải được thông tin gói");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [packageid, getPackageById, navigate]);

  const handleMockSuccess = async () => {
    if (!qrData) return;

    try {
      setMocking(true);
      const res = await mockPackagePayment(qrData.transactionCode, qrData.amount, qrData.packageId);
      if (res.status === "success") {
        message.success("Thanh toán thành công! Dữ liệu đã được lưu vào hệ thống.");
        navigate(`/payment/result?transactionCode=${qrData.transactionCode}`);
      } else {
        throw new Error(res.message || "Lưu thất bại");
      }
    } catch (err) {
      message.error("Lỗi lưu giao dịch. Vui lòng thử lại.");
    } finally {
      setMocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-20 bg-gradient-to-br from-blue-50 to-green-50">
        <Spin size="large" tip="Đang tải thông tin gói..." />
        <Text type="secondary" className="mt-4">Vui lòng đợi...</Text>
      </div>
    );
  }

  if (!pkg || !qrData) {
    return (
      <div className="min-h-screen pt-20 p-6 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-2xl mx-auto text-center">
          <Alert message="Lỗi" description="Không thể tải thông tin gói." type="error" showIcon />
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mt-6">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-6 text-blue-600 text-lg">
          Quay lại
        </Button>

        <Card className="shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 text-center">
            <Title level={3} className="text-white mb-0 font-bold">Thanh toán gói dịch vụ</Title>
            <Text className="text-white/80 text-sm">SANDBOX MODE – Không trừ tiền thật</Text>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              <div>
                <Card className="h-full border-2 border-purple-100 shadow-md">
                  <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white text-3xl font-bold">
                      {pkg.packageType === "CAR" ? "Xe" : "Pin"}
                    </div>
                  </div>
                  <Title level={4} className="text-center mb-2">{pkg.name}</Title>
                  <Text type="secondary" className="block text-center mb-6">
                    Hiệu lực: {pkg.durationMonths} tháng
                  </Text>

                  <Divider className="my-6" />

                  <div className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <Text strong>Số lượng đăng:</Text>
                      <Text className="text-green-600 font-bold">
                        {pkg.maxCars >= 999 || pkg.maxBatteries >= 999 ? "Không giới hạn" : `${pkg.maxCars || pkg.maxBatteries} tin`}
                      </Text>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <Text strong className="text-xl">Tổng tiền:</Text>
                      <Text className="text-3xl font-bold text-red-600">
                        {Number(pkg.price).toLocaleString("vi-VN")}đ
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <Card className="shadow-md text-center h-full flex flex-col justify-center p-6">
                  <Title level={4} className="text-green-600 mb-6">Quét QR để thanh toán</Title>

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

                  <Alert message="Dùng app VNPAY/Momo → Quét QR → Xác nhận (giả lập)" type="info" showIcon className="mb-6" />

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

        <div className="mt-8 text-center">
          <Text type="secondary" strong>
            Dữ liệu giao dịch sẽ được lưu vào database sau khi nhấn nút trên
          </Text>
        </div>
      </div>
    </div>
  );
}