import {
  FilePlus,
  Layers,
  Filter,
  Ban,
  CheckCircle2,
  Archive,
  UserX,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef, lazy, Suspense } from "react";

// Placeholder fallback for now
const Placeholder = ({ label }) => (
  <div className="text-center text-gray-500 dark:text-gray-400 p-6">
    <p className="text-lg font-medium">{label} — Coming Soon</p>
    <p className="text-sm mt-2">This section is under construction.</p>
  </div>
);

// Replace these with actual lazy-loaded components when ready
const CreateApplication = () => <Placeholder label="Create Application" />;
const AllApplications = () => <Placeholder label="All Applications" />;
const StageWiseView = () => <Placeholder label="Stage-wise View" />;
const RejectedApplications = () => <Placeholder label="Rejected Applications" />;
const HiredCandidates = () => <Placeholder label="Hired Candidates" />;
const ArchivedApplications = () => <Placeholder label="Archived Applications" />;
const BlockedCandidates = () => <Placeholder label="Blocked Candidates" />;

// Tab definitions
const jobTabs = [
  { key: "create", label: "Create", icon: FilePlus, Component: CreateApplication },
  { key: "all", label: "All Applications", icon: Layers, Component: AllApplications },
  { key: "stage", label: "Stages", icon: Filter, Component: StageWiseView },
  { key: "rejected", label: "Rejected", icon: Ban, Component: RejectedApplications },
  { key: "hired", label: "Hired", icon: CheckCircle2, Component: HiredCandidates },
  { key: "archived", label: "Archived", icon: Archive, Component: ArchivedApplications },
  { key: "blocked", label: "Blocked", icon: UserX, Component: BlockedCandidates },
];

// Tab Button UI
const TabButton = ({ isActive, onClick, Icon, label }) => (
  <Tippy content={label}>
    <motion.button
      role="tab"
      aria-selected={isActive}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 shadow-sm whitespace-nowrap focus:outline-none ${
        isActive
          ? "text-white border-transparent"
          : "bg-gray-50 text-gray-800 hover:bg-indigo-50 border-gray-200 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700 dark:border-neutral-700"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabHighlight"
          className="absolute inset-0 z-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <motion.div
        className="relative z-10 flex items-center gap-2"
        animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden md:inline">{label}</span>
      </motion.div>
    </motion.button>
  </Tippy>
);

const Job = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabListRef = useRef(null);
  const tabKeys = jobTabs.map((tab) => tab.key);

  const initialTab = searchParams.get("tab") || "all";
  const [activeTab, setActiveTab] = useState(
    tabKeys.includes(initialTab) ? initialTab : "all"
  );

  // Update URL on tab change
  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  // Handle keyboard navigation
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

  const ActiveComponent = jobTabs.find((tab) => tab.key === activeTab)?.Component;

  return (
    <>
      {/* Tab Buttons */}
      <div
        ref={tabListRef}
        tabIndex={0}
        role="tablist"
        className="outline-none grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6"
      >
        {jobTabs.map(({ key, label, icon: Icon }) => (
          <TabButton
            key={key}
            isActive={activeTab === key}
            onClick={() => setActiveTab(key)}
            Icon={Icon}
            label={label}
          />
        ))}
      </div>

      {/* Active Tab Panel */}
      <div
        role="tabpanel"
        className="bg-gray-50 dark:bg-neutral-800 p-3 sm:p-4 rounded-xl shadow-inner min-h-[300px] text-gray-800 dark:text-gray-100 transition-all text-sm sm:text-base overflow-x-auto"
      >
        <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
          {ActiveComponent ? <ActiveComponent /> : <p>No tab selected</p>}
        </Suspense>
      </div>
    </>
  );
};

export default Job;
