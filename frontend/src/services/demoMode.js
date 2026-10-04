const DEMO_TOKEN_PREFIX = "demo-token-";

export const isDemoMode = () => {
  const token = localStorage.getItem("accessToken");

  return Boolean(
    token && token.startsWith(DEMO_TOKEN_PREFIX)
  );
};

export const getDemoRole = () => {
  const token = localStorage.getItem("accessToken");

  if (!token?.startsWith(DEMO_TOKEN_PREFIX)) {
    return null;
  }

  return token.replace(DEMO_TOKEN_PREFIX, "");
};