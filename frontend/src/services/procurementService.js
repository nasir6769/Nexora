import api from "./api";
import {
  demoProcurementProducts,
  demoProcurementRequests,
} from "./demoData";
import { isDemoMode } from "./demoMode";

export const getProcurementProducts = async (params = {}) => {
  if (isDemoMode()) {
    let products = [...demoProcurementProducts];

    if (params.search) {
      const search = params.search.toLowerCase();

      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.sku.toLowerCase().includes(search)
      );
    }

    if (params.category) {
      products = products.filter(
        (product) =>
          product.category.toLowerCase() ===
          params.category.toLowerCase()
      );
    }

    return {
      data: products,
      total: products.length,
    };
  }

  const response = await api.get("/procurement/products", {
    params,
  });

  return response.data;
};

export const getProcurementProduct = async (id) => {
  if (isDemoMode()) {
    const product = demoProcurementProducts.find(
      (item) =>
        String(item.id) === String(id) ||
        String(item.productId) === String(id)
    );

    if (!product) {
      throw new Error("Procurement product not found.");
    }

    return product;
  }

  const response = await api.get(`/procurement/products/${id}`);
  return response.data;
};

export const createProcurementRequest = async (data) => {
  if (isDemoMode()) {
    return {
      id: `PR-DEMO-${Date.now()}`,
      ...data,
      status: "pending",
    };
  }

  const response = await api.post("/procurement/requests", data);
  return response.data;
};

export const getProcurementRequests = async (params = {}) => {
  if (isDemoMode()) {
    let requests = [...demoProcurementRequests];

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

  const response = await api.get("/procurement/requests", {
    params,
  });

  return response.data;
};

export const getProcurementRequest = async (id) => {
  if (isDemoMode()) {
    const request = demoProcurementRequests.find(
      (item) => String(item.id) === String(id)
    );

    if (!request) {
      throw new Error("Procurement request not found.");
    }

    return request;
  }

  const response = await api.get(`/procurement/requests/${id}`);
  return response.data;
};

export const cancelProcurementRequest = async (id) => {
  if (isDemoMode()) {
    return {
      success: true,
      id,
      status: "cancelled",
    };
  }

  const response = await api.patch(
    `/procurement/requests/${id}/cancel`
  );

  return response.data;
};