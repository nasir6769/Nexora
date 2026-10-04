export const ROLES = {
  MERCHANT: "merchant",
  SUPPLIER: "supplier",
  ADMIN: "admin",
};

export const INVENTORY_STATUS = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
  EXCESS: "Excess",
  SLOW_MOVING: "Slow Moving",
  DEAD_STOCK: "Dead Stock",
  EXPIRING: "Expiring",
};

export const INVENTORY_MOVEMENT_TYPE = {
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND",
  ADJUSTMENT: "ADJUSTMENT",
  RESALE_SOLD: "RESALE_SOLD",
  RESALE_PURCHASED: "RESALE_PURCHASED",
  PROCUREMENT_RECEIVED: "PROCUREMENT_RECEIVED",
};

export const PROCUREMENT_STATUS = {
  REQUESTED: "requested",
  PENDING: "pending",
  COMMITMENT_PAID: "commitment_paid",
  AGGREGATED: "aggregated",
  SUPPLIER_SELECTED: "supplier_selected",
  ACCEPTED: "accepted",
  SUPPLIER_ACCEPTED: "supplier_accepted",
  PREPARING: "preparing",
  LOGISTICS_ASSIGNED: "logistics_assigned",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
};

export const RESALE_LISTING_STATUS = {
  ACTIVE: "active",
  SOLD: "sold",
  INACTIVE: "inactive",
  CANCELLED: "cancelled",
};

export const RESALE_ORDER_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  PREPARING: "preparing",
  IN_TRANSIT: "in_transit",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
};

export const LOGISTICS_STATUS = {
  PENDING: "pending",
  ASSIGNED: "assigned",
  PREPARING: "preparing",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const TRANSACTION_TYPE = {
  PROCUREMENT_COMMITMENT: "PROCUREMENT_COMMITMENT",
  RESALE_PURCHASE: "RESALE_PURCHASE",
  REFUND: "REFUND",
};

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};
