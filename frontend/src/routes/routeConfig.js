export const ROUTES = {
  HOME: "/",

  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },

  MERCHANT: {
    PROFILE: "/merchant/profile",
    DASHBOARD: "/merchant/dashboard",

    INVENTORY: "/merchant/inventory",
    ADD_INVENTORY: "/merchant/inventory/add",

    PROCUREMENT: "/merchant/procurement",
    PROCUREMENT_REQUEST: "/merchant/procurement/request/:productId",

    RESALE: "/merchant/resale",
    CREATE_RESALE: "/merchant/resale/create",
    MY_LISTINGS: "/merchant/resale/my-listings",
    RESALE_REQUEST: "/merchant/resale/request/:productId",

    ORDERS: "/merchant/orders",
  },

  SUPPLIER: {
    DASHBOARD: "/supplier/dashboard",

    PRODUCTS: "/supplier/products",
    ADD_PRODUCT: "/supplier/products/add",
    EDIT_PRODUCT: "/supplier/products/:productId/edit",

    ORDERS: "/supplier/orders",
  },

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    PROCUREMENT: "/admin/procurement",
    SUPPLIERS: "/admin/suppliers",
    ORDERS: "/admin/orders",
    LOGISTICS: "/admin/logistics",
  },
};

export const buildRoute = (route, params = {}) => {
  return Object.entries(params).reduce(
    (currentRoute, [key, value]) =>
      currentRoute.replace(`:${key}`, encodeURIComponent(value)),
    route
  );
};