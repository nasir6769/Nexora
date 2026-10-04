import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createInventoryItem,
} from "../../services/inventoryService";
import { ROUTES } from "../../routes/routeConfig";

import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

import "./AddInventory.css";

function AddInventory() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    lowStockThreshold: "10",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!formData.category.trim()) {
      setError("Category is required.");
      return;
    }

    if (formData.price === "") {
      setError("Price is required.");
      return;
    }

    if (formData.stock === "") {
      setError("Stock quantity is required.");
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock);
    const lowStockThreshold = Number(
      formData.lowStockThreshold
    );

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError(
        "Stock quantity must be a whole number."
      );
      return;
    }

    if (
      !Number.isInteger(lowStockThreshold) ||
      lowStockThreshold < 0
    ) {
      setError(
        "Enter a valid low-stock threshold."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createInventoryItem({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category.trim(),
        description:
          formData.description.trim(),
        price,
        stock,
        lowStockThreshold,
      });

      navigate(
        ROUTES.MERCHANT.INVENTORY,
        { replace: true }
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to add inventory item."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-inventory">
      <div className="page-header">
        <div>
          <h1>Add inventory</h1>

          <p>
            Add a product and its current stock
            information.
          </p>
        </div>
      </div>

      <Card
        title="Product details"
        subtitle="Enter the information for this inventory item."
      >
        <form
          className="inventory-form"
          onSubmit={handleSubmit}
        >
          <div className="inventory-form-grid">
            <Input
              label="Product name"
              name="name"
              placeholder="e.g. Basmati Rice 5kg"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />

            <Input
              label="SKU"
              name="sku"
              placeholder="e.g. RICE-5KG-001"
              value={formData.sku}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />

            <Input
              label="Category"
              name="category"
              placeholder="e.g. Grocery"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />

            <Input
              label="Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />

            <Input
              label="Stock quantity"
              name="stock"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={formData.stock}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />

            <Input
              label="Low-stock threshold"
              name="lowStockThreshold"
              type="number"
              min="0"
              step="1"
              placeholder="10"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            placeholder="Add a short description of the product..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={4}
          />

          {error && (
            <div
              className="inventory-form-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="inventory-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                navigate(
                  ROUTES.MERCHANT.INVENTORY
                )
              }
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={isSubmitting}
            >
              Add inventory
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AddInventory;