import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import Select from "../../components/common/Select";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";

import { getAdminSuppliers } from "../../services/adminService";
import { ROUTES } from "../../routes/routeConfig";

import "./AdminSuppliers.css";

function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminSuppliers();

        const data = Array.isArray(response)
          ? response
          : response?.suppliers || response?.data || [];

        setSuppliers(data);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load suppliers."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  const getValue = (supplier, keys, fallback = "—") => {
    for (const key of keys) {
      if (
        supplier?.[key] !== undefined &&
        supplier?.[key] !== null &&
        supplier?.[key] !== ""
      ) {
        return supplier[key];
      }
    }

    return fallback;
  };

  const getSupplierName = (supplier) =>
    getValue(
      supplier,
      ["name", "supplierName", "businessName", "companyName"],
      "Unknown Supplier"
    );

  const getSupplierEmail = (supplier) =>
    getValue(supplier, ["email", "supplierEmail"]);

  const getSupplierPhone = (supplier) =>
    getValue(supplier, ["phone", "phoneNumber", "contact"]);

  const getProductCount = (supplier) =>
    getValue(
      supplier,
      ["productCount", "productsCount", "totalProducts"],
      0
    );

  const getOrderCount = (supplier) =>
    getValue(
      supplier,
      ["orderCount", "ordersCount", "totalOrders"],
      0
    );

  const getStatus = (supplier) => {
    const value = getValue(
      supplier,
      ["status", "supplierStatus", "accountStatus"],
      "active"
    );

    return String(value).toLowerCase();
  };

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const name = String(getSupplierName(supplier)).toLowerCase();
      const email = String(getSupplierEmail(supplier)).toLowerCase();
      const phone = String(getSupplierPhone(supplier)).toLowerCase();
      const supplierStatus = getStatus(supplier);

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query);

      const matchesStatus =
        status === "all" || supplierStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, status]);

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ];

  const getBadgeVariant = (supplierStatus) => {
    if (supplierStatus === "active") return "success";
    if (supplierStatus === "pending") return "warning";
    if (supplierStatus === "inactive") return "danger";
    return "secondary";
  };

  return (
    <div className="admin-suppliers">
      <div className="page-header">
        <div>
          <h1>Suppliers</h1>
          <p>Manage and monitor suppliers registered on the platform.</p>
        </div>

        <Link
          to={ROUTES.ADMIN.DASHBOARD}
          className="admin-suppliers-back"
        >
          ← Dashboard
        </Link>
      </div>

      {error && <div className="admin-suppliers-error">{error}</div>}

      <Card>
        <div className="admin-suppliers-toolbar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search suppliers..."
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
          <div className="admin-suppliers-loading">
            <Spinner />
            <p>Loading suppliers...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <EmptyState
            title="No suppliers found"
            message={
              search || status !== "all"
                ? "Try changing your search or filters."
                : "There are no suppliers available yet."
            }
          />
        ) : (
          <div className="admin-suppliers-table-wrapper">
            <table className="admin-suppliers-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Products</th>
                  <th>Orders</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredSuppliers.map((supplier, index) => {
                  const supplierId = getValue(
                    supplier,
                    ["id", "supplierId", "_id"],
                    index
                  );

                  const supplierStatus = getStatus(supplier);

                  return (
                    <tr key={supplierId}>
                      <td>
                        <div className="admin-supplier-name">
                          <strong>{getSupplierName(supplier)}</strong>
                          <span>ID: {supplierId}</span>
                        </div>
                      </td>

                      <td>{getSupplierEmail(supplier)}</td>

                      <td>{getSupplierPhone(supplier)}</td>

                      <td>{getProductCount(supplier)}</td>

                      <td>{getOrderCount(supplier)}</td>

                      <td>
                        <Badge variant={getBadgeVariant(supplierStatus)}>
                          {supplierStatus}
                        </Badge>
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

export default AdminSuppliers;