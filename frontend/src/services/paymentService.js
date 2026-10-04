const DEMO_TOKEN_PREFIX = "demo-token-";

const isDemoMode = () => {
  const token = localStorage.getItem("accessToken");

  return Boolean(
    token && token.startsWith(DEMO_TOKEN_PREFIX)
  );
};

export const calculateCommitmentAmount = (
  orderAmount,
  percentage = 10
) => {
  const amount = Number(orderAmount) || 0;
  const rate = Number(percentage) || 0;

  return Number(
    ((amount * rate) / 100).toFixed(2)
  );
};

export const payCommitment = async ({
  requestId,
  amount,
  percentage = 10,
}) => {
  if (isDemoMode()) {
    return {
      success: true,
      paymentId: `PAY-DEMO-${Date.now()}`,
      requestId,
      amount: Number(amount),
      percentage: Number(percentage),
      status: "paid",
      paidAt: new Date().toISOString(),
    };
  }

  const { default: api } = await import("./api");

  const response = await api.post(
    "/payments/commitment",
    {
      requestId,
      amount,
      percentage,
    }
  );

  return response.data;
};