
import api from "./api";
import {
  demoAdminDashboard,
  demoAdminOrders,
  demoAdminSuppliers,
  demoLogistics,
  demoProcurementRequests,
  demoSupplierOffers,
} from "./demoData";
import { isDemoMode } from "./demoMode";

export const getAdminDashboard = async () => {
  if (isDemoMode()) {
    return demoAdminDashboard;
  }

  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getAdminProcurement = async (params = {}) => {
  if (isDemoMode()) {
    let procurement = [...demoProcurementRequests];

    if (params.status) {
      procurement = procurement.filter(
        (item) =>
          item.status.toLowerCase() ===
          params.status.toLowerCase()
      );
    }

    if (params.search) {
      const search = params.search.toLowerCase();

      procurement = procurement.filter(
        (item) =>
          item.id.toLowerCase().includes(search) ||
          item.productName.toLowerCase().includes(search)
      );
    }

    return {
      data: procurement,
      total: procurement.length,
    };
  }

  const response = await api.get("/admin/procurement", {
    params,
  });

  return response.data;
};

export const getAdminProcurementDetail = async (id) => {
  if (isDemoMode()) {
    const item = demoProcurementRequests.find(
      (request) => String(request.id) === String(id)
    );

    if (!item) {
      throw new Error("Procurement request not found.");
    }

    return item;
  }

  const response = await api.get(`/admin/procurement/${id}`);
  return response.data;
};

export const getAdminSuppliers = async (params = {}) => {
  if (isDemoMode()) {
    let suppliers = [...demoAdminSuppliers];

    if (params.status) {
      suppliers = suppliers.filter(
        (supplier) =>
          supplier.status.toLowerCase() ===
          params.status.toLowerCase()
      );
    }

    if (params.search) {
      const search = params.search.toLowerCase();

      suppliers = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(search) ||
          supplier.email.toLowerCase().includes(search)
      );
    }

    return {
      data: suppliers,
      total: suppliers.length,
    };
  }

  const response = await api.get("/admin/suppliers", {
    params,
  });

  return response.data;
};

export const getAdminSupplierDetail = async (id) => {
  if (isDemoMode()) {
    const supplier = demoAdminSuppliers.find(
      (item) => String(item.id) === String(id)
    );

    if (!supplier) {
      throw new Error("Supplier not found.");
    }

    return supplier;
  }

  const response = await api.get(`/admin/suppliers/${id}`);
  return response.data;
};

export const getAdminOrders = async (params = {}) => {
  if (isDemoMode()) {
    let orders = [...demoAdminOrders];

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
          order.supplierName.toLowerCase().includes(search) ||
          order.productName.toLowerCase().includes(search)
      );
    }

    return {
      data: orders,
      total: orders.length,
    };
  }

  const response = await api.get("/admin/orders", {
    params,
  });

  return response.data;
};

export const getAdminOrderDetail = async (id) => {
  if (isDemoMode()) {
    const order = demoAdminOrders.find(
      (item) => String(item.id) === String(id)
    );

    if (!order) {
      throw new Error("Order not found.");
    }

    return order;
  }

  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
};

export const getAdminLogistics = async (params = {}) => {
  if (isDemoMode()) {
    let logistics = [...demoLogistics];

    if (params.status) {
      logistics = logistics.filter(
        (item) =>
          item.status.toLowerCase() ===
          params.status.toLowerCase()
      );
    }

    if (params.search) {
      const search = params.search.toLowerCase();

      logistics = logistics.filter(
        (item) =>
          item.id.toLowerCase().includes(search) ||
          item.orderId.toLowerCase().includes(search) ||
          item.trackingNumber.toLowerCase().includes(search) ||
          item.merchantName.toLowerCase().includes(search) ||
          item.supplierName.toLowerCase().includes(search)
      );
    }

    return {
      data: logistics,
      total: logistics.length,
    };
  }

  const response = await api.get("/admin/logistics", {
    params,
  });

  return response.data;
};

export const getAdminShipmentDetail = async (id) => {
  if (isDemoMode()) {
    const shipment = demoLogistics.find(
      (item) => String(item.id) === String(id)
    );

    if (!shipment) {
      throw new Error("Shipment not found.");
    }

    return shipment;
  }

  const response = await api.get(`/admin/logistics/${id}`);
  return response.data;
};

export const getSupplierOffers = async (productName) => {
  if (isDemoMode()) {
    return demoSupplierOffers[productName] || [];
  }

  const response = await api.get("/admin/procurement/supplier-offers", {
    params: {
      productName,
    },
  });

  return response.data;
};

export const createSupplierOrder = async (data) => {
  if (isDemoMode()) {
    return {
      id: `SUP-ORDER-DEMO-${Date.now()}`,
      requestId: data.requestId,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalAmount: data.totalAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }

  const response = await api.post(
    "/admin/procurement/supplier-order",
    data
  );

  return response.data;
};

export const allocateDemand = async (data) => {
  if (isDemoMode()) {
    return {
      success: true,
      message: "Demand allocated successfully",
    };
  }

  const response = await api.post("/admin/procurement/allocate", data);
  return response.data;
};