import { useEffect, useMemo, useState } from "react";

import {
  getProcurementRequests,
  cancelProcurementRequest,
} from "../../services/procurementService";

import {
  getResaleRequests,
  cancelResaleRequest,
} from "../../services/resaleService";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Spinner from "../../components/common/Spinner";

import "./MerchantOrders.css";

function getArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.items ||
    data?.requests ||
    data?.orders ||
    data?.data ||
    []
  );
}

function getId(item) {
  return (
    item?.id ||
    item?._id ||
    item?.requestId ||
    item?.orderId
  );
}

function getProductName(item) {
  return (
    item?.productName ||
    item?.name ||
    item?.product?.name ||
    "Product"
  );
}

function getStatus(item) {
  return (
    item?.status ||
    item?.orderStatus ||
    item?.requestStatus ||
    "pending"
  );
}

function getDate(item) {
  return (
    item?.createdAt ||
    item?.created_at ||
    item?.requestedAt ||
    item?.date ||
    null
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getOrderAmount(order) {
  return (
    order?.totalAmount ??
    order?.orderAmount ??
    order?.total ??
    order?.amount ??
    null
  );
}

function getCommitmentAmount(order) {
  return (
    order?.commitmentAmount ??
    order?.commitmentPaid ??
    order?.depositAmount ??
    null
  );
}

function getPaymentStatus(order) {
  return (
    order?.paymentStatus ||
    order?.commitmentStatus ||
    null
  );
}

function getStatusVariant(status) {
  const normalized = String(status)
    .toLowerCase()
    .replace(/[\_-]/g, " ");

  if (
    [
      "completed",
      "complete",
      "delivered",
      "accepted",
      "approved",
    ].includes(normalized)
  ) {
    return "success";
  }

  if (
    [
      "cancelled",
      "canceled",
      "rejected",
      "failed",
    ].includes(normalized)
  ) {
    return "danger";
  }

  if (
    [
      "preparing",
      "processing",
      "in transit",
      "shipped",
    ].includes(normalized)
  ) {
    return "info";
  }

  return "warning";
}

function MerchantOrders() {
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          procurementResponse,
          resaleResponse,
        ] = await Promise.all([
          getProcurementRequests(),
          getResaleRequests(),
        ]);

        const procurementOrders =
          getArray(procurementResponse).map(
            (item) => ({
              ...item,
              type: "procurement",
            })
          );

        const resaleOrders =
          getArray(resaleResponse).map(
            (item) => ({
              ...item,
              type: "resale",
            })
          );

        const combined = [
          ...procurementOrders,
          ...resaleOrders,
        ].sort((a, b) => {
          const first = new Date(
            getDate(a) || 0
          ).getTime();

          const second = new Date(
            getDate(b) || 0
          ).getTime();

          return second - first;
        });

        setOrders(combined);
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load your orders."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const productName = getProductName(order);
      const id = getId(order) || "";
      const status = getStatus(order);

      const matchesSearch =
        !query ||
        [
          productName,
          id,
          order?.sku,
        ].some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );

      const matchesType =
        typeFilter === "all" ||
        order.type === typeFilter;

      const normalizedStatus = String(status)
        .toLowerCase()
        .replace(/[\_-]/g, " ");

      const matchesStatus =
        statusFilter === "all" ||
        normalizedStatus === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    typeFilter,
    statusFilter,
  ]);

  const handleCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    const id = getId(cancelTarget);

    if (!id) {
      return;
    }

    setIsCancelling(true);
    setError("");

    try {
      if (
        cancelTarget.type === "procurement"
      ) {
        await cancelProcurementRequest(id);
      } else {
        await cancelResaleRequest(id);
      }

      setOrders((current) =>
        current.map((order) => {
          if (getId(order) !== id) {
            return order;
          }

          return {
            ...order,
            status: "cancelled",
          };
        })
      );

      setCancelTarget(null);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to cancel this request."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="merchant-orders-loading">
        <Spinner size="large" />

        <p>
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="merchant-orders">
      <div className="page-header">
        <div>
          <h1>Orders</h1>

          <p>
            Track procurement and resale
            requests from one place.
          </p>
        </div>
      </div>

      {error && (
        <div className="merchant-orders-error">
          {error}
        </div>
      )}

      <Card
        title="Order history"
        subtitle={`${filteredOrders.length} order${
          filteredOrders.length === 1
            ? ""
            : "s"
        }`}
        actions={
          <div className="orders-filters">
            <SearchInput
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search orders..."
            />

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
              aria-label="Filter by order type"
            >
              <option value="all">
                All types
              </option>

              <option value="procurement">
                Procurement
              </option>

              <option value="resale">
                Resale
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              aria-label="Filter by status"
            >
              <option value="all">
                All statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="accepted">
                Accepted
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="preparing">
                Preparing
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="cancelled">
                Cancelled
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>
          </div>
        }
        padding="none"
      >
        {filteredOrders.length === 0 ? (
          <EmptyState
            title={
              orders.length === 0
                ? "No orders yet"
                : "No matching orders"
            }
            message={
              orders.length === 0
                ? "Your procurement and resale requests will appear here."
                : "Try changing your search or filters."
            }
          />
        ) : (
          <div className="merchant-orders-table-wrapper">
            <table className="merchant-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Order Value</th>
                  <th>Commitment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order, index) => {
                    const id = getId(order);

                    const status =
                      getStatus(order);

                    const normalizedStatus =
                      String(status)
                        .toLowerCase()
                        .replace(
                          /[\_-]/g,
                          " "
                        );

                    const canCancel = [
                      "pending",
                      "accepted",
                      "processing",
                    ].includes(
                      normalizedStatus
                    );

                    const orderAmount =
                      getOrderAmount(order);

                    const commitmentAmount =
                      getCommitmentAmount(
                        order
                      );

                    const paymentStatus =
                      getPaymentStatus(order);

                    return (
                      <tr
                        key={
                          id ||
                          `${order.type}-${index}`
                        }
                      >
                        <td>
                          <strong>
                            {id
                              ? `#${id}`
                              : "—"}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {getProductName(
                              order
                            )}
                          </strong>

                          {order?.sku && (
                            <span className="order-sku">
                              SKU:{" "}
                              {order.sku}
                            </span>
                          )}
                        </td>

                        <td>
                          <Badge
                            size="small"
                            variant={
                              order.type ===
                              "procurement"
                                ? "info"
                                : "default"
                            }
                          >
                            {order.type ===
                            "procurement"
                              ? "Procurement"
                              : "Resale"}
                          </Badge>
                        </td>

                        <td>
                          {order?.quantity ??
                            order?.requestedQuantity ??
                            "—"}
                        </td>

                        <td>
                          {order.type ===
                            "procurement" &&
                          orderAmount !== null
                            ? formatCurrency(
                                orderAmount
                              )
                            : "—"}
                        </td>

                        <td>
                          {order.type ===
                          "procurement" ? (
                            <div>
                              <strong>
                                {commitmentAmount !==
                                null
                                  ? formatCurrency(
                                      commitmentAmount
                                    )
                                  : "—"}
                              </strong>

                              {paymentStatus && (
                                <span className="order-sku">
                                  {paymentStatus}
                                </span>
                              )}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td>
                          <Badge
                            size="small"
                            variant={getStatusVariant(
                              status
                            )}
                          >
                            {status}
                          </Badge>
                        </td>

                        <td>
                          {formatDate(
                            getDate(order)
                          )}
                        </td>

                        <td>
                          {canCancel ? (
                            <Button
                              size="small"
                              variant="danger"
                              onClick={() =>
                                setCancelTarget(
                                  order
                                )
                              }
                            >
                              Cancel
                            </Button>
                          ) : (
                            <span className="order-no-action">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        title="Cancel this request?"
        message="This request will be cancelled and cannot continue through the current order flow."
        confirmText="Cancel request"
        cancelText="Keep request"
        onConfirm={handleCancel}
        onCancel={() =>
          isCancelling
            ? null
            : setCancelTarget(null)
        }
        isLoading={isCancelling}
      />
    </div>
  );
}

export default MerchantOrders;