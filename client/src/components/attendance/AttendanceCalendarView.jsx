// AttendanceCalendarView.jsx

import React, { useEffect, useState, useRef } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import * as XLSX from "xlsx";
import { useGetAllAttendance } from "../../hooks/attendance/useGetAllAttendance";
import { exportToPDF } from "../../utils/exportToPDF";
import { Calendar, Clock, Star, DownloadCloud, FileText } from "lucide-react";

// Status gradient and color utilities
const getStatusGradient = (status) => {
  switch (status) {
    case "present": return "from-lime-400 to-green-500";
    case "leave": return "from-rose-400 to-pink-600";
    case "weekoff": return "from-sky-400 to-indigo-600";
    case "half-day": return "from-amber-400 to-yellow-600";
    case "absent": return "from-gray-400 to-gray-600";
    case "holiday": return "from-purple-400 to-purple-700";
    default: return "from-gray-400 to-gray-600";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "present": return "bg-green-500";
    case "leave": return "bg-pink-500";
    case "weekoff": return "bg-blue-500";
    case "half-day": return "bg-yellow-400";
    case "absent": return "bg-gray-400";
    case "holiday": return "bg-purple-600";
    default: return "bg-gray-300";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "present": return "Present";
    case "leave": return "Leave";
    case "weekoff": return "WeekOff";
    case "half-day": return "Half Day";
    case "absent": return "Absent";
    case "holiday": return "Holiday";
    default: return "Unknown";
  }
};

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AttendanceCalendarView = ({ filters = {} }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { records, fetchAttendance, isLoading } = useGetAllAttendance();
  const divRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
    fetchAttendance({ ...filters, startDate, endDate });
  }, [currentDate, filters, fetchAttendance]);

  const todayStr = new Date().toLocaleDateString("en-CA");
  const isCompact = windowWidth <= 768;

  const navigateMonth = (dir) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (dir === "next" ? 1 : -1));
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Padding for the first week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square w-full" />);
    }

    // Fill days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d).toLocaleDateString("en-CA");
      const dayData = records.find((r) => {
        if (!r.date) return false;
        const attendanceDateStr = new Date(r.date).toLocaleDateString("en-CA");
        return attendanceDateStr === dateStr;
      });

      const isToday = todayStr === dateStr;
      const isVisible = statusFilter === "all" || dayData?.status === statusFilter;
      if (!isVisible) continue;

      const card = (
        <div
          className={`aspect-square w-full p-1 flex flex-col items-center justify-center transition-all duration-200 border text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl relative overflow-hidden group
            ${isCompact
              ? `rounded-full ${dayData ? getStatusColor(dayData.status) : "bg-gray-200 dark:bg-gray-700"}`
              : `rounded-2xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-cyan-400 ${isToday ? "ring-2 ring-cyan-500 scale-[1.03]" : ""}`
          }`}
          onClick={() => dayData && setSelectedDay(dayData)}
        >
          <span className={`${isCompact ? "text-white" : "text-gray-800 dark:text-white"}`}>{d}</span>
          {!isCompact && dayData && (
            <>
              <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r ${getStatusGradient(dayData.status)}`}>
                {getStatusText(dayData.status)}
              </span>
              {(dayData.clockIn || dayData.clockOut) && (
                <div className="hidden md:flex flex-col text-xs text-center mt-auto gap-0.5">
                  {dayData.clockIn && (
                    <div className="text-lime-600 dark:text-lime-400 font-medium">
                      <Clock className="inline-block w-4 h-4 mr-1" />
                      {new Date(dayData.clockIn).toLocaleTimeString()}
                    </div>
                  )}
                  {dayData.clockOut && (
                    <div className="text-rose-500 dark:text-rose-400 font-medium">
                      <Clock className="inline-block w-4 h-4 mr-1 rotate-180" />
                      {new Date(dayData.clockOut).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}
              {dayData.remarks && (
                <p className="text-[10px] text-center text-gray-500 mt-1 truncate">
                  {dayData.remarks}
                </p>
              )}
              <Star className="absolute top-2 right-2 w-3 h-3 text-yellow-300 dark:text-yellow-500 opacity-70 group-hover:scale-110 transition-transform" />
            </>
          )}
        </div>
      );

      days.push(
        <Tippy
          key={d}
          content={dayData ? (
            <>
              <strong>{getStatusText(dayData.status)}</strong><br />
              IN: {new Date(dayData.clockIn).toLocaleTimeString()}<br />
              OUT: {dayData.clockOut ? new Date(dayData.clockOut).toLocaleTimeString() : "—"}
            </>
          ) : "No Data"}
        >
          <div ref={divRef}>{card}</div>
        </Tippy>
      );
    }

    return days;
  };

  const summary = {
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    leave: records.filter((r) => r.status === "leave").length,
    weekoff: records.filter((r) => r.status === "weekoff").length,
    halfday: records.filter((r) => r.status === "half-day").length,
    holiday: records.filter((r) => r.status === "holiday").length,
    total: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(),
  };

  const exportToExcel = () => {
    const data = records.map((r) => ({
      Date: new Date(r.date).toLocaleDateString("en-IN"),
      Status: getStatusText(r.status),
      ClockIn: r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : "-",
      ClockOut: r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : "-",
      Remarks: r.remarks || "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "Attendance.xlsx");
  };

  const handleExportPDF = () => exportToPDF(records, getStatusText);

  return (
    <div className="w-full max-w-[1920px] mx-auto p-4 sm:p-6 rounded-xl bg-white dark:bg-gray-900 shadow-xl space-y-6">
      {/* Top Controls */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigateMonth("prev")} className="btn btn-sm px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500">
              ← Prev
            </button>
            <div className="flex items-center gap-2 text-lg font-bold">
              <Calendar className="w-5 h-5 text-cyan-500" />
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <button onClick={() => navigateMonth("next")} className="btn btn-sm px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500">
              Next →
            </button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded border dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
            <option value="weekoff">WeekOff</option>
            <option value="half-day">Half Day</option>
            <option value="holiday">Holiday</option>
          </select>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase">
        {weekdayNames.map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 auto-rows-fr min-h-[300px]">
        {isLoading
          ? [...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square h-full w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
            ))
          : renderCalendar()}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs sm:text-sm md:text-base lg:text-lg font-semibold">
        <div className="bg-green-600 text-white p-2 rounded-lg">Present: {summary.present}</div>
        <div className="bg-gray-600 text-white p-2 rounded-lg">Absent: {summary.absent}</div>
        <div className="bg-pink-600 text-white p-2 rounded-lg">Leave: {summary.leave}</div>
        <div className="bg-blue-600 text-white p-2 rounded-lg">Week Off: {summary.weekoff}</div>
        <div className="bg-yellow-400 text-black p-2 rounded-lg">Half Day: {summary.halfday}</div>
        <div className="bg-purple-600 text-white p-2 rounded-lg">Holiday: {summary.holiday}</div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 justify-end">
        <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-500 w-full sm:w-auto">
          <DownloadCloud className="w-4 h-4" /> Export Excel
        </button>
        <button onClick={handleExportPDF} className="flex items-center justify-center gap-2 bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-500 w-full sm:w-auto">
          <FileText className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {/* Selected Day Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
            <h2 className="text-lg font-bold mb-4">Attendance Details - {new Date(selectedDay.date).toLocaleDateString("en-IN")}</h2>
            <p><strong>Status:</strong> {getStatusText(selectedDay.status)}</p>
            <p><strong>Clock In:</strong> {selectedDay.clockIn ? new Date(selectedDay.clockIn).toLocaleTimeString() : "-"}</p>
            <p><strong>Clock Out:</strong> {selectedDay.clockOut ? new Date(selectedDay.clockOut).toLocaleTimeString() : "-"}</p>
            <p><strong>Remarks:</strong> {selectedDay.remarks || "None"}</p>
            <button onClick={() => setSelectedDay(null)} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 w-full">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendarView;
