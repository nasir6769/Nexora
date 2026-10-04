import { Inventory } from "../models/Inventory.js";
import { SupplierProduct } from "../models/SupplierProduct.js";
import { INVENTORY_STATUS } from "../utils/constants.js";

export const getInventoryAnalytics = async (merchantId) => {
  const query = merchantId ? { merchantId } : {};
  const items = await Inventory.find(query);

  const totalSKUs = items.length;
  const totalUnits = items.reduce((sum, item) => sum + (item.stock || 0), 0);
  const totalValuation = items.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);

  const lowStockCount = items.filter((item) => item.stock <= item.lowStockThreshold).length;
  const excessStockCount = items.filter(
    (item) => [INVENTORY_STATUS.EXCESS, INVENTORY_STATUS.SLOW_MOVING, INVENTORY_STATUS.DEAD_STOCK].includes(item.status) || item.stock > item.lowStockThreshold * 3
  ).length;

  const categoryBreakdown = {};
  items.forEach((item) => {
    const cat = item.category || "Other";
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { count: 0, units: 0, valuation: 0 };
    }
    categoryBreakdown[cat].count += 1;
    categoryBreakdown[cat].units += item.stock || 0;
    categoryBreakdown[cat].valuation += (item.stock || 0) * (item.price || 0);
  });

  return {
    totalSKUs,
    totalUnits,
    totalValuation,
    lowStockCount,
    excessStockCount,
    categoryBreakdown,
  };
};

export const getExpiryRiskItems = async (merchantId) => {
  const query = merchantId ? { merchantId } : {};
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const items = await Inventory.find({
    ...query,
    expiryDate: { $lte: thirtyDaysFromNow, $ne: null },
  });

  return items;
};

export const getProcurementRecommendations = async (merchantId) => {
  const inventoryItems = await Inventory.find({ merchantId });
  const lowStockItems = inventoryItems.filter((i) => i.stock <= i.lowStockThreshold);

  const recommendations = [];

  for (const item of lowStockItems) {
    // Find matching supplier products
    const supplierProducts = await SupplierProduct.find({
      $or: [
        { name: new RegExp(item.name, "i") },
        { productName: new RegExp(item.productName || item.name, "i") },
        { sku: item.sku },
      ],
      status: "active",
    });

    const recommendedQuantity = Math.max(item.lowStockThreshold * 3 - item.stock, 10);
    const bestSupplier = supplierProducts.sort((a, b) => a.price - b.price)[0];

    recommendations.push({
      inventoryId: item._id.toString(),
      productName: item.name,
      currentStock: item.stock,
      lowStockThreshold: item.lowStockThreshold,
      recommendedOrderQuantity: recommendedQuantity,
      priority: item.stock === 0 ? "URGENT" : "HIGH",
      suggestedSupplier: bestSupplier ? {
        id: bestSupplier._id.toString(),
        name: bestSupplier.supplierName,
        price: bestSupplier.price,
        moq: bestSupplier.minimumOrderQuantity,
      } : null,
      reason: item.stock === 0 ? "Out of stock item with active customer demand" : "Stock level is below minimum threshold",
    });
  }

  return recommendations;
};

export const getResaleRecommendations = async (merchantId) => {
  const inventoryItems = await Inventory.find({ merchantId });

  // Candidates for resale: items with high stock or marked excess/slow moving
  const excessItems = inventoryItems.filter(
    (item) =>
      [INVENTORY_STATUS.EXCESS, INVENTORY_STATUS.SLOW_MOVING, INVENTORY_STATUS.DEAD_STOCK].includes(item.status) ||
      item.stock > item.lowStockThreshold * 2.5
  );

  return excessItems.map((item) => {
    const recommendedListQuantity = Math.floor(item.stock * 0.5);
    const suggestedDiscountPrice = Number((item.price * 0.85).toFixed(2));

    return {
      inventoryId: item._id.toString(),
      productName: item.name,
      sku: item.sku,
      category: item.category,
      currentStock: item.stock,
      recommendedListQuantity: Math.max(recommendedListQuantity, 1),
      originalPrice: item.price,
      suggestedResalePrice: suggestedDiscountPrice,
      potentialLiquidationValue: Number((Math.max(recommendedListQuantity, 1) * suggestedDiscountPrice).toFixed(2)),
      reason: "High holding inventory with slow rotation. Liquidating to free operating capital.",
    };
  });
};
