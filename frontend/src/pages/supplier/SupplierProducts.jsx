import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  deleteSupplierProduct,
  getSupplierProducts,
} from "../../services/supplierService";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import SearchInput from "../../components/common/SearchInput";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";

import { ROUTES } from "../../routes/routeConfig";

import "./SupplierProducts.css";

function getArray(data) {
  if (Array.isArray(data)) return data;

  return (
    data?.items ||
    data?.products ||
    data?.data ||
    []
  );
}

function getId(product) {
  return (
    product?.id ||
    product?._id ||
    product?.productId
  );
}

function getStock(product) {
  return Number(
    product?.stock ??
      product?.quantity ??
      0
  );
}

function getLowStockThreshold(product) {
  return Number(
    product?.lowStockThreshold ??
      product?.reorderLevel ??
      10
  );
}

function getStockVariant(product) {
  const stock = getStock(product);
  const threshold =
    getLowStockThreshold(product);

  if (stock <= 0) return "danger";
  if (stock <= threshold) return "warning";

  return "success";
}

function SupplierProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState(null);
  const [isDeleting, setIsDeleting] =
    useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response =
        await getSupplierProducts();

      setProducts(getArray(response));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to load products."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts =
    products.filter((product) => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) return true;

      return [
        product?.name,
        product?.productName,
        product?.sku,
        product?.category,
        product?.description,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });

  const handleDelete = async () => {
    const productId =
      getId(deleteTarget);

    if (!productId) return;

    setIsDeleting(true);

    try {
      await deleteSupplierProduct(
        productId
      );

      setProducts((current) =>
        current.filter(
          (product) =>
            getId(product) !== productId
        )
      );

      setDeleteTarget(null);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to delete product."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="supplier-products">
      <div className="page-header">
        <div>
          <h1>Products</h1>

         <p>
  Manage the products available on
  the platform.
</p>
        </div>

        <Link
          to={ROUTES.SUPPLIER.PRODUCTS + "/add"}
        >
          <Button>
            Add product
          </Button>
        </Link>
      </div>

      {error && (
        <div className="supplier-products-error">
          {error}
        </div>
      )}

      <Card padding="medium">
        <div className="supplier-products-toolbar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search products, SKU or category..."
          />

          <span className="supplier-products-count">
            {filteredProducts.length} product
            {filteredProducts.length !== 1
              ? "s"
              : ""}
          </span>
        </div>
      </Card>

      <Card padding="none">
        {isLoading ? (
          <div className="supplier-products-loading">
            <Spinner size="large" />
            <p>
              Loading products...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title={
              search
                ? "No products found"
                : "No products yet"
            }
            description={
              search
                ? "Try a different search term."
                 : "Add your first product to start receiving platform orders."
            }
            action={
              !search ? (
                <Link
                  to={
                    ROUTES.SUPPLIER.PRODUCTS +
                    "/add"
                  }
                >
                  <Button>
                    Add product
                  </Button>
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="supplier-products-table-wrapper">
            <table className="supplier-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product, index) => {
                    const id = getId(product);

                    const name =
                      product?.name ||
                      product?.productName ||
                      "Unnamed product";

                    const sku =
                      product?.sku || "—";

                    const category =
                      product?.category || "—";

                    const price =
                      product?.price ??
                      product?.unitPrice ??
                      0;

                    const stock =
                      getStock(product);

                    return (
                      <tr
                        key={
                          id ||
                          `product-${index}`
                        }
                      >
                        <td>
                          <div className="supplier-product-name">
                            <strong>
                              {name}
                            </strong>

                            {product?.description && (
                              <span>
                                {product.description}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>{sku}</td>

                        <td>{category}</td>

                        <td>
                          ₹
                          {Number(price).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td>
                          <Badge
                            size="small"
                            variant={getStockVariant(
                              product
                            )}
                          >
                            {stock}
                          </Badge>
                        </td>

                        <td>
                          <div className="supplier-product-actions">
                            <Link
                              to={`${ROUTES.SUPPLIER.PRODUCTS}/${id}/edit`}
                            >
                              <Button
                                variant="secondary"
                                size="small"
                              >
                                Edit
                              </Button>
                            </Link>

                            <Button
                              variant="danger"
                              size="small"
                              onClick={() =>
                                setDeleteTarget(
                                  product
                                )
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
        open={Boolean(deleteTarget)}
        title="Delete product?"
        message={`Are you sure you want to delete "${
          deleteTarget?.name ||
          deleteTarget?.productName ||
          "this product"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() =>
          !isDeleting &&
          setDeleteTarget(null)
        }
      />
    </div>
  );
}

export default SupplierProducts;