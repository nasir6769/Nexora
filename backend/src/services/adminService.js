import { User } from "../models/User.js";
import { SupplierProduct } from "../models/SupplierProduct.js";
import { ProcurementOrder } from "../models/ProcurementOrder.js";
import { ResaleOrder } from "../models/ResaleOrder.js";
import { Logistics } from "../models/Logistics.js";
import { ROLES, PROCUREMENT_STATUS } from "../utils/constants.js";

export const getAdminDashboard = async () => {
  const [totalMerchants, totalSuppliers, procurementOrders, resaleOrders] = await Promise.all([
    User.countDocuments({ role: ROLES.MERCHANT }),
    User.countDocuments({ role: ROLES.SUPPLIER }),
    ProcurementOrder.find(),
    ResaleOrder.find(),
  ]);

  const activeProcurement = procurementOrders.filter(
    (o) => ![PROCUREMENT_STATUS.COMPLETED, PROCUREMENT_STATUS.CANCELLED, PROCUREMENT_STATUS.REJECTED].includes(o.status)
  ).length;

  const activeResale = resaleOrders.filter(
    (o) => !["completed", "cancelled", "rejected"].includes(o.status)
  ).length;

  const totalProcurementValue = procurementOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return {
    totalMerchants: totalMerchants || 1,
    totalSuppliers: totalSuppliers || 1,
    activeOrders: activeProcurement + activeResale,
    totalProcurementValue,
  };
};

export const getAdminSuppliers = async (params = {}) => {
  const query = { role: ROLES.SUPPLIER };

  if (params.search) {
    const searchRegex = new RegExp(params.search, "i");
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { companyName: searchRegex },
    ];
  }

  const suppliers = await User.find(query);

  const supplierList = await Promise.all(
    suppliers.map(async (supplier) => {
      const [productCount, orderCount] = await Promise.all([
        SupplierProduct.countDocuments({ supplierId: supplier._id }),
        ProcurementOrder.countDocuments({ supplierId: supplier._id }),
      ]);

      return {
        id: supplier._id.toString(),
        _id: supplier._id.toString(),
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone || "—",
        companyName: supplier.companyName || supplier.name,
        products: productCount,
        productCount,
        activeOrders: orderCount,
        orderCount,
        status: supplier.status || "active",
      };
    })
  );

  return {
    data: supplierList,
    total: supplierList.length,
  };
};

export const getAdminSupplierDetail = async (id) => {
  const supplier = await User.findOne({ _id: id, role: ROLES.SUPPLIER });
  if (!supplier) {
    const error = new Error("Supplier not found");
    error.statusCode = 404;
    throw error;
  }

  const [products, orders] = await Promise.all([
    SupplierProduct.find({ supplierId: supplier._id }),
    ProcurementOrder.find({ supplierId: supplier._id }),
  ]);

  return {
    id: supplier._id.toString(),
    _id: supplier._id.toString(),
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    status: supplier.status,
    products,
    productCount: products.length,
    orders,
    orderCount: orders.length,
  };
};

export const getAdminOrders = async (params = {}) => {
  const query = {};

  if (params.status && params.status !== "all") {
    query.status = params.status.toLowerCase();
  }

  if (params.search) {
    const searchRegex = new RegExp(params.search, "i");
    query.$or = [
      { requestId: searchRegex },
      { productName: searchRegex },
      { merchantName: searchRegex },
      { supplierName: searchRegex },
    ];
  }

  const orders = await ProcurementOrder.find(query).sort({ createdAt: -1 });

  return {
    data: orders,
    total: orders.length,
  };
};

export const getAdminOrderDetail = async (id) => {
  const query = {
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      { requestId: id },
    ].filter((cond) => cond._id !== null || cond.requestId),
  };

  const order = await ProcurementOrder.findOne(query);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  return order;
};
