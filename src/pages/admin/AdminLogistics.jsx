import { useEffect, useMemo, useState } from "react";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import Select from "../../components/common/Select";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";

import { getAdminLogistics } from "../../services/adminService";

import "./AdminLogistics.css";

function AdminLogistics() {
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLogistics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminLogistics();

        const data = Array.isArray(response)
          ? response
          : response?.shipments ||
            response?.logistics ||
            response?.data ||
            [];

        setShipments(data);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load logistics data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLogistics();
  }, []);

  const getValue = (item, keys, fallback = "—") => {
    for (const key of keys) {
      if (
        item?.[key] !== undefined &&
        item?.[key] !== null &&
        item?.[key] !== ""
      ) {
        return item[key];
      }
    }

    return fallback;
  };

  const getShipmentId = (item, index) =>
    getValue(
      item,
      ["shipmentId", "trackingId", "id", "_id"],
      `SHIP-${index + 1}`
    );

  const getOrderId = (item) =>
    getValue(item, ["orderId", "order", "orderNumber"]);

  const getMerchant = (item) =>
    getValue(
      item,
      ["merchantName", "merchant", "customerName"],
      "Unknown"
    );

  const getSupplier = (item) =>
    getValue(
      item,
      ["supplierName", "supplier"],
      "Not assigned"
    );

  const getCarrier = (item) =>
    getValue(
      item,
      ["carrier", "logisticsProvider", "deliveryPartner"],
      "—"
    );

  const getTracking = (item) =>
    getValue(
      item,
      ["trackingNumber", "trackingId", "shipmentId"],
      "—"
    );

  const getCurrentLocation = (item) =>
    getValue(
      item,
      ["currentLocation", "location"],
      "—"
    );

  const getDestination = (item) =>
    getValue(
      item,
      ["destination", "deliveryAddress"],
      "—"
    );

  const getStatus = (item) =>
    String(
      getValue(
        item,
        ["status", "shipmentStatus", "deliveryStatus"],
        "pending"
      )
    ).toLowerCase();

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

  const filteredShipments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return shipments.filter((item) => {
      const shipmentId = String(getShipmentId(item)).toLowerCase();
      const orderId = String(getOrderId(item)).toLowerCase();
      const merchant = String(getMerchant(item)).toLowerCase();
      const supplier = String(getSupplier(item)).toLowerCase();
      const carrier = String(getCarrier(item)).toLowerCase();
      const tracking = String(getTracking(item)).toLowerCase();
      const currentLocation = String(
        getCurrentLocation(item)
      ).toLowerCase();
      const destination = String(
        getDestination(item)
      ).toLowerCase();

      const shipmentStatus = getStatus(item);

      const matchesSearch =
        !query ||
        shipmentId.includes(query) ||
        orderId.includes(query) ||
        merchant.includes(query) ||
        supplier.includes(query) ||
        carrier.includes(query) ||
        tracking.includes(query) ||
        currentLocation.includes(query) ||
        destination.includes(query);

      const matchesStatus =
        status === "all" || shipmentStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [shipments, search, status]);

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "assigned", label: "Assigned" },
    { value: "picked_up", label: "Picked up" },
    { value: "in_transit", label: "In transit" },
    { value: "out_for_delivery", label: "Out for delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getBadgeVariant = (shipmentStatus) => {
    if (shipmentStatus === "delivered") return "success";

    if (
      shipmentStatus === "assigned" ||
      shipmentStatus === "picked_up" ||
      shipmentStatus === "in_transit" ||
      shipmentStatus === "out_for_delivery"
    ) {
      return "info";
    }

    if (shipmentStatus === "pending") return "warning";

    if (shipmentStatus === "cancelled") return "danger";

    return "secondary";
  };

  return (
    <div className="admin-logistics">
      <div className="page-header">
        <div>
          <h1>Logistics</h1>
          <p>
            Track shipments and delivery progress across the platform.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-logistics-error">
          {error}
        </div>
      )}

      <Card>
        <div className="admin-logistics-toolbar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search shipment, order, merchant, supplier..."
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
          <div className="admin-logistics-loading">
            <Spinner />
            <p>Loading logistics...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <EmptyState
            title="No shipments found"
            message={
              search || status !== "all"
                ? "Try changing your search or filters."
                : "There are no shipments available yet."
            }
          />
        ) : (
          <div className="admin-logistics-table-wrapper">
            <table className="admin-logistics-table">
              <thead>
                <tr>
                  <th>Shipment</th>
                  <th>Order</th>
                  <th>Merchant</th>
                  <th>Supplier</th>
                  <th>Carrier</th>
                  <th>Tracking</th>
                  <th>Current Location</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>

              <tbody>
                {filteredShipments.map((item, index) => {
                  const shipmentStatus = getStatus(item);

                  return (
                    <tr
                      key={getShipmentId(item, index)}
                    >
                      <td>
                        <strong>
                          {getShipmentId(item, index)}
                        </strong>
                      </td>

                      <td>{getOrderId(item)}</td>

                      <td>{getMerchant(item)}</td>

                      <td>{getSupplier(item)}</td>

                      <td>{getCarrier(item)}</td>

                      <td>{getTracking(item)}</td>

                      <td>
                        <div className="admin-logistics-location">
                          {getCurrentLocation(item)}
                        </div>
                      </td>

                      <td>
                        <div className="admin-logistics-location">
                          {getDestination(item)}
                        </div>
                      </td>

                      <td>
                        <Badge
                          variant={getBadgeVariant(
                            shipmentStatus
                          )}
                        >
                          {shipmentStatus.replaceAll(
                            "_",
                            " "
                          )}
                        </Badge>
                      </td>

                      <td>
                        {formatDate(
                          getValue(item, [
                            "updatedAt",
                            "lastUpdated",
                            "updatedDate",
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

export default AdminLogistics;