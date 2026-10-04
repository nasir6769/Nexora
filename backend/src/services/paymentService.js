import { Transaction } from "../models/Transaction.js";
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from "../utils/constants.js";

export const processCommitmentPayment = async (userId, userName, { requestId, amount, percentage = 10 }) => {
  const parsedAmount = Number(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    const error = new Error("Invalid payment amount");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await Transaction.create({
    userId,
    userName: userName || "Merchant",
    type: TRANSACTION_TYPE.PROCUREMENT_COMMITMENT,
    amount: parsedAmount,
    percentage: Number(percentage),
    referenceId: requestId ? String(requestId) : "",
    referenceType: "procurement",
    paymentMethod: "Simulated Payment Gateway",
    status: TRANSACTION_STATUS.COMPLETED,
    paidAt: new Date(),
  });

  return {
    success: true,
    paymentId: transaction.transactionId,
    transactionId: transaction.transactionId,
    requestId,
    amount: parsedAmount,
    percentage: Number(percentage),
    status: "paid",
    paidAt: transaction.paidAt.toISOString(),
  };
};

export const processResalePayment = async (userId, userName, { orderId, amount }) => {
  const transaction = await Transaction.create({
    userId,
    userName: userName || "Merchant",
    type: TRANSACTION_TYPE.RESALE_PURCHASE,
    amount: Number(amount),
    referenceId: orderId ? String(orderId) : "",
    referenceType: "resale",
    paymentMethod: "Simulated Direct Settlement",
    status: TRANSACTION_STATUS.COMPLETED,
    paidAt: new Date(),
  });

  return {
    success: true,
    paymentId: transaction.transactionId,
    amount: Number(amount),
    status: "paid",
  };
};
