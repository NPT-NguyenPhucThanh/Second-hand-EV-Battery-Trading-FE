import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../utils/services/postService";
import {
  Car,
  Battery,
  Upload,
  X,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Calendar,
  MapPin,
  Zap,
  Settings,
  Hash,
  CheckCircle,
} from "lucide-react";

/* ======================= */
/* 🔹 InputField Component */
/* ======================= */
const InputField = React.memo(
  ({
    icon: Icon,
    label,
    name,
    type = "text",
    placeholder,
    required = true,
    formData,
    handleInputChange,
    ...props
  }) => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={formData[name] || ""}
        onChange={handleInputChange}
        required={required}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none group-hover:border-blue-300"
        {...props}
      />
    </div>
  )
);

/* ======================== */
/* 🔹 TextareaField Component */
/* ======================== */
const TextareaField = React.memo(
  ({
    label,
    name,
    placeholder,
    required = true,
    formData,
    handleInputChange,
    ...props
  }) => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={formData[name] || ""}
        onChange={handleInputChange}
        required={required}
        rows="5"
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none resize-none group-hover:border-blue-300"
        {...props}
      />
    </div>
  )
);

/* ===================== */
/* 🔸 NewPost Component */
/* ===================== */
const NewPost = () => {
  const navigate = useNavigate();
  const [type, setType] = useState("car");
  const [formData, setFormData] = useState({
    productname: "",
    description: "",
    cost: "",
    licensePlate: "",
    model: "",
    specs: "",
    brand: "",
    year: "",
    capacity: "",
    voltage: "",
    condition: "",
    pickupAddress: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    for (let i = 0; i < images.length; i++) {
      data.append("images", images[i]);
    }
    try {
      const response = await createPost(type, data);
      console.log("Post created:", response);
      alert("Đăng bài thành công");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.message || "Đăng bài thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFields = () => {
    if (type === "car") {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              icon={Hash}
              label="Biển số xe"
              name="licensePlate"
              placeholder="VD: 29A-12345"
              formData={formData}
              handleInputChange={handleInputChange}
            />
            <InputField
              icon={Car}
              label="Model"
              name="model"
              placeholder="VD: Tesla Model 3"
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </div>
          <InputField
            icon={Settings}
            label="Số lượng sẵn có"
            name="specs"
            placeholder="Mô tả chi tiết thông số xe"
            formData={formData}
            handleInputChange={handleInputChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              icon={Settings}
              label="Hãng xe"
              name="brand"
              placeholder="VD: Tesla, VinFast"
              formData={formData}
              handleInputChange={handleInputChange}
            />
            <InputField
              icon={Calendar}
              label="Năm sản xuất"
              name="year"
              type="number"
              placeholder="VD: 2023"
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </div>
        </div>
      );
    } else if (type === "battery") {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              icon={Battery}
              label="Dung lượng (kWh)"
              name="capacity"
              type="number"
              placeholder="VD: 50"
              formData={formData}
              handleInputChange={handleInputChange}
            />
            <InputField
              icon={Zap}
              label="Điện áp (V)"
              name="voltage"
              type="number"
              placeholder="VD: 400"
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </div>
          <InputField
            icon={Settings}
            label="Thương hiệu"
            name="brand"
            placeholder="VD: LG, Samsung"
            formData={formData}
            handleInputChange={handleInputChange}
          />
          <InputField
            icon={CheckCircle}
            label="Tình trạng"
            name="condition"
            placeholder="VD: Mới, Đã qua sử dụng"
            formData={formData}
            handleInputChange={handleInputChange}
          />
          <InputField
            icon={MapPin}
            label="Địa chỉ lấy hàng"
            name="pickupAddress"
            placeholder="Nhập địa chỉ đầy đủ"
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </div>
      );
    }
  };

  const getSubmitButtonClasses = () => {
    if (isSubmitting) return "bg-gray-400 cursor-not-allowed";
    if (type === "car")
      return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 to-blue-700";
    if (type === "battery")
      return "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 to-green-700";
    return "bg-blue-500 hover:from-blue-600 hover:via-green-500 hover:to-green-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl pt-10 pb-1 font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mb-3">
            Đăng tin mới
          </h1>
          <p className="text-gray-600">
            Điền thông tin sản phẩm của bạn để bắt đầu bán hàng
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-8 transform hover:shadow-3xl transition-all duration-300"
        >
          {/* Type Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Loại sản phẩm <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType("car")}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  type === "car"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600 text-white shadow-lg"
                    : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
                }`}
              >
                <Car
                  className={`w-8 h-8 mx-auto mb-2 ${
                    type === "car" ? "text-white" : "text-blue-500"
                  }`}
                />
                <span className="font-semibold">Xe điện</span>
              </button>
              <button
                type="button"
                onClick={() => setType("battery")}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  type === "battery"
                    ? "bg-gradient-to-r from-green-500 to-green-600 border-green-600 text-white shadow-lg"
                    : "bg-white border-gray-200 text-gray-700 hover:border-green-300"
                }`}
              >
                <Battery
                  className={`w-8 h-8 mx-auto mb-2 ${
                    type === "battery" ? "text-white" : "text-green-500"
                  }`}
                />
                <span className="font-semibold">Pin xe điện</span>
              </button>
            </div>
          </div>

          {/* Common Fields */}
          <div className="space-y-5">
            <InputField
              icon={FileText}
              label="Tên sản phẩm"
              name="productname"
              placeholder="Nhập tên sản phẩm đầy đủ"
              formData={formData}
              handleInputChange={handleInputChange}
            />
            <TextareaField
              label="Mô tả chi tiết"
              name="description"
              placeholder="Mô tả chi tiết về sản phẩm, tình trạng, ưu điểm..."
              formData={formData}
              handleInputChange={handleInputChange}
            />
            <InputField
              icon={DollarSign}
              label="Giá bán (VNĐ)"
              name="cost"
              type="number"
              placeholder="VD: 500000000"
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </div>

          {/* Type-specific Fields */}
          {renderFields()}

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              Hình ảnh sản phẩm
              <span className="text-red-500">*</span>
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-3 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                isDragging
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
              }`}
            >
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                accept="image/*"
                required={images.length === 0}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="text-center">
                <Upload
                  className={`w-12 h-12 mx-auto mb-4 ${
                    isDragging
                      ? "text-blue-500 animate-bounce"
                      : "text-gray-400"
                  }`}
                />
                <p className="text-gray-600 font-medium mb-2">
                  Kéo thả ảnh vào đây hoặc click để chọn
                </p>
                <p className="text-gray-400 text-sm">
                  Hỗ trợ: JPG, PNG, GIF (Tối đa 10 ảnh)
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all duration-300"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-shake">
              <X className="w-5 h-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3 ${getSubmitButtonClasses()}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang đăng bài...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Đăng tin ngay
              </>
            )}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-xl font-semibold text-gray-600 border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
          >
            Quay lại trang chủ
          </button>
        </form>
      </div>

      {/* Custom animation */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .border-3 { border-width: 3px; }
      `}</style>
    </div>
  );
};

export default NewPost;
