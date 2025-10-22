import React, { useState, useRef, useEffect } from "react";
import {
  Car,
  Upload,
  X,
  Play,
  ImageIcon,
  DollarSign,
  Calendar,
  Gauge,
  MapPin,
  Battery,
  Check,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Save,
} from "lucide-react";

// Mock database
const mockDatabase = [];

const PostCarForm = () => {
  const [formData, setFormData] = useState({
    carName: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    batteryHealth: "",
    location: "",
    registrationStatus: "registered",
    description: "",
    features: [],
  });

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Expanded brands and models
  const brands = [
    {
      name: "Tesla",
      models: [
        "Model 3",
        "Model S",
        "Model X",
        "Model Y",
        "Cybertruck",
        "Roadster",
      ],
    },
    { name: "VinFast", models: ["VF5", "VF6", "VF7", "VF8", "VF9", "VF e34"] },
    {
      name: "BYD",
      models: ["Atto 3", "Seal", "Dolphin", "Han", "Tang", "Yuan Plus"],
    },
    {
      name: "Hyundai",
      models: ["Kona Electric", "Ioniq 5", "Ioniq 6", "Ioniq Electric"],
    },
    { name: "Kia", models: ["EV6", "Niro EV", "Soul EV", "EV9"] },
    { name: "Mercedes-Benz", models: ["EQC", "EQS", "EQE", "EQB", "EQA"] },
    { name: "BMW", models: ["i3", "i4", "iX", "iX3", "i7"] },
    { name: "Audi", models: ["e-tron", "e-tron GT", "Q4 e-tron", "Q8 e-tron"] },
    { name: "Porsche", models: ["Taycan", "Taycan Cross Turismo"] },
    { name: "Nissan", models: ["Leaf", "Ariya"] },
    { name: "MG", models: ["MG4 EV", "MG ZS EV", "MG5 EV"] },
    { name: "Volkswagen", models: ["ID.3", "ID.4", "ID. Buzz"] },
    { name: "Rivian", models: ["R1T", "R1S"] },
    { name: "Lucid", models: ["Air Dream", "Air Touring", "Air Pure"] },
    { name: "Chevrolet", models: ["Bolt EV", "Bolt EUV", "Blazer EV"] },
  ];

  const features = [
    "Tự lái (Autopilot)",
    "Camera 360°",
    "Cảm biến lùi",
    "Cửa sổ trời",
    "Ghế da",
    "Sạc không dây",
    "Hệ thống âm thanh cao cấp",
    "Màn hình cảm ứng lớn",
    "Apple CarPlay",
    "Android Auto",
    "Hệ thống an toàn nâng cao",
    "Cruise Control",
  ];

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      videos.forEach((vid) => URL.revokeObjectURL(vid.preview));
    };
  }, [images, videos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePriceChange = (e) => {
    let value = e.target.value.replace(/\./g, "");
    if (!isNaN(value) && value !== "") {
      setFormData((prev) => ({ ...prev, price: value }));
    } else {
      setFormData((prev) => ({ ...prev, price: "" }));
    }
    if (errors.price) {
      setErrors((prev) => ({ ...prev, price: "" }));
    }
  };

  const handleBrandSelect = (brand) => {
    setFormData((prev) => ({ ...prev, brand: brand.name, model: "" }));
    setShowBrandDropdown(false);
    if (errors.brand) {
      setErrors((prev) => ({ ...prev, brand: "" }));
    }
  };

  const supportedImageTypes = ["image/jpeg", "image/png"];
  const supportedVideoTypes = ["video/mp4"];
  const maxFiles = 10;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).filter((f) =>
      supportedImageTypes.includes(f.type)
    );
    if (files.length !== e.target.files.length) {
      alert("Chỉ hỗ trợ file JPG và PNG.");
    }
    if (images.length + videos.length + files.length > maxFiles) {
      alert(`Bạn chỉ có thể tải lên tối đa ${maxFiles} file.`);
      return;
    }
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files).filter((f) =>
      supportedVideoTypes.includes(f.type)
    );
    if (files.length !== e.target.files.length) {
      alert("Chỉ hỗ trợ file MP4.");
    }
    if (images.length + videos.length + files.length > maxFiles) {
      alert(`Bạn chỉ có thể tải lên tối đa ${maxFiles} file.`);
      return;
    }
    const newVideos = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setVideos((prev) => [...prev, ...newVideos]);
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const img = prev.find((img) => img.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const removeVideo = (id) => {
    setVideos((prev) => {
      const vid = prev.find((vid) => vid.id === id);
      if (vid) URL.revokeObjectURL(vid.preview);
      return prev.filter((vid) => vid.id !== id);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) =>
      supportedImageTypes.includes(f.type)
    );
    const videoFiles = files.filter((f) =>
      supportedVideoTypes.includes(f.type)
    );

    if (
      images.length + videos.length + imageFiles.length + videoFiles.length >
      maxFiles
    ) {
      alert(`Bạn chỉ có thể tải lên tối đa ${maxFiles} file.`);
      return;
    }

    if (imageFiles.length > 0) {
      const newImages = imageFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: "" }));
      }
    }

    if (videoFiles.length > 0) {
      const newVideos = videoFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
      }));
      setVideos((prev) => [...prev, ...newVideos]);
    }

    if (files.length !== imageFiles.length + videoFiles.length) {
      alert("Chỉ hỗ trợ file JPG, PNG và MP4.");
    }
  };

  const toggleFeature = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.carName.trim()) newErrors.carName = "Vui lòng nhập tên xe";
    if (!formData.brand) newErrors.brand = "Vui lòng chọn hãng xe";
    if (!formData.price) {
      newErrors.price = "Vui lòng nhập giá";
    } else if (isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "Giá phải là số dương";
    }
    if (!formData.year) {
      newErrors.year = "Vui lòng nhập năm đăng ký";
    } else if (
      isNaN(formData.year) ||
      formData.year < 2010 ||
      formData.year > currentYear
    ) {
      newErrors.year = `Năm đăng ký phải từ 2010 đến ${currentYear}`;
    }
    if (!formData.mileage) {
      newErrors.mileage = "Vui lòng nhập số km đã đi";
    } else if (isNaN(formData.mileage) || formData.mileage < 0) {
      newErrors.mileage = "Số km phải là số không âm";
    }
    if (
      formData.batteryHealth &&
      (isNaN(formData.batteryHealth) ||
        formData.batteryHealth < 0 ||
        formData.batteryHealth > 100)
    ) {
      newErrors.batteryHealth = "Sức khỏe pin phải từ 0 đến 100";
    }
    if (images.length === 0)
      newErrors.images = "Vui lòng tải lên ít nhất 1 ảnh";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const step1Errors = {};
      if (!formData.carName.trim())
        step1Errors.carName = "Vui lòng nhập tên xe";
      if (!formData.brand) step1Errors.brand = "Vui lòng chọn hãng xe";
      if (!formData.price) step1Errors.price = "Vui lòng nhập giá";
      if (!formData.year) step1Errors.year = "Vui lòng nhập năm đăng ký";
      if (!formData.mileage) step1Errors.mileage = "Vui lòng nhập số km đã đi";
      setErrors(step1Errors);
      if (Object.keys(step1Errors).length === 0) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (images.length === 0) {
        setErrors({ images: "Vui lòng tải lên ít nhất 1 ảnh" });
      } else {
        setCurrentStep(3);
      }
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        const formDataToSend = {
          ...formData,
          images: images.map((img) => img.file.name),
          videos: videos.map((vid) => vid.file.name),
          id: Date.now(),
        };
        mockDatabase.push(formDataToSend);
        console.log("Posted to mock database:", formDataToSend);
        console.log("Mock database:", mockDatabase);

        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setFormData({
            carName: "",
            brand: "",
            model: "",
            year: "",
            price: "",
            mileage: "",
            batteryHealth: "",
            location: "",
            registrationStatus: "registered",
            description: "",
            features: [],
          });
          images.forEach((img) => URL.revokeObjectURL(img.preview));
          videos.forEach((vid) => URL.revokeObjectURL(vid.preview));
          setImages([]);
          setVideos([]);
          setErrors({});
          setCurrentStep(1);
          setIsSubmitting(false);
        }, 3000);
      } catch (error) {
        setErrors({ submit: "Không thể đăng bài. Vui lòng thử lại." });
        setIsSubmitting(false);
      }
    }
  };

  const formatPrice = (value) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const selectedBrand = brands.find((b) => b.name === formData.brand);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes slideUp {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes bounceSlow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes slideDown {
            0% { transform: translateY(-10px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes scaleIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
          .animate-fade-in { animation: fadeIn 0.5s ease-out; }
          .animate-slide-up { animation: slideUp 0.5s ease-out; }
          .animate-bounce-slow { animation: bounceSlow 2s infinite; }
          .animate-slide-down { animation: slideDown 0.3s ease-out; }
          .animate-scale-in { animation: scaleIn 0.3s ease-out; }
          .animate-shake { animation: shake 0.5s ease-out; }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
        `}
      </style>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 animate-bounce-slow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Đăng Bán Xe Điện
          </h1>
          <p className="text-gray-300 text-lg">
            Chia sẻ thông tin chi tiết để thu hút người mua
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center gap-2 transition-all duration-500 ${
                    currentStep >= step ? "scale-110" : "scale-100 opacity-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                      currentStep >= step
                        ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50"
                        : "bg-white/10"
                    }`}
                  >
                    {currentStep > step ? <Check className="w-5 h-5" /> : step}
                  </div>
                  <span className="text-sm text-white hidden md:inline">
                    {step === 1
                      ? "Thông tin"
                      : step === 2
                      ? "Media"
                      : "Hoàn tất"}
                  </span>
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 md:w-24 h-1 rounded transition-all duration-500 ${
                      currentStep > step
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                        : "bg-white/10"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 animate-slide-up">
            {currentStep === 1 && (
              <>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                  <Car className="w-6 h-6 text-blue-400" />
                  Thông tin cơ bản
                </h2>

                {/* Car Name */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Tên xe *
                  </label>
                  <input
                    type="text"
                    name="carName"
                    value={formData.carName}
                    onChange={handleInputChange}
                    placeholder="VD: Tesla Model 3 Long Range"
                    aria-label="Tên xe"
                    aria-describedby={
                      errors.carName ? "carName-error" : undefined
                    }
                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white/10 focus:border-blue-400 focus:scale-[1.02] ${
                      errors.carName ? "border-red-500" : "border-white/20"
                    }`}
                  />
                  {errors.carName && (
                    <p
                      id="carName-error"
                      className="text-red-400 text-sm mt-1 flex items-center gap-1 animate-shake"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.carName}
                    </p>
                  )}
                </div>

                {/* Brand & Model */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Hãng xe *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setShowBrandDropdown(!showBrandDropdown);
                        }
                      }}
                      aria-label="Chọn hãng xe"
                      aria-expanded={showBrandDropdown}
                      className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white text-left outline-none transition-all duration-300 hover:bg-white/10 hover:border-blue-400 flex items-center justify-between ${
                        errors.brand ? "border-red-500" : "border-white/20"
                      }`}
                    >
                      <span
                        className={
                          formData.brand ? "text-white" : "text-gray-400"
                        }
                      >
                        {formData.brand || "Chọn hãng xe"}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${
                          showBrandDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {showBrandDropdown && (
                      <div
                        className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-slide-down"
                        role="listbox"
                        aria-label="Danh sách hãng xe"
                      >
                        <div className=" max-h-64 overflow-y-auto custom-scrollbar">
                          {brands.map((brand, idx) => (
                            <button
                              key={brand.name}
                              type="button"
                              onClick={() => handleBrandSelect(brand)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  handleBrandSelect(brand);
                                }
                              }}
                              role="option"
                              aria-selected={formData.brand === brand.name}
                              className="w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors duration-200 flex items-center gap-2"
                              style={{
                                animation: `slideIn 0.3s ease-out forwards`,
                                animationDelay: `${idx * 0.03}s`,
                                opacity: 0.9,
                              }}
                            >
                              <Car className="w-4 h-4 text-blue-400" />
                              {brand.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {errors.brand && (
                      <p
                        id="brand-error"
                        className="text-red-400 text-sm mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.brand}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Dòng xe
                    </label>
                    <select
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      disabled={!formData.brand}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/20 rounded-xl text-white outline-none transition-all duration-300 focus:bg-white/10 focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option className="bg-slate-800" value="">
                        Chọn dòng xe
                      </option>
                      {selectedBrand?.models.map((model) => (
                        <option
                          key={model}
                          value={model}
                          className="bg-slate-800"
                        >
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Year & Price */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Năm đăng ký *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        placeholder="2023"
                        min="2010"
                        max={new Date().getFullYear()}
                        aria-label="Năm đăng ký"
                        aria-describedby={
                          errors.year ? "year-error" : undefined
                        }
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white/10 focus:border-blue-400 ${
                          errors.year ? "border-red-500" : "border-white/20"
                        }`}
                      />
                    </div>
                    {errors.year && (
                      <p
                        id="year-error"
                        className="text-red-400 text-sm mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.year}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Giá bán *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                      <input
                        type="text"
                        name="price"
                        value={
                          formData.price ? formatPrice(formData.price) : ""
                        }
                        onChange={handlePriceChange}
                        placeholder="850.000.000"
                        aria-label="Giá bán"
                        aria-describedby={
                          errors.price ? "price-error" : undefined
                        }
                        className={`w-full pl-12 pr-16 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white/10 focus:border-blue-400 ${
                          errors.price ? "border-red-500" : "border-white/20"
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        VNĐ
                      </span>
                    </div>
                    {errors.price && (
                      <p
                        id="price-error"
                        className="text-red-400 text-sm mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mileage & Battery */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Số km đã đi *
                    </label>
                    <div className="relative">
                      <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                      <input
                        type="number"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        placeholder="25000"
                        aria-label="Số km đã đi"
                        aria-describedby={
                          errors.mileage ? "mileage-error" : undefined
                        }
                        className={`w-full pl-12 pr-12 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white/10 focus:border-blue-400 ${
                          errors.mileage ? "border-red-500" : "border-white/20"
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        km
                      </span>
                    </div>
                    {errors.mileage && (
                      <p
                        id="mileage-error"
                        className="text-red-400 text-sm mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.mileage}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Sức khỏe pin
                    </label>
                    <div className="relative">
                      <Battery className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                      <input
                        type="number"
                        name="batteryHealth"
                        value={formData.batteryHealth}
                        onChange={handleInputChange}
                        placeholder="85"
                        min="0"
                        max="100"
                        aria-label="Sức khỏe pin"
                        aria-describedby={
                          errors.batteryHealth
                            ? "batteryHealth-error"
                            : undefined
                        }
                        className={`w-full pl-12 pr-12 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white/10 focus:border-blue-400 ${
                          errors.batteryHealth
                            ? "border-red-500"
                            : "border-white/20"
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        %
                      </span>
                    </div>
                    {errors.batteryHealth && (
                      <p
                        id="batteryHealth-error"
                        className="text-red-400 text-sm mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.batteryHealth}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Địa điểm
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="TP. Hồ Chí Minh"
                      aria-label="Địa điểm"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white/10 focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Registration Status */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    Tình trạng đăng ký
                  </label>
                  <div className="flex gap-4">
                    {[
                      {
                        value: "registered",
                        label: "Đã đăng ký",
                        icon: <Check className="w-4 h-4" />,
                      },
                      {
                        value: "pending",
                        label: "Chưa đăng ký",
                        icon: <AlertCircle className="w-4 h-4" />,
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            registrationStatus: option.value,
                          }))
                        }
                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                          formData.registrationStatus === option.value
                            ? "bg-blue-500/20 border-blue-400 text-white scale-105"
                            : "bg-white/5 border-white/20 text-gray-400 hover:border-white/40"
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="5"
                    placeholder="Mô tả tình trạng xe, lịch sử sử dụng, lý do bán..."
                    aria-label="Mô tả chi tiết"
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 outline-none transition-all duration-300 focus:bg-white/10 focus:border-blue-400 resize-none"
                  />
                </div>

                {/* Features */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    Tính năng nổi bật
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {features.map((feature, idx) => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm transition-all duration-300 ${
                          formData.features.includes(feature)
                            ? "bg-blue-500/20 border-blue-400 text-white scale-105"
                            : "bg-white/5 border-white/20 text-gray-400 hover:border-white/40"
                        }`}
                        style={{
                          animation: `fadeIn 0.3s ease-out forwards`,
                          animationDelay: `${idx * 0.03}s`,
                        }}
                      >
                        {formData.features.includes(feature) && (
                          <Check className="w-4 h-4 inline mr-1" />
                        )}
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                  <ImageIcon className="w-6 h-6 text-purple-400" />
                  Hình ảnh & Video
                </h2>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-blue-400 bg-blue-500/10 scale-105"
                      : errors.images
                      ? "border-red-500 bg-red-500/5"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Upload
                        className={`w-16 h-16 transition-all duration-500 ${
                          dragActive
                            ? "text-blue-400 scale-125 animate-bounce"
                            : "text-gray-400"
                        }`}
                      />
                      {dragActive && (
                        <div className="absolute inset-0 animate-ping">
                          <Upload className="w-16 h-16 text-blue-400 opacity-75" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-2">
                        Kéo thả file hoặc click để tải lên
                      </p>
                      <p className="text-gray-400 text-sm">
                        Hỗ trợ JPG, PNG, MP4 (Tối đa 10 file)
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:scale-110 transition-transform duration-300 flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Chọn ảnh
                      </button>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:scale-110 transition-transform duration-300 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Chọn video
                      </button>
                    </div>
                  </div>
                </div>

                {errors.images && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.images}
                  </p>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                />

                {images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-3">
                      Hình ảnh ({images.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((img, idx) => (
                        <div
                          key={img.id}
                          className="relative group animate-scale-in"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <img
                            src={img.preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {videos.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-3">
                      Video ({videos.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {videos.map((vid, idx) => (
                        <div
                          key={vid.id}
                          className="relative group animate-scale-in"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <video
                            src={vid.preview}
                            controls
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeVideo(vid.id)}
                            className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {currentStep === 3 && (
              <>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                  <Check className="w-6 h-6 text-green-400" />
                  Xem lại và gửi
                </h2>
                <div className="text-white space-y-2">
                  <p>
                    <strong>Tên xe:</strong> {formData.carName}
                  </p>
                  <p>
                    <strong>Hãng xe:</strong> {formData.brand}
                  </p>
                  <p>
                    <strong>Dòng xe:</strong> {formData.model || "N/A"}
                  </p>
                  <p>
                    <strong>Năm đăng ký:</strong> {formData.year}
                  </p>
                  <p>
                    <strong>Giá bán:</strong>{" "}
                    {formData.price ? formatPrice(formData.price) : "N/A"} VNĐ
                  </p>
                  <p>
                    <strong>Số km đã đi:</strong> {formData.mileage} km
                  </p>
                  <p>
                    <strong>Sức khỏe pin:</strong>{" "}
                    {formData.batteryHealth || "N/A"}%
                  </p>
                  <p>
                    <strong>Địa điểm:</strong> {formData.location || "N/A"}
                  </p>
                  <p>
                    <strong>Tình trạng đăng ký:</strong>{" "}
                    {formData.registrationStatus === "registered"
                      ? "Đã đăng ký"
                      : "Chưa đăng ký"}
                  </p>
                  <p>
                    <strong>Mô tả:</strong> {formData.description || "N/A"}
                  </p>
                  <p>
                    <strong>Tính năng:</strong>{" "}
                    {formData.features.join(", ") || "N/A"}
                  </p>
                  <p>
                    <strong>Số ảnh:</strong> {images.length}
                  </p>
                  <p>
                    <strong>Số video:</strong> {videos.length}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="px-6 py-3 bg-gray-500 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Quay lại
              </button>
            )}
            {currentStep < 3 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                Tiếp theo
              </button>
            )}
            {currentStep === 3 && (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg font-semibold flex items-center gap-2 ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                } transition-transform`}
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Đang gửi..." : "Đăng bài"}
              </button>
            )}
          </div>

          {errors.submit && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.submit}
            </p>
          )}
        </form>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md text-center border border-white/20">
              <Check className="w-16 h-16 text-green-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Đăng bài thành công!
              </h2>
              <p className="text-gray-300 mb-6">
                Bài đăng của bạn sẽ sớm được hiển thị.
              </p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCarForm;
