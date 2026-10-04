import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";

import {
  createProcurementRequest,
  getProcurementProduct,
} from "../../services/procurementService";

import {
  calculateCommitmentAmount,
  payCommitment,
} from "../../services/paymentService";

import { ROUTES } from "../../routes/routeConfig";

import "./MerchantProcurementRequest.css";

function formatCurrency(value) {
  const amount = Number(value) || 0;

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getSavedMerchantAddress() {
  try {
    const profile = JSON.parse(
      localStorage.getItem("merchantProfile") || "{}"
    );

    return profile?.address || null;
  } catch {
    return null;
  }
}

function MerchantProcurementRequest() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [commitment, setCommitment] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getProcurementProduct(productId);

        setProduct(
          response?.product ||
            response?.data ||
            response
        );
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load this product."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const productName =
    product?.name ||
    product?.productName ||
    product?.product?.name ||
    "Product";

  const price =
    product?.price ??
    product?.unitPrice ??
    product?.product?.price ??
    0;

  const availableStock =
    product?.stock ??
    product?.availableStock ??
    product?.quantity ??
    product?.product?.stock;

  const minimumOrderQuantity =
    product?.minimumOrderQuantity ??
    product?.minOrderQuantity ??
    product?.product?.minimumOrderQuantity ??
    1;

  const parsedQuantity = Number(quantity) || 0;

  const orderAmount =
    parsedQuantity > 0
      ? parsedQuantity * Number(price)
      : 0;

  const commitmentPercentage = 10;

  const commitmentAmount = calculateCommitmentAmount(
    orderAmount,
    commitmentPercentage
  );

  const remainingAmount =
    orderAmount - commitmentAmount;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      setError(
        "Enter a valid quantity greater than zero."
      );
      return;
    }

    if (
      requestedQuantity < Number(minimumOrderQuantity)
    ) {
      setError(
        `Minimum order quantity is ${minimumOrderQuantity}.`
      );
      return;
    }

    if (
      availableStock !== undefined &&
      availableStock !== null &&
      requestedQuantity > Number(availableStock)
    ) {
      setError(
        "Requested quantity exceeds available stock."
      );
      return;
    }

    if (!commitment) {
      setError(
        "Please confirm the 10% commitment before continuing."
      );
      return;
    }

    const merchantAddress = getSavedMerchantAddress();

    if (
      !merchantAddress?.addressLine1 ||
      !merchantAddress?.city ||
      !merchantAddress?.state ||
      !merchantAddress?.pincode
    ) {
      setError(
        "Please save your business delivery address in your Profile before placing a procurement request."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      /*
       * Step 1:
       * Merchant pays the 10% commitment.
       *
       * This is a payment/deposit.
       * It is NOT added to the supplier order value.
       */
      const paymentResult = await payCommitment({
        requestId: productId,
        amount: commitmentAmount,
        percentage: commitmentPercentage,
      });

      setPayment(paymentResult);

      /*
       * Step 2:
       * Only after successful payment do we create
       * the procurement request.
       *
       * The request goes to the platform/admin.
       * Supplier identity is never sent from this page.
       */
      await createProcurementRequest({
        productId,
        quantity: requestedQuantity,
        totalAmount: orderAmount,
        commitmentPercentage,
        commitmentAmount,
        paymentId: paymentResult?.paymentId,
        paymentStatus: "paid",
        deliveryAddress: merchantAddress,
      });

      setSuccess(
        "Your procurement request has been submitted to the platform admin."
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to complete the procurement request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="procurement-request-loading">
        <Spinner size="large" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product && error) {
    return (
      <div className="procurement-request">
        <div
          className="procurement-request-error"
          role="alert"
        >
          {error}
        </div>

        <Link to={ROUTES.MERCHANT.PROCUREMENT}>
          <Button variant="secondary">
            Back to procurement
          </Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="procurement-request">
        <Card>
          <div className="procurement-success">
            <div className="procurement-success-icon">
              ✓
            </div>

            <h1>Request submitted</h1>

            <p>
              Your procurement request for{" "}
              <strong>{productName}</strong>{" "}
              has been submitted to the platform
              admin.
            </p>

            {payment && (
              <div className="procurement-success-payment">
                <div>
                  <span>Commitment paid</span>

                  <strong>
                    {formatCurrency(
                      payment.amount
                    )}
                  </strong>
                </div>

                <div>
                  <span>Payment status</span>

                  <strong>
                    {payment.status || "Paid"}
                  </strong>
                </div>
              </div>
            )}

            <div className="procurement-success-actions">
              <Button
                onClick={() =>
                  navigate(
                    ROUTES.MERCHANT.ORDERS,
                    { replace: true }
                  )
                }
              >
                View orders
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  navigate(
                    ROUTES.MERCHANT.PROCUREMENT,
                    { replace: true }
                  )
                }
              >
                Continue shopping
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="procurement-request">
      <div className="page-header">
        <div>
          <h1>Request procurement</h1>

          <p>
            Request stock from the platform and
            pay the required 10% commitment.
          </p>
        </div>

        <Link to={ROUTES.MERCHANT.PROCUREMENT}>
          <Button variant="secondary">
            Back
          </Button>
        </Link>
      </div>

      {error && (
        <div
          className="procurement-request-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="procurement-request-grid">
        <Card
          title="Product"
          subtitle="Procurement product details"
        >
          <div className="product-summary">
            <div className="product-summary-row">
              <span>Product</span>

              <strong>
                {productName}
              </strong>
            </div>

            <div className="product-summary-row">
              <span>Unit price</span>

              <strong>
                {formatCurrency(price)}
              </strong>
            </div>

            <div className="product-summary-row">
              <span>Available stock</span>

              <strong>
                {availableStock ?? "—"}
              </strong>
            </div>

            <div className="product-summary-row">
              <span>Minimum order</span>

              <strong>
                {minimumOrderQuantity}
              </strong>
            </div>
          </div>

          <div className="procurement-info-box">
            <strong>
              Supplier information is hidden
            </strong>

            <p>
              Your request is sent to the platform
              admin. The admin will select the
              supplier for fulfilment.
            </p>
          </div>
        </Card>

        <Card
          title="Request details"
          subtitle="Specify how much stock you need."
        >
          <form
            className="procurement-request-form"
            onSubmit={handleSubmit}
          >
            <Input
              label="Quantity"
              name="quantity"
              type="number"
              min={minimumOrderQuantity}
              step="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value);
                setError("");
              }}
              disabled={isSubmitting}
              required
            />

            <div className="procurement-payment-summary">
              <div>
                <span>Order value</span>

                <strong>
                  {formatCurrency(orderAmount)}
                </strong>
              </div>

              <div>
                <span>Commitment</span>

                <strong>
                  {commitmentPercentage}%
                </strong>
              </div>

              <div className="procurement-payment-total">
                <span>Pay now</span>

                <strong>
                  {formatCurrency(
                    commitmentAmount
                  )}
                </strong>
              </div>

              <div>
                <span>Remaining after commitment</span>

                <strong>
                  {formatCurrency(
                    remainingAmount
                  )}
                </strong>
              </div>
            </div>

            <div className="commitment-box">
              <div>
                <strong>
                  10% commitment payment
                </strong>

                <p>
                  You must pay 10% of the total
                  procurement value before the
                  request is submitted to the
                  platform admin.
                </p>
              </div>

              <label className="commitment-check">
                <input
                  type="checkbox"
                  checked={commitment}
                  onChange={(event) => {
                    setCommitment(
                      event.target.checked
                    );
                    setError("");
                  }}
                  disabled={isSubmitting}
                />

                <span>
                  I agree to pay the 10%
                  commitment.
                </span>
              </label>
            </div>

            <div className="procurement-request-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  navigate(
                    ROUTES.MERCHANT.PROCUREMENT
                  )
                }
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                loading={isSubmitting}
                disabled={
                  !quantity ||
                  orderAmount <= 0
                }
              >
                {isSubmitting
                  ? "Processing payment..."
                  : `Pay ${formatCurrency(
                      commitmentAmount
                    )} & Submit Request`}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default MerchantProcurementRequest;