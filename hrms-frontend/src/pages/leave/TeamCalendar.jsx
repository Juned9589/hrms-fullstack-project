import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeamCalendarApi } from '../../api/leave.api';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/helpers';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TeamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['teamCalendar', year, month],
    queryFn: () => getTeamCalendarApi({ year, month }),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (isLoading) {
    return <Spinner fullPage />;
  }

  const leaves = calendarData?.leaves || [];
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Unique color cyclist for employees on leave
  const colors = [
    'bg-[#D4AF37]/15 text-[#8A6514]',
    'bg-cyan-500/15 text-[#8A6514]',
    'bg-emerald-500/15 text-emerald-300',
    'bg-[#D4AF37]/15 text-[#8A6514]',
    'bg-rose-500/15 text-rose-300',
    'bg-[#E0F7FA] text-[#006064]',
    'bg-[#FCE4EC] text-[#880E4F]',
    'bg-[#FFF3E0] text-[#E65100]',
  ];

  const getEmpColor = (empName) => {
    let hash = 0;
    for (let i = 0; i < empName.length; i++) {
      hash = empName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="animate-fadeInUp space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 leading-tight">
            Team Calendar
          </h2>
          <p className="text-slate-500 text-sm mt-1">Global department schedules and approved employee leaves.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-white/70 hover:bg-white/70 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 text-slate-500" />
          </button>
          <span className="text-sm font-semibold text-slate-950 min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-white/70 hover:bg-white/70 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="bg-white/70 rounded-2xl border border-white/70 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-7 gap-px bg-[#343437] rounded-xl overflow-hidden">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="bg-white/70 text-center py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}

          {daysInMonth.map((day, idx) => {
            const activeLeaves = leaves.filter((leave) => {
              const start = new Date(leave.fromDate);
              const end = new Date(leave.toDate);
              return day >= start && day <= end;
            });

            return (
              <div key={idx} className="bg-white/70 min-h-[100px] p-2 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 leading-none">{format(day, 'd')}</span>
                <div className="space-y-1 mt-2">
                  {activeLeaves.map((leave, lIdx) => (
                    <div
                      key={lIdx}
                      title={`${leave.employeeName}: ${leave.leaveTypeName}`}
                      className={`text-[9px] font-semibold rounded-md px-1.5 py-0.5 truncate ${getEmpColor(
                        leave.employeeName
                      )}`}
                    >
                      {leave.employeeName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
