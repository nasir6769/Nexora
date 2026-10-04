import { SupplierProduct } from "../models/SupplierProduct.js";
import { SupplierOffer } from "../models/SupplierOffer.js";

/**
 * Deterministic Supplier Selection Business Logic:
 * Evaluates candidate offers/products based on:
 * 1. Stock sufficiency: availableStock >= requiredQuantity
 * 2. MOQ compliance: MOQ <= requiredQuantity
 * 3. Price scoring (weighted 45%)
 * 4. Delivery turnaround speed (weighted 30%)
 * 5. Supplier rating / reliability (weighted 25%)
 */
export const selectBestSupplier = async (productName, requiredQuantity) => {
  // Check active SupplierProducts and SupplierOffers
  const offers = await SupplierOffer.find({
    productName: new RegExp(`^${productName}$`, "i"),
    isActive: true,
  });

  const products = await SupplierProduct.find({
    $or: [
      { name: new RegExp(`^${productName}$`, "i") },
      { productName: new RegExp(`^${productName}$`, "i") },
    ],
    status: "active",
  });

  const candidatePool = [];

  for (const offer of offers) {
    candidatePool.push({
      id: offer._id.toString(),
      supplierId: offer.supplierId.toString(),
      supplierName: offer.supplierName,
      productName: offer.productName,
      price: offer.price,
      availableStock: offer.availableStock,
      minimumOrderQuantity: offer.minimumOrderQuantity,
      deliveryDays: offer.deliveryDays || 2,
      rating: offer.rating || 4.5,
      source: "offer",
    });
  }

  for (const prod of products) {
    const exists = candidatePool.some((c) => c.supplierId === prod.supplierId.toString());
    if (!exists) {
      candidatePool.push({
        id: prod._id.toString(),
        supplierId: prod.supplierId.toString(),
        supplierName: prod.supplierName || "Verified Supplier",
        productName: prod.name || prod.productName,
        price: prod.price,
        availableStock: prod.availableStock ?? prod.stock,
        minimumOrderQuantity: prod.minimumOrderQuantity || 1,
        deliveryDays: prod.estimatedDeliveryDays || 2,
        rating: prod.rating || 4.7,
        source: "product",
      });
    }
  }

  if (candidatePool.length === 0) {
    return null;
  }

  // Filter candidates that can fulfill the demand
  const eligibleCandidates = candidatePool.filter((c) => {
    const meetsMOQ = requiredQuantity >= c.minimumOrderQuantity;
    const meetsStock = c.availableStock >= requiredQuantity;
    return meetsMOQ && meetsStock;
  });

  const evaluationPool = eligibleCandidates.length > 0 ? eligibleCandidates : candidatePool;

  const minPrice = Math.min(...evaluationPool.map((c) => c.price));
  const minDelivery = Math.min(...evaluationPool.map((c) => c.deliveryDays));

  // Calculate deterministic score for each candidate
  const scoredCandidates = evaluationPool.map((c) => {
    // Price score: 100 * (minPrice / candidatePrice) -> higher is better
    const priceScore = c.price > 0 ? (minPrice / c.price) * 45 : 0;

    // Delivery score: 100 * (minDelivery / candidateDelivery) -> higher is better
    const deliveryScore = c.deliveryDays > 0 ? (minDelivery / c.deliveryDays) * 30 : 0;

    // Rating score: (rating / 5.0) * 25
    const ratingScore = ((c.rating || 4.5) / 5.0) * 25;

    const totalScore = Number((priceScore + deliveryScore + ratingScore).toFixed(2));

    return {
      ...c,
      totalScore,
      scoringBreakdown: {
        priceScore: Number(priceScore.toFixed(2)),
        deliveryScore: Number(deliveryScore.toFixed(2)),
        ratingScore: Number(ratingScore.toFixed(2)),
      },
    };
  });

  // Sort by highest score first, tie-breaker: lower price, then faster delivery
  scoredCandidates.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (a.price !== b.price) return a.price - b.price;
    return a.deliveryDays - b.deliveryDays;
  });

  return {
    bestSupplier: scoredCandidates[0],
    rankedOffers: scoredCandidates,
  };
};
