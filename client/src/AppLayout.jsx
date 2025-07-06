import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";

const AppLayout = () => {
  const location = useLocation();
  const hideSidebar = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar />}
      <main className="flex-1 min-h-screen bg-gray-50 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
