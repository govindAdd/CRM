import React, { useState, useEffect, useRef } from "react";
import Layout from "../layouts/Layout";
import {
  EmployeeRecords,
  LeaveRequests,
  PendingApprovals,
  OnboardingEmployees,
  Resignations,
  NoticePeriod,
  ActiveEmployees,
  SuperAdmins,
} from "../components/hrTabs";
import {
  Users,
  CalendarCheck,
  ClipboardCheck,
  UserPlus,
  LogOut,
  Hourglass,
  UserCheck,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  {
    key: "employees",
    label: "Employee Records",
    icon: Users,
    Component: EmployeeRecords,
  },
  {
    key: "leaves",
    label: "Leave Requests",
    icon: CalendarCheck,
    Component: LeaveRequests,
  },
  {
    key: "approvals",
    label: "Pending Approvals",
    icon: ClipboardCheck,
    Component: PendingApprovals,
  },
  {
    key: "onboarding",
    label: "Onboarding",
    icon: UserPlus,
    Component: OnboardingEmployees,
  },
  {
    key: "resignations",
    label: "Resignations",
    icon: LogOut,
    Component: Resignations,
  },
  {
    key: "notice",
    label: "Notice Period",
    icon: Hourglass,
    Component: NoticePeriod,
  },
  {
    key: "active",
    label: "Active Employees",
    icon: UserCheck,
    Component: ActiveEmployees,
  },
  {
    key: "superadmins",
    label: "Superadmins",
    icon: ShieldCheck,
    Component: SuperAdmins,
  },
];

const HrPage = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const tabKeys = tabs.map((tab) => tab.key);
  const ActiveComponent = tabs.find((tab) => tab.key === activeTab)?.Component;

  const tabListRef = useRef(null);
  const swipeRef = useRef({ xStart: null, xEnd: null });

  // Keyboard navigation
  useEffect(() => {
    const el = tabListRef.current;
    if (!el) return;

    const handleKeyDown = (e) => {
      const idx = tabKeys.indexOf(activeTab);
      if (e.key === "ArrowRight") {
        setActiveTab(tabKeys[(idx + 1) % tabKeys.length]);
      } else if (e.key === "ArrowLeft") {
        setActiveTab(tabKeys[(idx - 1 + tabKeys.length) % tabKeys.length]);
      } else if (e.key === "Home") {
        setActiveTab(tabKeys[0]);
      } else if (e.key === "End") {
        setActiveTab(tabKeys[tabKeys.length - 1]);
      }
    };

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  // Swipe support for mobile
  useEffect(() => {
    const container = tabListRef.current;
    if (!container) return;

    const onTouchStart = (e) => {
      swipeRef.current.xStart = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
      swipeRef.current.xEnd = e.changedTouches[0].clientX;
      const delta = swipeRef.current.xEnd - swipeRef.current.xStart;

      if (Math.abs(delta) > 50) {
        const idx = tabKeys.indexOf(activeTab);
        if (delta < 0) {
          setActiveTab(tabKeys[(idx + 1) % tabKeys.length]);
        } else {
          setActiveTab(tabKeys[(idx - 1 + tabKeys.length) % tabKeys.length]);
        }
      }
    };

    container.addEventListener("touchstart", onTouchStart);
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeTab]);

  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 bg-white dark:bg-neutral-900 shadow-xl rounded-2xl min-h-screen transition-colors">
        {/* Header */}
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 pb-4 flex items-center gap-2 flex-wrap">
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
          HR Management Dashboard
        </h1>
        <hr className="mb-6 h-1 rounded bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 border-0" />

        {/* Tabs */}
        <div
          ref={tabListRef}
          tabIndex={0}
          role="tablist"
          className="outline-none grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6"
        >
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <motion.button
                key={key}
                role="tab"
                aria-selected={isActive}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setActiveTab(key)}
                className={`relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-full border cursor-pointer transition-all duration-200 shadow-sm focus:outline-none whitespace-nowrap ${
                  isActive
                    ? "text-white border-transparent"
                    : "bg-gray-50 text-gray-800 hover:bg-purple-50 border-gray-200 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700 dark:border-neutral-700"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabHighlight"
                    className="absolute inset-0 z-0 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  className="relative z-10 flex items-center gap-2"
                  initial={false}
                  animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden md:inline">{label}</span>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div
          role="tabpanel"
          className="bg-gray-50 dark:bg-neutral-800 p-3 sm:p-4 rounded-xl shadow-inner min-h-[300px] text-gray-800 dark:text-gray-100 transition-all text-sm sm:text-base overflow-x-auto"
        >
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No tab selected</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HrPage;