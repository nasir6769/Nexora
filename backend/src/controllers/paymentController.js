import * as paymentService from "../services/paymentService.js";

export const payCommitment = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const userName = req.user.name;
    const result = await paymentService.processCommitmentPayment(userId, userName, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
