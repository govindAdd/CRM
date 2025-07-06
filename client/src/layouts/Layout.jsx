import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Sidebar from "../components/Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      {/* Transparent Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-transparent md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 text-white transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 px-4 py-3 shadow-sm flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-700 dark:text-white"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="text-2xl" />
          </button>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="w-6" /> {/* spacer */}
        </div>

        {/* Page Content */}
        <main className="flex flex-col flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-transparent p-6 md:p-10">
          <div className="flex-grow">{children}</div>

          <footer className="mt-auto text-sm text-center text-zinc-500 pt-6">
            © 2025 Add God PVT LTD. All rights reserved.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
