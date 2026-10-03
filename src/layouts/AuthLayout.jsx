import { Outlet } from "react-router-dom";

import "./AuthLayout.css";

function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout-brand">
        <div className="auth-layout-logo">
          M
        </div>

        <div className="auth-layout-brand-text">
          <strong>Merchant Network</strong>
          <span>B2B Commerce Platform</span>
        </div>
      </div>

      <main className="auth-layout-main">
        <Outlet />
      </main>

      <footer className="auth-layout-footer">
        <span>
          Merchant Network
        </span>

        <span>
          Secure B2B commerce
        </span>
      </footer>
    </div>
  );
}

export default AuthLayout;