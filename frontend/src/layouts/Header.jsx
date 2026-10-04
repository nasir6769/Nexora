import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/authService";
import { ROUTES } from "../routes/routeConfig";

import Avatar from "../components/common/Avatar";
import Dropdown from "../components/common/Dropdown";

import "./Header.css";

function Header() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.email ||
    "User";

  const email = user?.email || "";

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logoutUser();
    } catch {
      // Local logout should still happen.
    } finally {
      logout();
      setIsLoggingOut(false);
      navigate(ROUTES.AUTH.LOGIN, {
        replace: true,
      });
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-brand">
          <span className="header-brand-mark">
            M
          </span>

          <span className="header-brand-name">
            Nexora
          </span>
        </div>
      </div>

      <div className="header-right">
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="header-profile-trigger"
              aria-label="Open account menu"
            >
              <Avatar
                name={displayName}
                size="medium"
              />

              <span className="header-profile-info">
                <strong>{displayName}</strong>

                <span>
                  {role || "User"}
                </span>
              </span>

              <span
                className="header-profile-arrow"
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
          }
        >
          <div className="header-dropdown-user">
            <strong>{displayName}</strong>

            {email && (
              <span>{email}</span>
            )}
          </div>

          <div className="header-dropdown-divider" />

          <button
            type="button"
            data-dropdown-close
            className="header-logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut
              ? "Signing out..."
              : "Sign out"}
          </button>
        </Dropdown>
      </div>
    </header>
  );
}

export default Header;