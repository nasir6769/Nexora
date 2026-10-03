import api from "./api";
import { demoInventory } from "./demoData";
import { isDemoMode } from "./demoMode";

export const getInventory = async (params = {}) => {
  if (isDemoMode()) {
    return {
      data: demoInventory,
      total: demoInventory.length,
    };
  }

  const response = await api.get("/inventory", { params });
  return response.data;
};

export const getInventoryItem = async (id) => {
  if (isDemoMode()) {
    const item = demoInventory.find(
      (product) =>
        String(product.id) === String(id) ||
        String(product.productId) === String(id)
    );

    if (!item) {
      throw new Error("Inventory item not found.");
    }

    return item;
  }

  const response = await api.get(`/inventory/${id}`);
  return response.data;
};

export const createInventoryItem = async (data) => {
  if (isDemoMode()) {
    return {
      ...data,
      id: `demo-inv-${Date.now()}`,
      status: "In Stock",
    };
  }

  const response = await api.post("/inventory", data);
  return response.data;
};

export const updateInventoryItem = async (id, data) => {
  if (isDemoMode()) {
    return {
      ...data,
      id,
    };
  }

  const response = await api.put(`/inventory/${id}`, data);
  return response.data;
};

export const deleteInventoryItem = async (id) => {
  if (isDemoMode()) {
    return {
      success: true,
      id,
    };
  }

  const response = await api.delete(`/inventory/${id}`);
  return response.data;
};

export const getLowStockAlerts = async () => {
  if (isDemoMode()) {
    return demoInventory.filter(
      (item) => item.stock <= item.lowStockThreshold
    );
  }

  const response = await api.get("/inventory/alerts/low-stock");
  return response.data;
};

export const getSlowMovingAlerts = async () => {
  if (isDemoMode()) {
    return demoInventory.filter(
      (item) => item.stock > item.lowStockThreshold
    );
  }

  const response = await api.get("/inventory/alerts/slow-moving");
  return response.data;
};