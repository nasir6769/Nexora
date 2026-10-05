import { useEffect, useMemo, useState } from "react";

import {
  getSupplierOrders,
  updateSupplierOrderStatus,
} from "../../services/supplierService";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import Select from "../../components/common/Select";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";

import "./SupplierOrders.css";

function getArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.items ||
    data?.orders ||
    data?.data ||
    []
  );
}

function getId(order) {
  return (
    order?.id ||
    order?._id ||
    order?.orderId
  );
}

function getStatus(order) {
  return String(
    order?.status ||
      order?.orderStatus ||
      "pending"
  ).toLowerCase();
}

function getStatusVariant(status) {
  const normalized = status.replace(/[\_-]/g, " ");

  if (
    [
      "completed",
      "delivered",
      "approved",
      "accepted",
      "supplier accepted",
    ].includes(normalized)
  ) {
    return "success";
  }

  if (
    [
      "rejected",
      "supplier rejected",
      "cancelled",
      "canceled",
      "failed",
    ].includes(normalized)
  ) {
    return "danger";
  }

  if (
    [
      "preparing",
      "processing",
      "shipped",
      "in transit",
    ].includes(normalized)
  ) {
    return "info";
  }

  return "warning";
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

  if (Number.isNaN(amount)) {
    return "—";
  }

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] =
    useState(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response =
        await getSupplierOrders();

      setOrders(getArray(response));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to load supplier orders."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const status = getStatus(order);

      if (
        statusFilter !== "all" &&
        status !== statusFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        getId(order),
        order?.productName,
        order?.product?.name,
        order?.sku,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [orders, search, statusFilter]);

  const handleStatusUpdate = async (
    order,
    status
  ) => {
    const orderId = getId(order);

    if (!orderId) {
      return;
    }

    setUpdatingId(orderId);
    setError("");

    try {
      await updateSupplierOrderStatus(
        orderId,
        status
      );

      setOrders((current) =>
        current.map((item) =>
          getId(item) === orderId
            ? {
                ...item,
                status,
                orderStatus: status,
              }
            : item
        )
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="supplier-orders">
      <div className="page-header">
        <div>
          <h1>Orders</h1>

          <p>
            Review and process platform
            orders assigned to you.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={loadOrders}
          loading={isLoading}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="supplier-orders-error">
          {error}
        </div>
      )}

      <Card padding="medium">
        <div className="supplier-orders-toolbar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search orders or products..."
          />

          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            options={[
              {
                value: "all",
                label: "All statuses",
              },
              {
                value: "pending",
                label: "Pending",
              },
              {
                value: "accepted",
                label: "Accepted",
              },
              {
                value: "preparing",
                label: "Preparing",
              },
              {
                value: "completed",
                label: "Completed",
              },
              {
                value: "rejected",
                label: "Rejected",
              },
              {
                value: "cancelled",
                label: "Cancelled",
              },
            ]}
          />
        </div>
      </Card>

      <Card padding="none">
        {isLoading ? (
          <div className="supplier-orders-loading">
            <Spinner size="large" />

            <p>
              Loading orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title={
              search ||
              statusFilter !== "all"
                ? "No matching orders"
                : "No orders yet"
            }
            description={
              search ||
              statusFilter !== "all"
                ? "Try changing your filters."
                : "Platform orders assigned to you will appear here."
            }
          />
        ) : (
          <div className="supplier-orders-table-wrapper">
            <table className="supplier-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order, index) => {
                    const orderId =
                      getId(order);

                    const status =
                      getStatus(order);

                    const productName =
                      order?.productName ||
                      order?.product?.name ||
                      order?.name ||
                      "—";

                    const quantity =
                      order?.quantity ??
                      order?.requestedQuantity ??
                      "—";

                    const total =
                      order?.totalAmount ??
                      order?.total ??
                      order?.amount ??
                      (
                        Number(
                          order?.price ??
                            order?.unitPrice ??
                            0
                        ) *
                        Number(quantity || 0)
                      );

                    return (
                      <tr
                        key={
                          orderId ||
                          `order-${index}`
                        }
                      >
                        <td>
                          <strong>
                            {orderId
                              ? `#${orderId}`
                              : "—"}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {productName}
                          </strong>

                          {order?.sku && (
                            <span className="order-sku">
                              SKU:{" "}
                              {order.sku}
                            </span>
                          )}
                        </td>

                        <td>
                          {quantity}
                        </td>

                        <td>
                          {formatCurrency(
                            total
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
                            order?.createdAt ||
                              order?.created_at ||
                              order?.date
                          )}
                        </td>

                        <td>
                          <div className="supplier-order-actions">
                            {[
                              "pending",
                              "requested",
                              "waiting_for_supplier",
                              "supplier_selected",
                            ].includes(status) && (
                              <>
                                <Button
                                  size="small"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      order,
                                      "accepted"
                                    )
                                  }
                                  loading={
                                    updatingId ===
                                    orderId
                                  }
                                >
                                  Accept
                                </Button>

                                <Button
                                  size="small"
                                  variant="danger"
                                  disabled={
                                    updatingId !==
                                    null
                                  }
                                  onClick={() =>
                                    handleStatusUpdate(
                                      order,
                                      "rejected"
                                    )
                                  }
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {[
                              "accepted",
                              "supplier_accepted",
                            ].includes(status) && (
                              <Button
                                size="small"
                                onClick={() =>
                                  handleStatusUpdate(
                                    order,
                                    "preparing"
                                  )
                                }
                                loading={
                                  updatingId ===
                                  orderId
                                }
                              >
                                Prepare
                              </Button>
                            )}

                            {status ===
                              "preparing" && (
                              <Button
                                size="small"
                                onClick={() =>
                                  handleStatusUpdate(
                                    order,
                                    "completed"
                                  )
                                }
                                loading={
                                  updatingId ===
                                  orderId
                                }
                              >
                                Complete
                              </Button>
                            )}

                            {[
                              "completed",
                              "rejected",
                              "supplier_rejected",
                              "cancelled",
                              "canceled",
                            ].includes(
                              status
                            ) && (
                              <span className="supplier-order-action-muted">
                                No action
                              </span>
                            )}
                          </div>
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
    </div>
  );
}

export default SupplierOrders;