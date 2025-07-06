import React from "react";
import AttendanceSheet from "../components/attendance/AttendanceSheet";
import Layout from "../layouts/Layout";
import { PiClockCountdownLight } from "react-icons/pi";

const AttendancePage = () => {
  return (
    <Layout>
      <div className="bg-white dark:bg-white p-6 md:p-10 max-w-6xl mx-auto w-full min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-white p-2 rounded-full shadow-md">
            <PiClockCountdownLight className="text-xl animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-900 tracking-tight">
            My Attendance
          </h1>
        </div>

        {/* Alien Attendance Sheet */}
        <div className="rounded-2xl bg-white border border-cyan-500/20 p-4 md:p-6 shadow-lg">
          <AttendanceSheet />
        </div>
      </div>
    </Layout>
  );
};

export default AttendancePage;
