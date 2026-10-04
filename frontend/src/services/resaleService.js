import api from "./api";
import {
  demoMyListings,
  demoResaleListings,
  demoResaleRequests,
} from "./demoData";
import { isDemoMode } from "./demoMode";

export const getResaleListings = async (params = {}) => {
  if (isDemoMode()) {
    let listings = [...demoResaleListings];

    if (params.search) {
      const search = params.search.toLowerCase();

      listings = listings.filter(
        (listing) =>
          listing.productName.toLowerCase().includes(search) ||
          listing.sku.toLowerCase().includes(search)
      );
    }

    if (params.category) {
      listings = listings.filter(
        (listing) =>
          listing.category.toLowerCase() ===
          params.category.toLowerCase()
      );
    }

    return {
      data: listings,
      total: listings.length,
    };
  }

  const response = await api.get("/resale/listings", {
    params,
  });

  return response.data;
};

export const getResaleListing = async (id) => {
  if (isDemoMode()) {
    const listing = demoResaleListings.find(
      (item) =>
        String(item.id) === String(id) ||
        String(item.productId) === String(id)
    );

    if (!listing) {
      throw new Error("Resale listing not found.");
    }

    return listing;
  }

  const response = await api.get(`/resale/listings/${id}`);
  return response.data;
};

export const createResaleListing = async (data) => {
  if (isDemoMode()) {
    return {
      id: `listing-demo-${Date.now()}`,
      ...data,
      status: "active",
    };
  }

  const response = await api.post("/resale/listings", data);
  return response.data;
};

export const updateResaleListing = async (id, data) => {
  if (isDemoMode()) {
    return {
      id,
      ...data,
    };
  }

  const response = await api.put(`/resale/listings/${id}`, data);
  return response.data;
};

export const deleteResaleListing = async (id) => {
  if (isDemoMode()) {
    return {
      success: true,
      id,
    };
  }

  const response = await api.delete(`/resale/listings/${id}`);
  return response.data;
};

export const getMyResaleListings = async (params = {}) => {
  if (isDemoMode()) {
    let listings = [...demoMyListings];

    if (params.search) {
      const search = params.search.toLowerCase();

      listings = listings.filter(
        (listing) =>
          listing.productName.toLowerCase().includes(search) ||
          listing.sku.toLowerCase().includes(search)
      );
    }

    return {
      data: listings,
      total: listings.length,
    };
  }

  const response = await api.get("/resale/listings/my", {
    params,
  });

  return response.data;
};

export const createResaleRequest = async (data) => {
  if (isDemoMode()) {
    return {
      id: `RR-DEMO-${Date.now()}`,
      ...data,
      status: "pending",
    };
  }

  const response = await api.post("/resale/requests", data);
  return response.data;
};

export const getResaleRequests = async (params = {}) => {
  if (isDemoMode()) {
    let requests = [...demoResaleRequests];

    if (params.status) {
      requests = requests.filter(
        (request) =>
          request.status.toLowerCase() ===
          params.status.toLowerCase()
      );
    }

    return {
      data: requests,
      total: requests.length,
    };
  }

  const response = await api.get("/resale/requests", {
    params,
  });

  return response.data;
};

export const getResaleRequest = async (id) => {
  if (isDemoMode()) {
    const request = demoResaleRequests.find(
      (item) => String(item.id) === String(id)
    );

    if (!request) {
      throw new Error("Resale request not found.");
    }

    return request;
  }

  const response = await api.get(`/resale/requests/${id}`);
  return response.data;
};

export const cancelResaleRequest = async (id) => {
  if (isDemoMode()) {
    return {
      success: true,
      id,
      status: "cancelled",
    };
  }

  const response = await api.patch(
    `/resale/requests/${id}/cancel`
  );

  return response.data;
};