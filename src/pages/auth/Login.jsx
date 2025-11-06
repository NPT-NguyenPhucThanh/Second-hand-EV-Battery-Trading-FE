import React, { useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom"; 
import loginpic from "../../assets/images/loginpic.png";
import bgimg from "../../assets/images/bgimg.png";
import { registerUser, loginUser } from "../../utils/services/userService";
import { validateLogin, validateRegister } from "../../utils/validations";
import { useUser } from "../../contexts/UserContext.jsx";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState({});
  const { login } = useUser();
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateRegister(formData);
    setError(newErrors);
    setMessage("");
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    try {
      const payload = { ...formData };
      delete payload.confirmPassword;
      const response = await registerUser(payload);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setError({});
      setMessage("Registration successful! Please log in.");
      setIsLoginMode(true);
    } catch (error) {
      console.error("Registration failed:", error);
      setMessage("Registration failed. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = validateLogin({ username, password });
    setError(newErrors);
    setMessage("");
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await loginUser({ username, password });
      console.log("Response từ server:", response);

      login(
        {
          username: response.username,
          email: response.email,
          roles: response.roles,
          userId: response.userId,
        },
        response.token
      ); 
      setMessage("Login successful!");
      if (response.roles.includes("STAFF")) {
        navigate("/staff");
      } else if (response.roles.includes("MANAGER")) {
        navigate("/manager");
      }
      else {
        navigate("/"); 
      }
    } catch (error) {
      console.error("Login failed:", error);
      setMessage("Login failed. Please check your credentials.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const GoogleAuth = () => {
    console.log("Google Auth Clicked");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        {/* Form Section */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 relative">
          <Link
            to={"/"}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftOutlined />
          </Link>
          <div className="flex justify-center mb-6 pl-10">
            <img src={loginpic} alt="Logo" className="w-70 " />
          </div>

          <div className="flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold mb-6">
              {isLoginMode ? "Login" : "Sign Up"}
            </h1>

            {/* Tab switch (Login/Signup) */}
            <div className="relative flex h-12 mb-8 border border-gray-300 rounded-full overflow-hidden w-64">
              <button
                onClick={() => setIsLoginMode(true)}
                className={`w-1/2 text-lg font-medium transition-all z-10 ${
                  isLoginMode ? "text-white" : "text-black"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLoginMode(false)}
                className={`w-1/2 text-lg font-medium transition-all z-10 ${
                  !isLoginMode ? "text-white" : "text-black"
                }`}
              >
                Signup
              </button>
              <div
                className={`absolute top-0 h-full w-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-green-400 transition-all duration-300 ${
                  isLoginMode ? "left-0" : "left-1/2"
                }`}
              ></div>
            </div>

            {/* Form */}
            <div className="mx-auto max-w-xs w-full">
              {message && (
                <p className="text-center mb-4 text-green-500">{message}</p>
              )}{" "}
              <input
                type={isLoginMode ? "text" : "text"}
                name="username"
                value={isLoginMode ? username : formData.username}
                onChange={
                  isLoginMode
                    ? (e) => setUsername(e.target.value)
                    : handleChange
                }
                placeholder={isLoginMode ? "Username" : "UserName"}
                className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-1"
              />
              {error.username && (
                <p className="text-red-500 text-xs mb-4">{error.username}</p>
              )}
              {!isLoginMode && (
                <>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-1"
                  />
                  {error.email && (
                    <p className="text-red-500 text-xs mb-4">{error.email}</p>
                  )}
                </>
              )}
              <input
                type="password"
                name="password"
                value={isLoginMode ? password : formData.password}
                onChange={
                  isLoginMode
                    ? (e) => setPassword(e.target.value)
                    : handleChange
                }
                placeholder="Password"
                className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-1"
              />
              {error.password && (
                <p className="text-red-500 text-xs mb-4">{error.password}</p>
              )}
              {!isLoginMode && (
                <>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-4 mb-1"
                  />
                  {error.confirmPassword && (
                    <p className="text-red-500 text-xs mb-4">
                      {error.confirmPassword}
                    </p>
                  )}
                </>
              )}
              {isLoginMode && (
                <p className="text-right text-sm mt-2 text-indigo-600 hover:underline cursor-pointer">
                  Forgot password?
                </p>
              )}
              <button
                onClick={isLoginMode ? handleLogin : handleSubmit}
                className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center"
              >
                <svg
                  className="w-6 h-6 -ml-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M20 8v6M23 11h-6" />
                </svg>
                <span className="ml-3">
                  {isLoginMode ? "Login" : "Sign Up"}
                </span>
              </button>
              <p className="mt-6 text-xs text-gray-600 text-center">
                I agree to abide by{" "}
                <a href="#" className="border-b border-gray-500 border-dotted">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="border-b border-gray-500 border-dotted">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Image section */}
        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${bgimg})`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Login;