import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Zap,
  Star
} from 'lucide-react';

const AttendanceSheet = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const generateSampleData = () => {
      const data = [];
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const statuses = ['present', 'leave', 'weekoff', 'halfday'];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        let status;

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          status = Math.random() > 0.7 ? 'present' : 'weekoff';
        } else {
          status = statuses[Math.floor(Math.random() * statuses.length)];
        }

        const checkIn = status === 'present' || status === 'halfday'
          ? `${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
          : undefined;

        const checkOut = checkIn
          ? `${17 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
          : undefined;

        data.push({
          date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          status,
          checkIn,
          checkOut
        });
      }

      setAttendanceData(data);
    };

    generateSampleData();
  }, [currentDate]);

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      direction === 'prev'
        ? newDate.setMonth(newDate.getMonth() - 1)
        : newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'from-lime-400 to-green-500';
      case 'leave': return 'from-rose-400 to-pink-600';
      case 'weekoff': return 'from-sky-400 to-indigo-600';
      case 'halfday': return 'from-amber-400 to-yellow-600';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'leave': return 'Leave';
      case 'weekoff': return 'Week Off';
      case 'halfday': return 'Half Day';
      default: return 'Unknown';
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={`header-${i}`} className="text-center text-gray-600 font-bold text-xs mb-2 tracking-widest uppercase">
          {dayNames[i]}
        </div>
      );
    }

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = attendanceData.find((d) => d.date === dateStr);

      days.push(
        <div key={day} className="aspect-square">
          <div className="h-full bg-white border border-gray-200 rounded-xl hover:border-cyan-400 transition-all group p-2 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-900 text-sm font-semibold">{day}</span>
              <Star className="w-3 h-3 text-gray-400 group-hover:text-cyan-500" />
            </div>

            {dayData && (
              <>
                <div className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r ${getStatusColor(dayData.status)} shadow-sm text-center w-fit mx-auto`}>
                  {getStatusText(dayData.status)}
                </div>

                {dayData.checkIn && (
                  <div className="text-[10px] mt-auto pt-2 space-y-1">
                    <div className="flex items-center gap-1 text-lime-600">
                      <Clock className="w-3 h-3" />
                      <span>{dayData.checkIn}</span>
                    </div>
                    {dayData.checkOut && (
                      <div className="flex items-center gap-1 text-rose-500">
                        <Clock className="w-3 h-3" />
                        <span>{dayData.checkOut}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <button onClick={() => navigateMonth('prev')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-white hover:from-cyan-500 hover:to-purple-500 transition-all">
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <div className="flex items-center gap-3 text-gray-900">
          <Calendar className="w-5 h-5 text-cyan-500" />
          <h2 className="text-xl font-bold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <button onClick={() => navigateMonth('next')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white hover:from-purple-500 hover:to-cyan-500 transition-all">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {renderCalendar()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        {[
          { label: 'Present Days', value: attendanceData.filter(d => d.status === 'present').length, color: 'from-lime-400 to-green-500', icon: Zap },
          { label: 'Leave Days', value: attendanceData.filter(d => d.status === 'leave').length, color: 'from-rose-400 to-pink-600', icon: Calendar },
          { label: 'Week Offs', value: attendanceData.filter(d => d.status === 'weekoff').length, color: 'from-sky-400 to-indigo-600', icon: Star },
          { label: 'Half Days', value: attendanceData.filter(d => d.status === 'halfday').length, color: 'from-amber-400 to-yellow-600', icon: Clock }
        ].map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">{stat.label}</p>
                <p className="text-gray-900 text-xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceSheet;
