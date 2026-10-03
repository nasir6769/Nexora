import api from "./api";
import {
  demoSupplierOrders,
  demoSupplierProducts,
} from "./demoData";
import { isDemoMode } from "./demoMode";

export const getSupplierProducts = async (params = {}) => {
  if (isDemoMode()) {
    let products = [...demoSupplierProducts];

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

  const response = await api.get("/supplier/products", {
    params,
  });

  return response.data;
};

export const getSupplierProduct = async (id) => {
  if (isDemoMode()) {
    const product = demoSupplierProducts.find(
      (item) => String(item.id) === String(id)
    );

    if (!product) {
      throw new Error("Supplier product not found.");
    }

    return product;
  }

  const response = await api.get(`/supplier/products/${id}`);
  return response.data;
};

export const createSupplierProduct = async (data) => {
  if (isDemoMode()) {
    return {
      id: `sup-prod-demo-${Date.now()}`,
      ...data,
      status: "active",
    };
  }

  const response = await api.post("/supplier/products", data);
  return response.data;
};

export const updateSupplierProduct = async (id, data) => {
  if (isDemoMode()) {
    return {
      id,
      ...data,
    };
  }

  const response = await api.put(`/supplier/products/${id}`, data);
  return response.data;
};

export const deleteSupplierProduct = async (id) => {
  if (isDemoMode()) {
    return {
      success: true,
      id,
    };
  }

  const response = await api.delete(`/supplier/products/${id}`);
  return response.data;
};

export const getSupplierOrders = async (params = {}) => {
  if (isDemoMode()) {
    let orders = [...demoSupplierOrders];

    if (params.status) {
      orders = orders.filter(
        (order) =>
          order.status.toLowerCase() ===
          params.status.toLowerCase()
      );
    }

    if (params.search) {
      const search = params.search.toLowerCase();

      orders = orders.filter(
        (order) =>
          order.id.toLowerCase().includes(search) ||
          order.merchantName.toLowerCase().includes(search) ||
          order.productName.toLowerCase().includes(search)
      );
    }

    return {
      data: orders,
      total: orders.length,
    };
  }

  const response = await api.get("/supplier/orders", {
    params,
  });

  return response.data;
};

export const getSupplierOrder = async (id) => {
  if (isDemoMode()) {
    const order = demoSupplierOrders.find(
      (item) => String(item.id) === String(id)
    );

    if (!order) {
      throw new Error("Supplier order not found.");
    }

    return order;
  }

  const response = await api.get(`/supplier/orders/${id}`);
  return response.data;
};

export const updateSupplierOrderStatus = async (id, status) => {
  if (isDemoMode()) {
    return {
      id,
      status,
    };
  }

  const response = await api.patch(
    `/supplier/orders/${id}/status`,
    { status }
  );

  return response.data;
};

export const acceptSupplierOrder = async (id) =>
  updateSupplierOrderStatus(id, "accepted");

export const rejectSupplierOrder = async (id) =>
  updateSupplierOrderStatus(id, "rejected");

export const prepareSupplierOrder = async (id) =>
  updateSupplierOrderStatus(id, "preparing");

export const completeSupplierOrder = async (id) =>
  updateSupplierOrderStatus(id, "completed");