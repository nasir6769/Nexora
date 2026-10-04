import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getInventory } from "../../services/inventoryService";
import {
  getProcurementRequests,
} from "../../services/procurementService";
import {
  getResaleRequests,
} from "../../services/resaleService";
import { ROUTES } from "../../routes/routeConfig";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";

import "./MerchantDashboard.css";

function getArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.items ||
    data?.products ||
    data?.inventory ||
    data?.requests ||
    data?.data ||
    []
  );
}

function getStatusVariant(status) {
  const normalized = String(status || "")
    .toLowerCase();

  if (
    ["completed", "approved", "accepted", "delivered"]
      .includes(normalized)
  ) {
    return "success";
  }

  if (
    ["pending", "processing", "preparing"]
      .includes(normalized)
  ) {
    return "warning";
  }

  if (
    ["rejected", "cancelled", "failed"]
      .includes(normalized)
  ) {
    return "danger";
  }

  return "default";
}

function MerchantDashboard() {
  const [inventory, setInventory] = useState([]);
  const [procurementRequests, setProcurementRequests] =
    useState([]);
  const [resaleRequests, setResaleRequests] =
    useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          inventoryResponse,
          procurementResponse,
          resaleResponse,
        ] = await Promise.all([
          getInventory(),
          getProcurementRequests(),
          getResaleRequests(),
        ]);

        setInventory(getArray(inventoryResponse));
        setProcurementRequests(
          getArray(procurementResponse)
        );
        setResaleRequests(
          getArray(resaleResponse)
        );
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const lowStock = inventory.filter((item) => {
      const stock = Number(
        item?.stock ??
          item?.quantity ??
          item?.currentStock ??
          0
      );

      const threshold = Number(
        item?.lowStockThreshold ??
          item?.reorderLevel ??
          10
      );

      return stock <= threshold;
    });

    const pendingProcurement =
      procurementRequests.filter((request) =>
        ["pending", "processing"]
          .includes(
            String(request?.status || "")
              .toLowerCase()
          )
      );

    const pendingResale =
      resaleRequests.filter((request) =>
        ["pending", "processing"]
          .includes(
            String(request?.status || "")
              .toLowerCase()
          )
      );

    return {
      totalProducts: inventory.length,
      lowStock: lowStock.length,
      procurement:
        pendingProcurement.length,
      resale:
        pendingResale.length,
    };
  }, [
    inventory,
    procurementRequests,
    resaleRequests,
  ]);

  const recentActivity = useMemo(() => {
    const procurement = procurementRequests.map(
      (request) => ({
        ...request,
        activityType: "Procurement",
        activityDate:
          request?.createdAt ||
          request?.updatedAt ||
          request?.date,
      })
    );

    const resale = resaleRequests.map(
      (request) => ({
        ...request,
        activityType: "Resale",
        activityDate:
          request?.createdAt ||
          request?.updatedAt ||
          request?.date,
      })
    );

    return [...procurement, ...resale]
      .sort(
        (a, b) =>
          new Date(b.activityDate || 0) -
          new Date(a.activityDate || 0)
      )
      .slice(0, 6);
  }, [
    procurementRequests,
    resaleRequests,
  ]);

  if (isLoading) {
    return (
      <div className="merchant-dashboard-loading">
        <Spinner size="large" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="merchant-dashboard">
      <div className="page-header">
        <div>
          <h1>Merchant Dashboard</h1>
          <p>
            Overview of your inventory, procurement,
            and resale activity.
          </p>
        </div>

        <div className="page-header-actions">
          <Link
            to={ROUTES.MERCHANT.ADD_INVENTORY}
          >
            <Button>
              Add inventory
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <div className="merchant-stat-grid">
        <Card padding="medium">
          <div className="merchant-stat">
            <span>Total products</span>
            <strong>
              {stats.totalProducts}
            </strong>
          </div>
        </Card>

        <Card padding="medium">
          <div className="merchant-stat">
            <span>Low stock</span>
            <strong>
              {stats.lowStock}
            </strong>
          </div>
        </Card>

        <Card padding="medium">
          <div className="merchant-stat">
            <span>Procurement pending</span>
            <strong>
              {stats.procurement}
            </strong>
          </div>
        </Card>

        <Card padding="medium">
          <div className="merchant-stat">
            <span>Resale pending</span>
            <strong>
              {stats.resale}
            </strong>
          </div>
        </Card>
      </div>

      <div className="merchant-dashboard-grid">
        <Card
          title="Recent activity"
          subtitle="Your latest procurement and resale requests."
          actions={
            <Link
              to={ROUTES.MERCHANT.ORDERS}
            >
              View orders
            </Link>
          }
        >
          {recentActivity.length === 0 ? (
            <div className="dashboard-empty">
              <p>No recent activity.</p>

              <Link
                to={ROUTES.MERCHANT.PROCUREMENT}
              >
                Explore procurement
              </Link>
            </div>
          ) : (
            <div className="activity-list">
              {recentActivity.map(
                (item, index) => {
                  const status =
                    item?.status ||
                    "pending";

                  const name =
                    item?.productName ||
                    item?.product?.name ||
                    item?.name ||
                    "Product request";

                  return (
                    <div
                      className="activity-item"
                      key={
                        item?.id ||
                        item?._id ||
                        `${item.activityType}-${index}`
                      }
                    >
                      <div>
                        <strong>
                          {name}
                        </strong>

                        <span>
                          {item.activityType}
                        </span>
                      </div>

                      <Badge
                        variant={getStatusVariant(
                          status
                        )}
                        size="small"
                      >
                        {status}
                      </Badge>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </Card>

        <Card
          title="Quick actions"
          subtitle="Common tasks for your workspace."
        >
          <div className="quick-actions">
            <Link
              to={ROUTES.MERCHANT.PROCUREMENT}
              className="quick-action"
            >
              <strong>
                Find products
              </strong>

              <span>
                Browse supplier products and
                procurement opportunities.
              </span>
            </Link>

            <Link
              to={ROUTES.MERCHANT.RESALE}
              className="quick-action"
            >
              <strong>
                Browse resale
              </strong>

              <span>
                Find excess inventory from
                other merchants.
              </span>
            </Link>

            <Link
              to={ROUTES.MERCHANT.CREATE_RESALE}
              className="quick-action"
            >
              <strong>
                List excess stock
              </strong>

              <span>
                Turn slow-moving inventory into
                a resale listing.
              </span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MerchantDashboard;