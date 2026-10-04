import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getResaleListings,
} from "../../services/resaleService";
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

import "./MerchantResale.css";

function getArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.items ||
    data?.listings ||
    data?.products ||
    data?.data ||
    []
  );
}

function MerchantResale() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response =
          await getResaleListings();

        setListings(getArray(response));
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load resale listings."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, []);

  const categories = useMemo(() => {
    const values = listings
      .map(
        (listing) =>
          listing?.category ||
          listing?.product?.category
      )
      .filter(Boolean);

    return [...new Set(values)];
  }, [listings]);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return listings.filter((listing) => {
      const name =
        listing?.name ||
        listing?.productName ||
        listing?.product?.name ||
        "";

      const seller =
        listing?.merchantName ||
        listing?.sellerName ||
        listing?.merchant?.name ||
        listing?.seller?.name ||
        "";

      const listingCategory =
        listing?.category ||
        listing?.product?.category ||
        "";

      const matchesSearch =
        !query ||
        [
          name,
          seller,
          listingCategory,
        ].some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );

      const matchesCategory =
        category === "all" ||
        listingCategory === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    listings,
    search,
    category,
  ]);

  if (isLoading) {
    return (
      <div className="resale-loading">
        <Spinner size="large" />
        <p>
          Loading resale listings...
        </p>
      </div>
    );
  }

  return (
    <div className="merchant-resale">
      <div className="page-header">
        <div>
          <h1>Resale Marketplace</h1>

          <p>
            Find excess inventory listed by other
            merchants at resale prices.
          </p>
        </div>

        <div className="page-header-actions">
          <Link
            to={ROUTES.MERCHANT.CREATE_RESALE}
          >
            <Button>
              List excess stock
            </Button>
          </Link>

          <Link
            to={ROUTES.MERCHANT.MY_LISTINGS}
          >
            <Button variant="secondary">
              My listings
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="resale-error">
          {error}
        </div>
      )}

      <Card
        title="Available inventory"
        subtitle={`${filteredListings.length} listing${
          filteredListings.length === 1
            ? ""
            : "s"
        } available`}
        actions={
          <div className="resale-filters">
            <SearchInput
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search listings..."
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="resale-category-select"
              aria-label="Filter by category"
            >
              <option value="all">
                All categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>
        }
        padding="none"
      >
        {filteredListings.length === 0 ? (
          <EmptyState
            title={
              listings.length === 0
                ? "No resale listings"
                : "No matching listings"
            }
            message={
              listings.length === 0
                ? "There are currently no excess-stock listings available."
                : "Try a different search or category."
            }
            action={
              listings.length === 0 ? (
                <Link
                  to={
                    ROUTES.MERCHANT.CREATE_RESALE
                  }
                >
                  <Button>
                    List excess stock
                  </Button>
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="resale-table-wrapper">
            <table className="resale-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Available</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredListings.map(
                  (listing, index) => {
                    const id =
                      listing?.id ||
                      listing?._id ||
                      listing?.listingId;

                    const name =
                      listing?.name ||
                      listing?.productName ||
                      listing?.product?.name ||
                      "Unnamed product";

                    const seller =
                      listing?.merchantName ||
                      listing?.sellerName ||
                      listing?.merchant?.name ||
                      listing?.seller?.name ||
                      "Merchant";

                    const listingCategory =
                      listing?.category ||
                      listing?.product?.category ||
                      "—";

                    const price =
                      listing?.price ??
                      listing?.resalePrice ??
                      listing?.unitPrice;

                    const quantity =
                      listing?.quantity ??
                      listing?.availableQuantity ??
                      listing?.stock;

                    const status =
                      listing?.status ||
                      "available";

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

                          {(
                            listing?.sku ||
                            listing?.product?.sku
                          ) && (
                            <span className="resale-sku">
                              SKU:{" "}
                              {listing?.sku ||
                                listing?.product?.sku}
                            </span>
                          )}
                        </td>

                        <td>{seller}</td>

                        <td>
                          <Badge
                            variant="default"
                            size="small"
                          >
                            {listingCategory}
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
                          {quantity ?? "—"}
                        </td>

                        <td>
                          <Badge
                            variant={
                              String(status)
                                .toLowerCase() ===
                              "available"
                                ? "success"
                                : "warning"
                            }
                            size="small"
                          >
                            {status}
                          </Badge>
                        </td>

                        <td>
                          {id ? (
                            <Link
                              to={buildRoute(
                                ROUTES.MERCHANT
                                  .RESALE_REQUEST,
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

export default MerchantResale;