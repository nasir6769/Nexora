import { ProcurementOrder } from "../models/ProcurementOrder.js";
import { PROCUREMENT_STATUS } from "../utils/constants.js";

export const aggregateDemand = async (filter = {}) => {
  const activeStatuses = [
    PROCUREMENT_STATUS.PENDING,
    PROCUREMENT_STATUS.REQUESTED,
    PROCUREMENT_STATUS.COMMITMENT_PAID,
  ];

  const matchStage = {
    status: { $in: activeStatuses },
  };

  if (filter.productName) {
    matchStage.productName = new RegExp(filter.productName, "i");
  }

  const aggregation = await ProcurementOrder.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$productName",
        productId: { $first: "$productId" },
        sku: { $first: "$sku" },
        category: { $first: "$category" },
        totalQuantity: { $sum: "$quantity" },
        totalValue: { $sum: "$totalAmount" },
        totalCommitmentPaid: { $sum: "$commitmentAmount" },
        merchantCount: { $addToSet: "$merchantId" },
        requestIds: { $push: "$requestId" },
        orderIds: { $push: "$_id" },
      },
    },
    {
      $project: {
        productName: "$_id",
        productId: 1,
        sku: 1,
        category: 1,
        totalQuantity: 1,
        totalValue: 1,
        totalCommitmentPaid: 1,
        participatingMerchants: { $size: "$merchantCount" },
        requestIds: 1,
        orderIds: 1,
        estimatedBulkDiscount: {
          $cond: [
            { $gte: ["$totalQuantity", 100] },
            "15%",
            {
              $cond: [
                { $gte: ["$totalQuantity", 50] },
                "10%",
                "5%",
              ],
            },
          ],
        },
      },
    },
    { $sort: { totalQuantity: -1 } },
  ]);

  return aggregation;
};
