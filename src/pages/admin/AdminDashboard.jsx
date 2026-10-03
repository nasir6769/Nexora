import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getAdminDashboard,
  getAdminOrders,
  getAdminSuppliers,
} from "../../services/adminService";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";

import { ROUTES } from "../../routes/routeConfig";

import "./AdminDashboard.css";

function getArray(data) {
  if (Array.isArray(data)) return data;

  return (
    data?.items ||
    data?.data ||
    data?.orders ||
    data?.suppliers ||
    []
  );
}

function getStatus(item) {
  return String(
    item?.status ||
      item?.orderStatus ||
      "pending"
  ).toLowerCase();
}

function getStatusVariant(status) {
  const normalized = status.replace(
    /[_-]/g,
    " "
  );

  if (
    [
      "completed",
      "delivered",
      "accepted",
      "approved",
      "active",
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
      "inactive",
    ].includes(normalized)
  ) {
    return "danger";
  }

  if (
    [
      "processing",
      "preparing",
      "shipped",
      "in transit",
    ].includes(normalized)
  ) {
    return "info";
  }

  return "warning";
}

function formatDate(value) {
  if (!value) return "—";

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

  if (Number.isNaN(amount)) return "—";

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function AdminDashboard() {
  const [dashboard, setDashboard] =
    useState(null);

  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          dashboardResponse,
          ordersResponse,
          suppliersResponse,
        ] = await Promise.all([
          getAdminDashboard(),
          getAdminOrders(),
          getAdminSuppliers(),
        ]);

        setDashboard(
          dashboardResponse?.data ||
            dashboardResponse ||
            {}
        );

        setOrders(
          getArray(ordersResponse)
        );

        setSuppliers(
          getArray(suppliersResponse)
        );
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load admin dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const dashboardData =
      dashboard || {};

    const totalOrders =
      dashboardData?.totalOrders ??
      dashboardData?.ordersCount ??
      orders.length;

    const totalSuppliers =
      dashboardData?.totalSuppliers ??
      dashboardData?.suppliersCount ??
      suppliers.length;

    const pendingOrders =
      dashboardData?.pendingOrders ??
      orders.filter(
        (order) =>
          [
            "pending",
            "processing",
            "preparing",
          ].includes(getStatus(order))
      ).length;

    const activeSuppliers =
      dashboardData?.activeSuppliers ??
      suppliers.filter(
        (supplier) =>
          ![
            "inactive",
            "suspended",
            "rejected",
          ].includes(
            getStatus(supplier)
          )
      ).length;

    const revenue =
      dashboardData?.totalRevenue ??
      dashboardData?.revenue ??
      orders.reduce(
        (total, order) =>
          total +
          Number(
            order?.totalAmount ??
              order?.total ??
              order?.amount ??
              0
          ),
        0
      );

    return {
      totalOrders,
      totalSuppliers,
      pendingOrders,
      activeSuppliers,
      revenue,
    };
  }, [
    dashboard,
    orders,
    suppliers,
  ]);

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
      <div className="admin-dashboard-loading">
        <Spinner size="large" />
        <p>
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Monitor platform activity,
            suppliers, orders and logistics.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() =>
            window.location.reload()
          }
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="admin-dashboard-error">
          {error}
        </div>
      )}

      <div className="admin-stats-grid">
        <Card>
          <div className="admin-stat">
            <span className="admin-stat-label">
              Total orders
            </span>

            <strong>
              {stats.totalOrders}
            </strong>

            <span className="admin-stat-meta">
              Platform orders
            </span>
          </div>
        </Card>

        <Card>
          <div className="admin-stat">
            <span className="admin-stat-label">
              Pending orders
            </span>

            <strong>
              {stats.pendingOrders}
            </strong>

            <span className="admin-stat-meta">
              Require attention
            </span>
          </div>
        </Card>

        <Card>
          <div className="admin-stat">
            <span className="admin-stat-label">
              Suppliers
            </span>

            <strong>
              {stats.totalSuppliers}
            </strong>

            <span className="admin-stat-meta">
              Registered suppliers
            </span>
          </div>
        </Card>

        <Card>
          <div className="admin-stat">
            <span className="admin-stat-label">
              Active suppliers
            </span>

            <strong>
              {stats.activeSuppliers}
            </strong>

            <span className="admin-stat-meta">
              Currently active
            </span>
          </div>
        </Card>

        <Card>
          <div className="admin-stat">
            <span className="admin-stat-label">
              Total order value
            </span>

            <strong>
              {formatCurrency(
                stats.revenue
              )}
            </strong>

            <span className="admin-stat-meta">
              Total value of platform orders
            </span>
          </div>
        </Card>
      </div>

      <div className="admin-dashboard-grid">
        <Card
          title="Recent orders"
          subtitle="Latest activity across the platform."
          actions={
            <Link
              to={ROUTES.ADMIN.ORDERS}
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
            <div className="admin-empty">
              <strong>
                No orders yet
              </strong>

              <p>
                Platform orders will appear
                here.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Value</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map(
                    (order, index) => {
                      const id =
                        order?.id ||
                        order?._id ||
                        order?.orderId;

                      const product =
                        order?.productName ||
                        order?.product?.name ||
                        order?.name ||
                        "—";

                      const status =
                        getStatus(order);

                      const value =
                        order?.totalAmount ??
                        order?.total ??
                        order?.amount ??
                        0;

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
                            {product}
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
                            {formatCurrency(
                              value
                            )}
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

        <Card
          title="Quick actions"
          subtitle="Manage the platform."
        >
          <div className="admin-quick-actions">
            <Link
              to={ROUTES.ADMIN.PROCUREMENT}
            >
              <Button fullWidth>
                Procurement
              </Button>
            </Link>

            <Link
              to={ROUTES.ADMIN.SUPPLIERS}
            >
              <Button
                fullWidth
                variant="secondary"
              >
                Manage suppliers
              </Button>
            </Link>

            <Link
              to={ROUTES.ADMIN.ORDERS}
            >
              <Button
                fullWidth
                variant="secondary"
              >
                Manage orders
              </Button>
            </Link>

            <Link
              to={ROUTES.ADMIN.LOGISTICS}
            >
              <Button
                fullWidth
                variant="secondary"
              >
                Logistics
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;