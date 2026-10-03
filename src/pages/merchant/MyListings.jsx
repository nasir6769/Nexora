import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  deleteResaleListing,
  getMyResaleListings,
} from "../../services/resaleService";

import {
  ROUTES,
} from "../../routes/routeConfig";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import SearchInput from "../../components/common/SearchInput";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Spinner from "../../components/common/Spinner";

import "./MyListings.css";

function getArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.items ||
    data?.listings ||
    data?.data ||
    []
  );
}

function MyListings() {
  const [listings, setListings] = useState([]);

  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const loadListings = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response =
        await getMyResaleListings();

      setListings(getArray(response));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to load your listings."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = listings.filter(
    (listing) => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return true;
      }

      const name =
        listing?.name ||
        listing?.productName ||
        listing?.product?.name ||
        "";

      const sku =
        listing?.sku ||
        listing?.product?.sku ||
        "";

      const category =
        listing?.category ||
        listing?.product?.category ||
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
    }
  );

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const id =
      deleteTarget?.id ||
      deleteTarget?._id ||
      deleteTarget?.listingId;

    if (!id) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteResaleListing(id);

      setListings((current) =>
        current.filter((listing) => {
          const listingId =
            listing?.id ||
            listing?._id ||
            listing?.listingId;

          return listingId !== id;
        })
      );

      setDeleteTarget(null);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to delete this listing."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="my-listings-loading">
        <Spinner size="large" />
        <p>
          Loading your listings...
        </p>
      </div>
    );
  }

  return (
    <div className="my-listings">
      <div className="page-header">
        <div>
          <h1>My Listings</h1>

          <p>
            Manage the excess inventory you have
            listed for resale.
          </p>
        </div>

        <Link
          to={ROUTES.MERCHANT.CREATE_RESALE}
        >
          <Button>
            Create listing
          </Button>
        </Link>
      </div>

      {error && (
        <div className="my-listings-error">
          {error}
        </div>
      )}

      <Card
        title="Your resale listings"
        subtitle={`${filteredListings.length} listing${
          filteredListings.length === 1
            ? ""
            : "s"
        }`}
        actions={
          <SearchInput
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search your listings..."
          />
        }
        padding="none"
      >
        {filteredListings.length === 0 ? (
          <EmptyState
            title={
              listings.length === 0
                ? "No listings yet"
                : "No matching listings"
            }
            message={
              listings.length === 0
                ? "List excess or slow-moving stock so other merchants can request it."
                : "Try a different search term."
            }
            action={
              listings.length === 0 ? (
                <Link
                  to={
                    ROUTES.MERCHANT.CREATE_RESALE
                  }
                >
                  <Button>
                    Create listing
                  </Button>
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="my-listings-table-wrapper">
            <table className="my-listings-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
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

                    const sku =
                      listing?.sku ||
                      listing?.product?.sku;

                    const category =
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
                      "active";

                    const isAvailable =
                      [
                        "active",
                        "available",
                        "listed",
                      ].includes(
                        String(status).toLowerCase()
                      );

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

                          {sku && (
                            <span className="listing-sku">
                              SKU: {sku}
                            </span>
                          )}
                        </td>

                        <td>
                          <Badge
                            size="small"
                            variant="default"
                          >
                            {category}
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
                            size="small"
                            variant={
                              isAvailable
                                ? "success"
                                : "warning"
                            }
                          >
                            {status}
                          </Badge>
                        </td>

                        <td>
                          <div className="listing-actions">
                            <Button
                              size="small"
                              variant="danger"
                              onClick={() =>
                                setDeleteTarget(
                                  listing
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
        isOpen={Boolean(deleteTarget)}
        title="Delete listing?"
        message="This resale listing will be removed from the marketplace."
        confirmText="Delete listing"
        cancelText="Keep listing"
        onConfirm={handleDelete}
        onCancel={() =>
          isDeleting
            ? null
            : setDeleteTarget(null)
        }
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MyListings;