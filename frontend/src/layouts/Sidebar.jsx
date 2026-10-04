import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../routes/routeConfig";

import "./Sidebar.css";

const merchantNavigation = [
  {
    label: "Dashboard",
    path: ROUTES.MERCHANT.DASHBOARD,
  },
  {
    section: "Inventory",
    items: [
      {
        label: "Inventory",
        path: ROUTES.MERCHANT.INVENTORY,
      },
      {
        label: "Add Inventory",
        path: ROUTES.MERCHANT.ADD_INVENTORY,
      },
    ],
  },
  {
    section: "Procurement",
    items: [
      {
        label: "Procurement",
        path: ROUTES.MERCHANT.PROCUREMENT,
      },
    ],
  },
  {
    section: "Resale",
    items: [
      {
        label: "Resale Marketplace",
        path: ROUTES.MERCHANT.RESALE,
      },
      {
        label: "My Listings",
        path: ROUTES.MERCHANT.MY_LISTINGS,
      },
    ],
  },
  {
    section: "Orders",
    items: [
      {
        label: "Orders",
        path: ROUTES.MERCHANT.ORDERS,
      },
    ],
  },
  {
    section: "Account",
    items: [
      {
        label: "Profile",
        path: ROUTES.MERCHANT.PROFILE,
      },
    ],
  },
];

const supplierNavigation = [
  {
    label: "Dashboard",
    path: ROUTES.SUPPLIER.DASHBOARD,
  },
  {
    section: "Products",
    items: [
      {
        label: "Products",
        path: ROUTES.SUPPLIER.PRODUCTS,
      },
      {
        label: "Add Product",
        path: ROUTES.SUPPLIER.ADD_PRODUCT,
      },
    ],
  },
  {
    section: "Orders",
    items: [
      {
        label: "Orders",
        path: ROUTES.SUPPLIER.ORDERS,
      },
    ],
  },
];

const adminNavigation = [
  {
    label: "Dashboard",
    path: ROUTES.ADMIN.DASHBOARD,
  },
  {
    section: "Procurement",
    items: [
      {
        label: "Procurement",
        path: ROUTES.ADMIN.PROCUREMENT,
      },
    ],
  },
  {
    section: "Suppliers",
    items: [
      {
        label: "Suppliers",
        path: ROUTES.ADMIN.SUPPLIERS,
      },
    ],
  },
  {
    section: "Orders",
    items: [
      {
        label: "Orders",
        path: ROUTES.ADMIN.ORDERS,
      },
    ],
  },
  {
    section: "Logistics",
    items: [
      {
        label: "Logistics",
        path: ROUTES.ADMIN.LOGISTICS,
      },
    ],
  },
];

function Sidebar() {
  const { user } = useAuth();

  const role = String(user?.role || "").toLowerCase();

  const navigation =
    role === "supplier"
      ? supplierNavigation
      : role === "admin"
        ? adminNavigation
        : merchantNavigation;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">M</div>

        <div>
          <div className="sidebar-brand-name">
            Nexora
          </div>

          <div className="sidebar-brand-subtitle">
            B2B Platform
          </div>
        </div>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-workspace">
        <span className="sidebar-workspace-label">
          Current workspace
        </span>

        <strong>
          {role
            ? role.charAt(0).toUpperCase() + role.slice(1)
            : "Workspace"}
        </strong>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((group, index) => {
          if (group.path) {
            return (
              <NavLink
                key={group.path}
                to={group.path}
                end
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "sidebar-link-active" : ""
                  }`
                }
              >
                <span className="sidebar-link-icon">▣</span>
                <span>{group.label}</span>
              </NavLink>
            );
          }

          return (
            <div
              className="sidebar-section"
              key={group.section || index}
            >
              <div className="sidebar-section-title">
                {group.section}
              </div>

              <div className="sidebar-section-items">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link ${
                        isActive ? "sidebar-link-active" : ""
                      }`
                    }
                  >
                    <span className="sidebar-link-icon">▣</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-footer-label">
          Signed in as
        </span>

        <strong>{user?.name || "User"}</strong>
      </div>
    </aside>
  );
}

export default Sidebar;