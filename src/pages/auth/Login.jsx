import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import {
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   GoogleAuthProvider,
// } from "firebase/auth"; // Giả định dùng Firebase
// import { auth } from "../firebase"; // Giả định bạn đã cấu hình Firebase trong file firebase.js

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // Thêm state để lưu lỗi
  const [loading, setLoading] = useState(false); // Thêm state để xử lý loading
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null); // Xóa lỗi cũ
    setLoading(true); // Bật trạng thái loading
    try {
      await signInWithEmailAndPassword(auth, email, password); // Đăng nhập bằng email/password
      navigate("/"); // Chuyển hướng sau khi đăng nhập thành công
    } catch (error) {
      setError(error.message); // Lưu thông báo lỗi
      console.error("Email login error:", error);
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };

  const handleGoogleLogin = async () => {
    setError(null); // Xóa lỗi cũ
    setLoading(true); // Bật trạng thái loading
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider); // Đăng nhập bằng Google
      navigate("/"); // Chuyển hướng sau khi đăng nhập thành công
    } catch (error) {
      setError(error.message); // Lưu thông báo lỗi
      console.error("Google login error:", error);
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}{" "}
        {/* Hiển thị lỗi */}
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required // Thêm required để bắt buộc nhập
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required // Thêm required để bắt buộc nhập
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading} // Vô hiệu hóa nút khi đang loading
          >
            {loading ? "Loading..." : "Login"}{" "}
            {/* Hiển thị trạng thái loading */}
          </button>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mt-4"
            disabled={loading} // Vô hiệu hóa nút khi đang loading
          >
            <img
              className="h-5 w-5 mr-2"
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google logo"
            />
            {loading ? "Loading..." : "Sign in with Google"}{" "}
            {/* Hiển thị trạng thái loading */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
