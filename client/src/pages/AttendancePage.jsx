import React, { useMemo } from "react";
import Layout from "../layouts/Layout";
import { PiClockCountdownLight } from "react-icons/pi";
import AttendanceForm from "../components/attendance/AttendanceForm";
import { useSelector } from "react-redux";
import AttendanceCalendarView from "../components/attendance/AttendanceCalendarView";

const AttendancePage = () => {
  const { user } = useSelector((state) => state.auth);

  const filters = useMemo(
    () => ({
      page: 1,
      limit: 10,
      department: user?.department?._id || undefined,
      employee: user?._id,
    }),
    [user]
  );

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-900 p-6 md:p-10 max-w-6xl mx-auto w-full min-h-screen transition-colors">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-white p-2 rounded-full shadow-md transition-colors">
            <PiClockCountdownLight className="text-xl animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-white tracking-tight transition-colors">
            My Attendance
          </h1>
        </div>

        {/* Attendance Form Section */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-cyan-500/20 dark:border-cyan-400/30 p-4 md:p-6 shadow-lg mb-8 transition-colors">
          <AttendanceForm />
        </div>

        {/* Attendance List Section */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-cyan-500/20 dark:border-cyan-400/30 p-4 md:p-6 shadow-lg transition-colors">
          <AttendanceCalendarView filters={filters} />
        </div>
      </div>
    </Layout>
  );
};

export default AttendancePage;
