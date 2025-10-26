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
  });

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data ready to send:", formData);
    {
      async () => {
        try {
          const response = await createPost(formData);
          console.log("Product created:", response);
        } catch (error) {
          console.error("Error:", error);
          toast.error("Failed to create product. Please try again.");
        }

        // TODO: Replace console.log with API call:
        /*
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => console.log("✅ Product created:", data))
      .catch((err) => console.error("❌ Error:", err));
    */
      };
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
              >
                <option value="CHO_DUYET">Waiting Approval</option>
                <option value="DUOC_DUYET">Approved</option>
                <option value="TU_CHOI">Rejected</option>
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
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
