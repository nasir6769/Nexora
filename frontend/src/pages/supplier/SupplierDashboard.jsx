import { useEffect, useMemo, useState } from "react";

import {
  getSupplierProducts,
  getSupplierOrders,
} from "../../services/supplierService";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";

import { ROUTES } from "../../routes/routeConfig";
import { Link } from "react-router-dom";

import "./SupplierDashboard.css";

function getArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.items ||
    data?.products ||
    data?.orders ||
    data?.data ||
    []
  );
}

function getId(item) {
  return (
    item?.id ||
    item?._id ||
    item?.orderId ||
    item?.productId
  );
}

function getStatus(item) {
  return (
    item?.status ||
    item?.orderStatus ||
    "pending"
  );
}

function getStatusVariant(status) {
  const normalized = String(status)
    .toLowerCase()
    .replace(/[_-]/g, " ");

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
      "rejected",
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

function SupplierDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          productsResponse,
          ordersResponse,
        ] = await Promise.all([
          getSupplierProducts(),
          getSupplierOrders(),
        ]);

        setProducts(
          getArray(productsResponse)
        );

        setOrders(
          getArray(ordersResponse)
        );
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load supplier dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const pendingOrders = orders.filter(
      (order) => {
        const status = String(
          getStatus(order)
        )
          .toLowerCase()
          .replace(/[_-]/g, " ");

        return [
          "pending",
          "processing",
        ].includes(status);
      }
    );

    const lowStockProducts =
      products.filter((product) => {
        const stock =
          Number(
            product?.stock ??
              product?.quantity ??
              0
          );

        const threshold =
          Number(
            product?.lowStockThreshold ??
              product?.reorderLevel ??
              10
          );

        return stock <= threshold;
      });

    return {
      products: products.length,
      orders: orders.length,
      pendingOrders:
        pendingOrders.length,
      lowStock:
        lowStockProducts.length,
    };
  }, [products, orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const first =
          new Date(
            a?.createdAt ||
              a?.created_at ||
              a?.date ||
              0
          ).getTime();

        const second =
          new Date(
            b?.createdAt ||
              b?.created_at ||
              b?.date ||
              0
          ).getTime();

        return second - first;
      })
      .slice(0, 5);
  }, [orders]);

  if (isLoading) {
    return (
      <div className="supplier-dashboard-loading">
        <Spinner size="large" />
        <p>
          Loading supplier dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="supplier-dashboard">
      <div className="page-header">
        <div>
          <h1>Supplier Dashboard</h1>

          <p>
  Manage your products and fulfil
  platform orders.
</p>
        </div>

        <div className="supplier-dashboard-actions">
          <Link
            to={ROUTES.SUPPLIER.PRODUCTS}
          >
            <Button>
              Manage products
            </Button>
          </Link>

          <Link
            to={ROUTES.SUPPLIER.ORDERS}
          >
            <Button variant="secondary">
              View orders
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="supplier-dashboard-error">
          {error}
        </div>
      )}

      <div className="supplier-stats-grid">
        <Card>
          <div className="supplier-stat">
            <span className="supplier-stat-label">
              Products
            </span>

            <strong>
              {stats.products}
            </strong>

            <span className="supplier-stat-meta">
              Listed products
            </span>
          </div>
        </Card>

        <Card>
          <div className="supplier-stat">
            <span className="supplier-stat-label">
              Orders
            </span>

            <strong>
              {stats.orders}
            </strong>

            <span className="supplier-stat-meta">
              Total platform orders
            </span>
          </div>
        </Card>

        <Card>
          <div className="supplier-stat">
            <span className="supplier-stat-label">
              Pending
            </span>

            <strong>
              {stats.pendingOrders}
            </strong>

            <span className="supplier-stat-meta">
              Need attention
            </span>
          </div>
        </Card>

        <Card>
          <div className="supplier-stat">
            <span className="supplier-stat-label">
              Low stock
            </span>

            <strong>
              {stats.lowStock}
            </strong>

            <span className="supplier-stat-meta">
              Products to replenish
            </span>
          </div>
        </Card>
      </div>

      <Card
        title="Recent orders"
        subtitle="Latest platform orders assigned to your business."
        actions={
          <Link
            to={ROUTES.SUPPLIER.ORDERS}
          >
            <Button
              variant="ghost"
              size="small"
            >
              View all
            </Button>
          </Link>
        }
        padding="none"
      >
        {recentOrders.length === 0 ? (
          <div className="supplier-empty">
            <strong>
              No orders yet
            </strong>

            <p>
  New platform orders will appear
  here.
</p>
          </div>
        ) : (
          <div className="supplier-orders-table-wrapper">
            <table className="supplier-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map(
                  (order, index) => {
                    const id = getId(order);

                    const productName =
                      order?.productName ||
                      order?.name ||
                      order?.product?.name ||
                      "Product";

                    const quantity =
                      order?.quantity ??
                      order?.requestedQuantity ??
                      "—";

                    const status =
                      getStatus(order);

                    return (
                      <tr
                        key={
                          id ||
                          `order-${index}`
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
                          {productName}
                        </td>

                        <td>
                          {quantity}
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

export default SupplierDashboard;