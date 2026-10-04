import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  deleteInventoryItem,
  getInventory,
} from "../../services/inventoryService";
import { ROUTES, buildRoute } from "../../routes/routeConfig";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import SearchInput from "../../components/common/SearchInput";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";

import "./MerchantInventory.css";

function getArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.items ||
    data?.products ||
    data?.inventory ||
    data?.data ||
    []
  );
}

function getStock(item) {
  return Number(
    item?.stock ??
      item?.quantity ??
      item?.currentStock ??
      0
  );
}

function getThreshold(item) {
  return Number(
    item?.lowStockThreshold ??
      item?.reorderLevel ??
      10
  );
}

function getStockStatus(item) {
  const stock = getStock(item);
  const threshold = getThreshold(item);

  if (stock <= 0) {
    return {
      label: "Out of stock",
      variant: "danger",
    };
  }

  if (stock <= threshold) {
    return {
      label: "Low stock",
      variant: "warning",
    };
  }

  return {
    label: "In stock",
    variant: "success",
  };
}

function MerchantInventory() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState(null);
  const [isDeleting, setIsDeleting] =
    useState(false);

  const loadInventory = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getInventory();
      setInventory(getArray(response));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load inventory."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return inventory;
    }

    return inventory.filter((item) => {
      const name =
        item?.name ||
        item?.productName ||
        item?.product?.name ||
        "";

      const sku =
        item?.sku ||
        item?.product?.sku ||
        "";

      const category =
        item?.category ||
        item?.product?.category ||
        "";

      return [
        name,
        sku,
        category,
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [inventory, search]);

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteInventoryItem(
        deleteTarget.id
      );

      setInventory((current) =>
        current.filter(
          (item) =>
            String(
              item?.id || item?._id
            ) !== String(deleteTarget.id)
        )
      );

      setDeleteTarget(null);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to delete inventory item."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="inventory-loading">
        <Spinner size="large" />
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="merchant-inventory">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>
            Manage the products currently available
            in your store.
          </p>
        </div>

        <Link
          to={ROUTES.MERCHANT.ADD_INVENTORY}
        >
          <Button>
            Add inventory
          </Button>
        </Link>
      </div>

      {error && (
        <div className="inventory-error">
          {error}
        </div>
      )}

      <Card
        title="Your inventory"
        subtitle={`${filteredInventory.length} item${
          filteredInventory.length === 1
            ? ""
            : "s"
        }`}
        actions={
          <SearchInput
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search inventory..."
          />
        }
        padding="none"
      >
        {filteredInventory.length === 0 ? (
          <EmptyState
            title={
              inventory.length === 0
                ? "No inventory yet"
                : "No matching products"
            }
            message={
              inventory.length === 0
                ? "Add your first inventory item to start managing your stock."
                : "Try a different product name, SKU, or category."
            }
            action={
              inventory.length === 0 ? (
                <Link
                  to={ROUTES.MERCHANT.ADD_INVENTORY}
                >
                  <Button>
                    Add inventory
                  </Button>
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInventory.map(
                  (item, index) => {
                    const id =
                      item?.id ||
                      item?._id;

                    const name =
                      item?.name ||
                      item?.productName ||
                      item?.product?.name ||
                      "Unnamed product";

                    const sku =
                      item?.sku ||
                      item?.product?.sku ||
                      "—";

                    const category =
                      item?.category ||
                      item?.product?.category ||
                      "—";

                    const status =
                      getStockStatus(item);

                    return (
                      <tr
                        key={
                          id ||
                          `${name}-${index}`
                        }
                      >
                        <td>
                          <strong>
                            {name}
                          </strong>
                        </td>

                        <td>{sku}</td>

                        <td>{category}</td>

                        <td>
                          {getStock(item)}
                        </td>

                        <td>
                          <Badge
                            variant={
                              status.variant
                            }
                            size="small"
                          >
                            {status.label}
                          </Badge>
                        </td>

                        <td>
                          <div className="inventory-actions">
                            {id && (
                              <Link
                                to={buildRoute(
                                  ROUTES.MERCHANT.INVENTORY,
                                  {
                                    productId: id,
                                  }
                                )}
                              >
                                View
                              </Link>
                            )}

                            <Button
                              variant="danger"
                              size="small"
                              onClick={() =>
                                setDeleteTarget({
                                  id,
                                  name,
                                })
                              }
                            >
                              Delete
                            </Button>
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

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete inventory item?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() =>
          isDeleting
            ? undefined
            : setDeleteTarget(null)
        }
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MerchantInventory;