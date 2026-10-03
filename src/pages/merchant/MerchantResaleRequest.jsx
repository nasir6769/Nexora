import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createResaleRequest,
  getResaleListing,
} from "../../services/resaleService";

import {
  ROUTES,
} from "../../routes/routeConfig";

import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";

import "./MerchantResaleRequest.css";

function MerchantResaleRequest() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [quantity, setQuantity] = useState("1");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadListing = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response =
          await getResaleListing(productId);

        setListing(
          response?.listing ||
            response?.data ||
            response
        );
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load this resale listing."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadListing();
    }
  }, [productId]);

  const availableQuantity =
    listing?.quantity ??
    listing?.availableQuantity ??
    listing?.stock ??
    0;

  const productName =
    listing?.name ||
    listing?.productName ||
    listing?.product?.name ||
    "Product";

  const price =
    listing?.price ??
    listing?.resalePrice ??
    listing?.unitPrice;

  const seller =
    listing?.merchantName ||
    listing?.sellerName ||
    listing?.merchant?.name ||
    listing?.seller?.name ||
    "Merchant";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requestedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      setError(
        "Enter a valid quantity."
      );
      return;
    }

    if (
      availableQuantity &&
      requestedQuantity > Number(availableQuantity)
    ) {
      setError(
        `Only ${availableQuantity} unit${
          Number(availableQuantity) === 1
            ? ""
            : "s"
        } available.`
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await createResaleRequest({
        listingId: productId,
        productId,
        quantity: requestedQuantity,
      });

      setSuccess(true);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to submit the resale request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="resale-request-loading">
        <Spinner size="large" />
        <p>
          Loading resale listing...
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="merchant-resale-request">
        <Card>
          <div className="resale-request-success">
            <div className="resale-request-success-icon">
              ✓
            </div>

            <h1>
              Request submitted
            </h1>

            <p>
              Your request for{" "}
              <strong>
                {productName}
              </strong>{" "}
              has been submitted successfully.
            </p>

            <div className="resale-request-success-actions">
              <Button
                onClick={() =>
                  navigate(
                    ROUTES.MERCHANT.ORDERS
                  )
                }
              >
                View orders
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  navigate(
                    ROUTES.MERCHANT.RESALE
                  )
                }
              >
                Back to marketplace
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="merchant-resale-request">
      <div className="page-header">
        <div>
          <h1>
            Request Resale Stock
          </h1>

          <p>
            Submit a request to purchase
            excess inventory from another
            merchant.
          </p>
        </div>
      </div>

      {error && (
        <div className="resale-request-error">
          {error}
        </div>
      )}

      <div className="resale-request-grid">
        <Card
          title="Listing details"
          subtitle="Review the stock before submitting your request."
        >
          <div className="resale-listing-summary">
            <div>
              <span>Product</span>
              <strong>
                {productName}
              </strong>
            </div>

            <div>
              <span>Seller</span>
              <strong>
                {seller}
              </strong>
            </div>

            <div>
              <span>Category</span>
              <strong>
                {listing?.category ||
                  listing?.product?.category ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>Price / unit</span>
              <strong>
                {price !== undefined &&
                price !== null
                  ? `₹${Number(
                      price
                    ).toLocaleString(
                      "en-IN"
                    )}`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>Available</span>
              <strong>
                {availableQuantity}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <Badge
                size="small"
                variant="success"
              >
                {listing?.status ||
                  "Available"}
              </Badge>
            </div>
          </div>
        </Card>

        <Card
          title="Request quantity"
          subtitle="Choose how much stock you want to request."
        >
          <form
            className="resale-request-form"
            onSubmit={handleSubmit}
          >
            <Input
              label="Quantity"
              type="number"
              min="1"
              max={
                availableQuantity || undefined
              }
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  event.target.value
                )
              }
              required
            />

            {price !== undefined &&
              price !== null &&
              quantity && (
                <div className="resale-request-total">
                  <span>
                    Estimated total
                  </span>

                  <strong>
                    ₹
                    {(
                      Number(price) *
                      Number(quantity || 0)
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              )}

            <div className="resale-request-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  navigate(
                    ROUTES.MERCHANT.RESALE
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
                Submit request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default MerchantResaleRequest;