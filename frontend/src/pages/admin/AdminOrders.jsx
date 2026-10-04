import { useEffect, useMemo, useState } from "react";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import Select from "../../components/common/Select";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";

import { getAdminOrders } from "../../services/adminService";

import "./AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminOrders();

        const data = Array.isArray(response)
          ? response
          : response?.orders || response?.data || [];

        setOrders(data);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getValue = (order, keys, fallback = "—") => {
    for (const key of keys) {
      if (
        order?.[key] !== undefined &&
        order?.[key] !== null &&
        order?.[key] !== ""
      ) {
        return order[key];
      }
    }

    return fallback;
  };

  const getOrderId = (order, index) =>
    getValue(order, ["id", "orderId", "_id"], `ORD-${index + 1}`);

  const getMerchantName = (order) =>
    getValue(
      order,
      ["merchantName", "merchant", "customerName", "userName"],
      "Unknown"
    );

  const getSupplierName = (order) =>
    getValue(order, ["supplierName", "supplier"], "Not assigned");

  const getProductName = (order) =>
    getValue(order, ["productName", "product", "itemName"], "Unknown product");

  const getQuantity = (order) =>
    getValue(order, ["quantity", "orderQuantity"], 0);

  const getTotal = (order) =>
    getValue(
      order,
      ["totalAmount", "orderAmount", "total", "amount", "value"],
      0
    );

  const getCommitmentAmount = (order) =>
    getValue(
      order,
      ["commitmentAmount", "commitmentPaid", "depositAmount"],
      null
    );

  const getCommitmentPercentage = (order) =>
    getValue(
      order,
      ["commitmentPercentage", "depositPercentage"],
      10
    );

  const getPaymentStatus = (order) =>
    String(
      getValue(
        order,
        ["paymentStatus", "commitmentStatus"],
        "paid"
      )
    ).toLowerCase();

  const getStatus = (order) =>
    String(
      getValue(order, ["status", "orderStatus"], "pending")
    ).toLowerCase();

  const formatCurrency = (value) => {
    const amount = Number(value);

    if (Number.isNaN(amount)) return "—";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRemainingAmount = (order) => {
    const total = Number(getTotal(order)) || 0;
    const commitment = Number(getCommitmentAmount(order));

    if (!Number.isNaN(commitment)) {
      return Math.max(total - commitment, 0);
    }

    const percentage = Number(getCommitmentPercentage(order)) || 10;

    return Math.max(
      total - (total * percentage) / 100,
      0
    );
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId = String(getOrderId(order)).toLowerCase();
      const merchant = String(getMerchantName(order)).toLowerCase();
      const supplier = String(getSupplierName(order)).toLowerCase();
      const product = String(getProductName(order)).toLowerCase();
      const orderStatus = getStatus(order);

      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        merchant.includes(query) ||
        supplier.includes(query) ||
        product.includes(query);

      const matchesStatus =
        status === "all" || orderStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "preparing", label: "Preparing" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getBadgeVariant = (orderStatus) => {
    if (orderStatus === "completed") return "success";

    if (
      orderStatus === "accepted" ||
      orderStatus === "preparing"
    ) {
      return "info";
    }

    if (orderStatus === "pending") return "warning";

    if (
      orderStatus === "rejected" ||
      orderStatus === "cancelled"
    ) {
      return "danger";
    }

    return "secondary";
  };

  const getPaymentBadgeVariant = (paymentStatus) => {
    if (paymentStatus === "paid" || paymentStatus === "completed") {
      return "success";
    }

    if (
      paymentStatus === "pending" ||
      paymentStatus === "processing"
    ) {
      return "warning";
    }

    if (
      paymentStatus === "failed" ||
      paymentStatus === "cancelled"
    ) {
      return "danger";
    }

    return "secondary";
  };

  return (
    <div className="admin-orders">
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>Monitor orders across merchants and suppliers.</p>
        </div>
      </div>

      {error && <div className="admin-orders-error">{error}</div>}

      <Card>
        <div className="admin-orders-toolbar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search orders, merchants, suppliers..."
          />

          <Select
            value={status}
            onChange={setStatus}
            options={statusOptions}
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="admin-orders-loading">
            <Spinner />
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            message={
              search || status !== "all"
                ? "Try changing your search or filters."
                : "There are no orders available yet."
            }
          />
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Merchant</th>
                  <th>Supplier</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Order Value</th>
                  <th>10% Commitment</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order, index) => {
                  const orderStatus = getStatus(order);
                  const total = Number(getTotal(order)) || 0;
                  const commitment = Number(
                    getCommitmentAmount(order)
                  );

                  const commitmentPercentage = Number(
                    getCommitmentPercentage(order)
                  ) || 10;

                  const commitmentValue = Number.isNaN(commitment)
                    ? (total * commitmentPercentage) / 100
                    : commitment;

                  const remainingAmount = getRemainingAmount(order);
                  const paymentStatus = getPaymentStatus(order);

                  return (
                    <tr key={getOrderId(order, index)}>
                      <td>
                        <strong>
                          {getOrderId(order, index)}
                        </strong>
                      </td>

                      <td>{getMerchantName(order)}</td>

                      <td>{getSupplierName(order)}</td>

                      <td>
                        <div className="admin-order-product">
                          <strong>{getProductName(order)}</strong>
                        </div>
                      </td>

                      <td>{getQuantity(order)}</td>

                      <td>
                        {formatCurrency(total)}
                      </td>

                      <td>
                        <div>
                          <strong>
                            {formatCurrency(commitmentValue)}
                          </strong>

                          <div>
                            <small>
                              {commitmentPercentage}% ·{" "}
                            </small>

                            <Badge
                              variant={getPaymentBadgeVariant(
                                paymentStatus
                              )}
                            >
                              {paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      <td>
                        {formatCurrency(remainingAmount)}
                      </td>

                      <td>
                        <Badge
                          variant={getBadgeVariant(orderStatus)}
                        >
                          {orderStatus}
                        </Badge>
                      </td>

                      <td>
                        {formatDate(
                          getValue(order, [
                            "createdAt",
                            "orderDate",
                            "date",
                          ])
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminOrders;