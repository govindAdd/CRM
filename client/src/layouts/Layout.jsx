import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import { Heart } from "lucide-react";
import  useCompanyInfo from "../hooks/info/useCompanyInfo";
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { companyInfo } = useCompanyInfo();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // ESC key to close sidebar
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      {/* Overlay for mobile */}
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
          <div className="w-6" />
        </div>

        {/* Page Content */}
        <main className="flex flex-col flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-transparent p-6 md:p-10">
          <div className="flex-grow">{children}</div>

          <footer className="mt-auto w-full py-6 text-center border-t border-zinc-100 dark:border-neutral-800/50">
            <div className="mx-auto max-w-[90ch] px-4">
              <p className="text-xs md:text-sm text-zinc-500/90 dark:text-zinc-400/80">
                © 2025{" "}
                <span className="font-god tracking-widest text-zinc-700 dark:text-zinc-200">
                  {companyInfo?.LEGAL_NAME}
                </span>
                . All rights reserved.
                <span className="hidden md:inline"> • </span>
                <br className="md:hidden" />
                <span className="inline-flex items-center justify-center mt-1 md:mt-0 text-xs md:text-sm">
                  Crafted with
                  <Heart className="mx-1 text-red-500/90 w-3.5 h-3.5 md:w-4 md:h-4 fill-red-500/90" />
                  in Vrindavan Mathura
                </span>
              </p>

              {/* <div className="mt-3 flex justify-center space-x-4 text-[0.7rem] md:text-xs">
                <a
                  href="/terms"
                  className="text-zinc-500/70 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Terms
                </a>
                <span className="text-zinc-400/50">|</span>
                <a
                  href="/privacy"
                  className="text-zinc-500/70 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Privacy
                </a>
                <span className="text-zinc-400/50">|</span>
                <a
                  href="/legal"
                  className="text-zinc-500/70 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Legal
                </a>
              </div> */}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
