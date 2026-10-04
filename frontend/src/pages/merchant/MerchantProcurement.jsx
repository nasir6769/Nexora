import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
  getProcurementProducts,
} from "../../services/procurementService";

import {
  ROUTES,
  buildRoute,
} from "../../routes/routeConfig";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";

import "./MerchantProcurement.css";

function getArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.items ||
    data?.products ||
    data?.data ||
    []
  );
}

function MerchantProcurement() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getProcurementProducts();

        setProducts(getArray(response));
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load procurement products."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = products
      .map(
        (product) =>
          product?.category ||
          product?.product?.category
      )
      .filter(Boolean);

    return [...new Set(values)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const name =
        product?.name ||
        product?.productName ||
        product?.product?.name ||
        "";

      const sku =
        product?.sku ||
        product?.product?.sku ||
        "";

      const productCategory =
        product?.category ||
        product?.product?.category ||
        "";

      const matchesSearch =
        !query ||
        [name, sku, productCategory].some(
          (value) =>
            String(value)
              .toLowerCase()
              .includes(query)
        );

      const matchesCategory =
        category === "all" ||
        productCategory === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    category,
  ]);

  if (isLoading) {
    return (
      <div className="procurement-loading">
        <Spinner size="large" />

        <p>
          Loading procurement products...
        </p>
      </div>
    );
  }

  return (
    <div className="merchant-procurement">
      <div className="page-header">
        <div>
          <h1>Procurement</h1>

          <p>
            Find products and request better bulk purchasing opportunities.
          </p>
        </div>
      </div>

      {error && (
        <div
          className="procurement-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <Card
        title="Available products"
        subtitle={`${filteredProducts.length} product${
          filteredProducts.length === 1
            ? ""
            : "s"
        } available`}
        actions={
          <div className="procurement-filters">
            <SearchInput
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products..."
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="procurement-category-select"
              aria-label="Filter by category"
            >
              <option value="all">
                All categories
              </option>

              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>
        }
        padding="none"
      >
        {filteredProducts.length === 0 ? (
          <EmptyState
            title={
              products.length === 0
                ? "No procurement products"
                : "No matching products"
            }
            message={
              products.length === 0
                ? "There are currently no products available for procurement."
                : "Try changing your search or category filter."
            }
          />
        ) : (
          <div className="procurement-table-wrapper">
            <table className="procurement-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product, index) => {
                    const id =
                      product?.id ||
                      product?._id ||
                      product?.productId;

                    const name =
                      product?.name ||
                      product?.productName ||
                      product?.product?.name ||
                      "Unnamed product";

                    const productCategory =
                      product?.category ||
                      product?.product?.category ||
                      "—";

                    const price =
                      product?.price ??
                      product?.unitPrice ??
                      product?.product?.price;

                    const stock =
                      product?.stock ??
                      product?.availableStock ??
                      product?.quantity;

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

                          {(product?.sku ||
                            product?.product?.sku) && (
                            <span className="procurement-sku">
                              SKU:{" "}
                              {product?.sku ||
                                product?.product?.sku}
                            </span>
                          )}
                        </td>

                        <td>
                          <Badge
                            variant="default"
                            size="small"
                          >
                            {productCategory}
                          </Badge>
                        </td>

                        <td>
                          {price !== undefined &&
                          price !== null
                            ? `₹${Number(
                                price
                              ).toLocaleString(
                                "en-IN"
                              )}`
                            : "—"}
                        </td>

                        <td>
                          {stock ?? "—"}
                        </td>

                        <td>
                          {id ? (
                            <Link
                              to={buildRoute(
                                ROUTES.MERCHANT
                                  .PROCUREMENT_REQUEST,
                                {
                                  productId: id,
                                }
                              )}
                            >
                              <Button
                                size="small"
                              >
                                Request
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              size="small"
                              disabled
                            >
                              Unavailable
                            </Button>
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

export default MerchantProcurement;