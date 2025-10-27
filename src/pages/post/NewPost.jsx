import React, { useState } from "react";
import { createPost } from "../../utils/services/postService";
import { toast } from "sonner";

export default function CreateProductPage() {
  const [formData, setFormData] = useState({
    productname: "",
    description: "",
    cost: "",
    amount: "",
    status: "CHO_DUYET",
    model: "",
    type: "",
    specs: "",
    images: [""],
    brandcars: { brand: "", year: "", licensePlate: "", odo: "", capacity: "", color: "" }, // Conditional for CAR
    brandbattery: { brand: "", year: "", capacity: "", voltage: "", condition: "", pickupAddress: "", remaining: "" }, // Conditional for BATTERY
  });
  const [loading, setLoading] = useState(false);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle nested fields (for brandcars or brandbattery)
  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // Handle dynamic image URLs
  const handleImageChange = (index, value) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData({ ...formData, images: updatedImages });
  };

  // Add new image input
  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Filter out empty images
    const cleanedData = {
      ...formData,
      images: formData.images.filter((img) => img.trim() !== ""),
    };

    // If type is CAR or BATTERY, ensure nested data is included; otherwise, remove unused nested objects
    if (formData.type !== "CAR") {
      delete cleanedData.brandcars;
    }
    if (formData.type !== "BATTERY") {
      delete cleanedData.brandbattery;
    }

    console.log("Form data ready to send:", cleanedData);

    try {
      const response = await createPost(cleanedData);
      console.log("Product created:", response);
      toast.success("Product created successfully!");
      // Reset form
      setFormData({
        productname: "",
        description: "",
        cost: "",
        amount: "",
        status: "CHO_DUYET",
        model: "",
        type: "",
        specs: "",
        images: [""],
        brandcars: { brand: "", year: "", licensePlate: "", odo: "", capacity: "", color: "" },
        brandbattery: { brand: "", year: "", capacity: "", voltage: "", condition: "", pickupAddress: "", remaining: "" },
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          🧾 Create New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div>
            <label className="block font-semibold">Product Name *</label>
            <input
              type="text"
              name="productname"
              value={formData.productname}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block font-semibold">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>

          {/* Numeric Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Cost ($)*</label>
              <input
                type="number"
                step="0.01"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold">Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          {/* Select Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              >
                <option value="">Select type</option>
                <option value="CAR">Car</option>
                <option value="BATTERY">Battery</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded p-2"
                disabled // Sellers likely only submit as CHO_DUYET
              >
                <option value="CHO_DUYET">Waiting Approval</option>
              </select>
            </div>
          </div>

          {/* Model and Specs */}
          <div>
            <label className="block font-semibold">Model *</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block font-semibold">Specs *</label>
            <textarea
              name="specs"
              value={formData.specs}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>

          {/* Conditional Fields for CAR */}
          {formData.type === "CAR" && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold">Car-Specific Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Brand"
                  value={formData.brandcars.brand}
                  onChange={(e) => handleNestedChange("brandcars", "brand", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={formData.brandcars.year}
                  onChange={(e) => handleNestedChange("brandcars", "year", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="License Plate"
                  value={formData.brandcars.licensePlate}
                  onChange={(e) => handleNestedChange("brandcars", "licensePlate", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="number"
                  placeholder="Odo (km)"
                  value={formData.brandcars.odo}
                  onChange={(e) => handleNestedChange("brandcars", "odo", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={formData.brandcars.capacity}
                  onChange={(e) => handleNestedChange("brandcars", "capacity", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={formData.brandcars.color}
                  onChange={(e) => handleNestedChange("brandcars", "color", e.target.value)}
                  className="border rounded p-2"
                />
              </div>
            </div>
          )}

          {/* Conditional Fields for BATTERY */}
          {formData.type === "BATTERY" && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold">Battery-Specific Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Brand"
                  value={formData.brandbattery.brand}
                  onChange={(e) => handleNestedChange("brandbattery", "brand", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={formData.brandbattery.year}
                  onChange={(e) => handleNestedChange("brandbattery", "year", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="number"
                  placeholder="Capacity (kWh)"
                  value={formData.brandbattery.capacity}
                  onChange={(e) => handleNestedChange("brandbattery", "capacity", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="number"
                  placeholder="Voltage"
                  value={formData.brandbattery.voltage}
                  onChange={(e) => handleNestedChange("brandbattery", "voltage", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Condition"
                  value={formData.brandbattery.condition}
                  onChange={(e) => handleNestedChange("brandbattery", "condition", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Pickup Address"
                  value={formData.brandbattery.pickupAddress}
                  onChange={(e) => handleNestedChange("brandbattery", "pickupAddress", e.target.value)}
                  className="border rounded p-2"
                />
                <input
                  type="number"
                  placeholder="Remaining (%)"
                  value={formData.brandbattery.remaining}
                  onChange={(e) => handleNestedChange("brandbattery", "remaining", e.target.value)}
                  className="border rounded p-2"
                />
              </div>
            </div>
          )}

          {/* Images (Dynamic Fields) */}
          <div>
            <label className="block font-semibold">Images (URLs)</label>
            {formData.images.map((img, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Image URL ${idx + 1}`}
                value={img}
                onChange={(e) => handleImageChange(idx, e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="text-blue-600 hover:text-blue-800"
            >
              + Add another image
            </button>
          </div>

          {/* Submit */}
          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}