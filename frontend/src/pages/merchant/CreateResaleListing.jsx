import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createResaleListing,
} from "../../services/resaleService";

import {
  ROUTES,
} from "../../routes/routeConfig";

import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

import "./CreateResaleListing.css";

const INITIAL_FORM = {
  productName: "",
  sku: "",
  category: "",
  description: "",
  price: "",
  quantity: "",
};

function CreateResaleListing() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!form.productName.trim()) {
      return "Product name is required.";
    }

    if (!form.category.trim()) {
      return "Category is required.";
    }

    if (!form.price || Number(form.price) <= 0) {
      return "Enter a valid resale price.";
    }

    if (
      !form.quantity ||
      Number(form.quantity) <= 0
    ) {
      return "Enter a valid quantity.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await createResaleListing({
        productName: form.productName.trim(),
        sku: form.sku.trim() || undefined,
        category: form.category.trim(),
        description:
          form.description.trim() || undefined,
        price: Number(form.price),
        quantity: Number(form.quantity),
      });

      navigate(ROUTES.MERCHANT.MY_LISTINGS);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to create the resale listing."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-resale">
      <div className="page-header">
        <div>
          <h1>
            List Excess Inventory
          </h1>

          <p>
            Offer your excess or slow-moving
            stock to other merchants.
          </p>
        </div>
      </div>

      {error && (
        <div className="create-resale-error">
          {error}
        </div>
      )}

      <Card
        title="Listing details"
        subtitle="Provide the details merchants will see in the resale marketplace."
      >
        <form
          className="create-resale-form"
          onSubmit={handleSubmit}
        >
          <div className="create-resale-grid">
            <Input
              label="Product name"
              value={form.productName}
              onChange={(event) =>
                updateField(
                  "productName",
                  event.target.value
                )
              }
              placeholder="e.g. Wireless Keyboard"
              required
            />

            <Input
              label="SKU"
              value={form.sku}
              onChange={(event) =>
                updateField(
                  "sku",
                  event.target.value
                )
              }
              placeholder="e.g. KB-1024"
            />

            <Input
              label="Category"
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value
                )
              }
              placeholder="e.g. Electronics"
              required
            />

            <Input
              label="Resale price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                updateField(
                  "price",
                  event.target.value
                )
              }
              placeholder="0.00"
              required
            />

            <Input
              label="Quantity available"
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={(event) =>
                updateField(
                  "quantity",
                  event.target.value
                )
              }
              placeholder="0"
              required
            />

            <Select
              label="Listing type"
              value="excess-stock"
              options={[
                {
                  value: "excess-stock",
                  label: "Excess stock",
                },
              ]}
              disabled
            />
          </div>

          <Textarea
            label="Description"
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            placeholder="Add useful information about the stock, condition, packaging, expiry, or other details."
            rows={5}
          />

          <div className="create-resale-info">
            <strong>
              Before publishing
            </strong>

            <p>
              Make sure the quantity and resale
              price are accurate. Other merchants
              will be able to see this listing and
              submit a request for the available
              stock.
            </p>
          </div>

          <div className="create-resale-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                navigate(
                  ROUTES.MERCHANT.MY_LISTINGS
                )
              }
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Publish listing
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateResaleListing;