import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MerchantProfile from "../pages/merchant/MerchantProfile";
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import MerchantDashboard from "../pages/merchant/MerchantDashboard";
import MerchantInventory from "../pages/merchant/MerchantInventory";
import AddInventory from "../pages/merchant/AddInventory";
import MerchantProcurement from "../pages/merchant/MerchantProcurement";
import MerchantProcurementRequest from "../pages/merchant/MerchantProcurementRequest";
import MerchantResale from "../pages/merchant/MerchantResale";
import MyListings from "../pages/merchant/MyListings";
import CreateResaleListing from "../pages/merchant/CreateResaleListing";
import MerchantResaleRequest from "../pages/merchant/MerchantResaleRequest";
import MerchantOrders from "../pages/merchant/MerchantOrders";

import SupplierDashboard from "../pages/supplier/SupplierDashboard";
import SupplierProducts from "../pages/supplier/SupplierProducts";
import SupplierProductForm from "../pages/supplier/SupplierProductForm";
import SupplierOrders from "../pages/supplier/SupplierOrders";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProcurement from "../pages/admin/AdminProcurement";
import AdminSuppliers from "../pages/admin/AdminSuppliers";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminLogistics from "../pages/admin/AdminLogistics";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import { ROUTES } from "./routeConfig";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            AUTH
        ========================= */}

        <Route element={<AuthLayout />}>
          <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
          <Route path={ROUTES.AUTH.REGISTER} element={<Register />} />
        </Route>

        {/* =========================
            PROTECTED APPLICATION
        ========================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* =========================
                MERCHANT
            ========================= */}

            <Route element={<RoleRoute allowedRoles="merchant" />}>
              <Route
                path={ROUTES.MERCHANT.DASHBOARD}
                element={<MerchantDashboard />}
              />

              <Route
                path={ROUTES.MERCHANT.INVENTORY}
                element={<MerchantInventory />}
              />

              <Route
                path={ROUTES.MERCHANT.ADD_INVENTORY}
                element={<AddInventory />}
              />

              <Route
                path={ROUTES.MERCHANT.PROCUREMENT}
                element={<MerchantProcurement />}
              />

              <Route
                path={ROUTES.MERCHANT.PROCUREMENT_REQUEST}
                element={<MerchantProcurementRequest />}
              />

              <Route
                path={ROUTES.MERCHANT.RESALE}
                element={<MerchantResale />}
              />

              <Route
                path={ROUTES.MERCHANT.CREATE_RESALE}
                element={<CreateResaleListing />}
              />

              <Route
                path={ROUTES.MERCHANT.MY_LISTINGS}
                element={<MyListings />}
              />

              <Route
                path={ROUTES.MERCHANT.RESALE_REQUEST}
                element={<MerchantResaleRequest />}
              />

              <Route
                path={ROUTES.MERCHANT.ORDERS}
                element={<MerchantOrders />}
              />
              <Route
                 path={ROUTES.MERCHANT.PROFILE}
                   element={<MerchantProfile />}
                />
            </Route>

            {/* =========================
                SUPPLIER
            ========================= */}

            <Route element={<RoleRoute allowedRoles="supplier" />}>
              <Route
                path={ROUTES.SUPPLIER.DASHBOARD}
                element={<SupplierDashboard />}
              />

              <Route
                path={ROUTES.SUPPLIER.PRODUCTS}
                element={<SupplierProducts />}
              />

              <Route
                path={ROUTES.SUPPLIER.ADD_PRODUCT}
                element={<SupplierProductForm />}
              />

              <Route
                path={ROUTES.SUPPLIER.EDIT_PRODUCT}
                element={<SupplierProductForm />}
              />

              <Route
                path={ROUTES.SUPPLIER.ORDERS}
                element={<SupplierOrders />}
              />
            </Route>

            {/* =========================
                ADMIN
            ========================= */}

            <Route element={<RoleRoute allowedRoles="admin" />}>
              <Route
                path={ROUTES.ADMIN.DASHBOARD}
                element={<AdminDashboard />}
              />

              <Route
                path={ROUTES.ADMIN.PROCUREMENT}
                element={<AdminProcurement />}
              />

              <Route
                path={ROUTES.ADMIN.SUPPLIERS}
                element={<AdminSuppliers />}
              />

              <Route
                path={ROUTES.ADMIN.ORDERS}
                element={<AdminOrders />}
              />

              <Route
                path={ROUTES.ADMIN.LOGISTICS}
                element={<AdminLogistics />}
              />
            </Route>
          </Route>
        </Route>

        {/* =========================
            FALLBACK
        ========================= */}

        <Route
          path={ROUTES.HOME}
          element={<Navigate to={ROUTES.AUTH.LOGIN} replace />}
        />

        <Route
          path="*"
          element={<Navigate to={ROUTES.HOME} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;