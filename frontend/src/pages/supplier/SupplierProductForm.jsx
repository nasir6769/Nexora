import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createSupplierProduct,
  getSupplierProduct,
  updateSupplierProduct,
} from "../../services/supplierService";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import Spinner from "../../components/common/Spinner";

import { ROUTES } from "../../routes/routeConfig";

import "./SupplierProductForm.css";

const initialForm = {
  name: "",
  sku: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  minimumOrderQuantity: "",
};

function getProductData(response) {
  return response?.data || response?.product || response;
}

function SupplierProductForm() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const isEditMode = Boolean(productId);

  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(
    isEditMode
  );
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;

    const loadProduct = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response =
          await getSupplierProduct(productId);

        const product =
          getProductData(response);

        setForm({
          name:
            product?.name ||
            product?.productName ||
            "",
          sku: product?.sku || "",
          category:
            product?.category || "",
          description:
            product?.description || "",
          price:
            product?.price ??
            product?.unitPrice ??
            "",
          stock:
            product?.stock ??
            product?.quantity ??
            "",
          minimumOrderQuantity:
            product?.minimumOrderQuantity ??
            product?.moq ??
            "",
        });
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load product."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [isEditMode, productId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!form.category.trim()) {
      setError("Category is required.");
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      setError(
        "Enter a valid product price."
      );
      return;
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      setError(
        "Enter a valid stock quantity."
      );
      return;
    }

    if (
      form.minimumOrderQuantity === "" ||
      Number(form.minimumOrderQuantity) <= 0
    ) {
      setError(
        "Enter a valid minimum order quantity."
      );
      return;
    }

    if (
      Number(form.minimumOrderQuantity) >
      Number(form.stock)
    ) {
      setError(
        "Minimum order quantity cannot exceed available stock."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      minimumOrderQuantity: Number(
        form.minimumOrderQuantity
      ),
    };

    try {
      if (isEditMode) {
        await updateSupplierProduct(
          productId,
          payload
        );
      } else {
        await createSupplierProduct(
          payload
        );
      }

      navigate(
        ROUTES.SUPPLIER.PRODUCTS
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          `Unable to ${
            isEditMode
              ? "update"
              : "create"
          } product.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="supplier-product-form-loading">
        <Spinner size="large" />
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="supplier-product-form-page">
      <div className="page-header">
        <div>
          <h1>
            {isEditMode
              ? "Edit Product"
              : "Add Product"}
          </h1>

          <p>
            {isEditMode
              ? "Update your product information and stock."
              : "Add a product that can be discovered and ordered through the platform."}
          </p>
        </div>
      </div>

      <Card>
        <form
          className="supplier-product-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="supplier-product-form-error">
              {error}
            </div>
          )}

          <div className="supplier-form-grid">
            <Input
              label="Product name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Basmati Rice"
              required
            />

            <Input
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="e.g. RICE-001"
              required
            />

            <Input
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Grocery"
              required
            />

            <Select
              label="Product type"
              name="productType"
              value="standard"
              options={[
                {
                  value: "standard",
                  label: "Standard product",
                },
              ]}
              disabled
            />

            <Input
              label="Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />

            <Input
              label="Available stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
              required
            />

            <Input
              label="Minimum order quantity"
              name="minimumOrderQuantity"
              type="number"
              min="1"
              step="1"
              value={form.minimumOrderQuantity}
              onChange={handleChange}
              placeholder="e.g. 10"
              required
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the product, packaging, quality, or other useful details..."
            rows={5}
          />

          <div className="supplier-product-form-actions">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() =>
                navigate(
                  ROUTES.SUPPLIER.PRODUCTS
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={isSubmitting}
            >
              {isEditMode
                ? "Save changes"
                : "Add product"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SupplierProductForm;