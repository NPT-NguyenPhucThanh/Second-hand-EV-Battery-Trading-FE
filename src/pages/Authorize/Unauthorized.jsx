// src/components/Unauthorized.jsx
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Không có quyền truy cập
        </h1>
        <p className="text-gray-600 mb-6">
          Chỉ người dùng có vai trò "seller" mới có thể truy cập trang này.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;