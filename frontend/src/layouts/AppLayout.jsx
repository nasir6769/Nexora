import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

import "./AppLayout.css";

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-shell">
        <Header />

        <main className="app-main">
          <div className="app-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;