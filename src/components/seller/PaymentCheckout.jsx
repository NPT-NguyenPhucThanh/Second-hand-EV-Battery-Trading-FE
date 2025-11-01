// src/components/seller/PaymentCheckout.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Spin, Alert, QRCode, message, Typography, Divider } from "antd";
import { usePackages } from "../../services/packageService";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getPackageById } = usePackages();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const packageid = searchParams.get("packageid");

  useEffect(() => {
    if (!packageid) {
      navigate("/seller/packages");
      return;
    }

    const init = async () => {
      try {
        const data = await getPackageById(packageid);
        setPkg(data);

        // TỰ TẠO QR GIẢ LẬP (KHÔNG CẦN BE)
        const transactionCode = `PKG_${packageid}_${Date.now()}`;
        const amountInVND = data.price;
        const qrText = `vnp://pay?txnRef=${transactionCode}&amount=${amountInVND * 100}&packageId=${packageid}`;

        setQrData({
          qrCode: qrText,
          transactionCode,
          amount: amountInVND,
        });

      } catch (err) {
        message.error("Không tải được gói");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [packageid, getPackageById, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-20">
        <Spin size="large" tip="Đang tạo mã QR..." />
      </div>
    );
  }

  if (!pkg || !qrData) {
    return (
      <div className="min-h-screen pt-20 p-4">
        <div className="max-w-2xl mx-auto">
          <Alert
            message="Lỗi"
            description="Không thể tạo mã QR. Vui lòng thử lại."
            type="error"
            showIcon
          />
          <Button type="primary" onClick={() => navigate(-1)} className="mt-4" icon={<ArrowLeftOutlined />}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          Quay lại
        </Button>

        <Card className="shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 text-center">
            <Title level={3} className="text-white mb-0">Thanh toán gói (SANDBOX)</Title>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* THÔNG TIN GÓI */}
              <div>
                <Card className="border-2 border-purple-100 shadow-md h-full">
                  <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white text-3xl font-bold">
                      {pkg.packageType === "CAR" ? "Xe" : "Pin"}
                    </div>
                  </div>
                  <Title level={4} className="text-center mb-2">{pkg.name}</Title>
                  <Text type="secondary" className="block text-center mb-6">{pkg.durationMonths} tháng</Text>

                  <Divider className="my-4" />

                  <div className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <Text strong>Số lượng đăng:</Text>
                      <Text className="text-green-600 font-bold">
                        {pkg.maxCars >= 999 || pkg.maxBatteries >= 999
                          ? "Không giới hạn"
                          : `${pkg.maxCars || pkg.maxBatteries}`}
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

              {/* MÃ QR - TỰ TẠO */}
              <div>
                <Card className="shadow-md text-center h-full flex flex-col justify-center">
                  <Title level={4} className="text-green-600 mb-6">Quét QR để thanh toán</Title>

                  <div className="flex justify-center mb-6">
                    <QRCode
                      value={qrData.qrCode}
                      size={240}
                      className="border-4 border-gray-200 rounded-xl p-2"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl space-y-3 mb-6">
                    <div className="flex justify-between">
                      <Text strong>Mã giao dịch:</Text>
                      <Text className="font-mono text-blue-600">{qrData.transactionCode}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text strong>Số tiền:</Text>
                      <Text className="text-xl font-bold text-red-600">
                        {Number(qrData.amount).toLocaleString("vi-VN")}đ
                      </Text>
                    </div>
                  </div>

                  <Alert
                    message="Dùng app VNPAY/Momo → Quét QR → Xác nhận (giả lập)"
                    type="info"
                    showIcon
                    className="mb-4"
                  />

                  <Button
                    type="primary"
                    size="large"
                    block
                    className="h-12 bg-gradient-to-r from-green-500 to-emerald-600"
                    onClick={() => {
                      message.success("Thanh toán thành công (giả lập)!");
                      navigate(`/payment/result?vnp_TxnRef=${qrData.transactionCode}&vnp_ResponseCode=00`);
                    }}
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
            SANDBOX MODE – Không trừ tiền thật – QR được tạo tự động
          </Text>
        </div>
      </div>
    </div>
  );
}