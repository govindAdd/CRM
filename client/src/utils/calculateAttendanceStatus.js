export const calculateAttendanceStatus = (clockIn, clockOut) => {
    const hours = (new Date(clockOut) - new Date(clockIn)) / (1000 * 60 * 60);
    if (hours >= 9) return "present";
    if (hours >= 4.5) return "half-day";
    if (hours >= 1) return "leave";
    return "absent";
  };

  