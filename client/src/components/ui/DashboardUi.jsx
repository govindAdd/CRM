import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { FiSearch, FiBell } from "react-icons/fi";

const kpiData = [
  { label: "Revenue", value: "$48,500", trend: "+12%" },
  { label: "New Deals", value: "68", trend: "+5.2%" },
  { label: "Tasks", value: "120", trend: "-3.4%" },
];

const chartData = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 3000 },
  { month: "Mar", value: 5000 },
  { month: "Apr", value: 4500 },
  { month: "May", value: 6000 },
  { month: "Jun", value: 7500 },
];

const DashboardUi = () => {
  const [search, setSearch] = useState("");

  return (
    <>
      {/* Search & Notifications */}
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-full max-w-sm">
          <FiSearch className="absolute top-3 left-3 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads, deals..."
            className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-zinc-900"
          />
        </div>
        <div className="ml-4 relative">
          <FiBell className="text-2xl text-gray-600 dark:text-zinc-400" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            3
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {kpiData.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">
              {kpi.label}
            </h3>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
            <span
              className={`text-sm mt-1 inline-block ${
                kpi.trend.includes("-") ? "text-red-500" : "text-green-500"
              }`}
            >
              {kpi.trend}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7e22ce"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default DashboardUi;
