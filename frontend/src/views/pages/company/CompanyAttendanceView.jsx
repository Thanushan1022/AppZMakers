import React, { useState } from 'react';
import { Search, Calendar, Clock, ClipboardList } from 'lucide-react';
import { formatDecimalHours, formatBreakMinutes } from '../../../utils/timeFormatter';

export function CompanyAttendanceView({ myEmployees = [], attendanceHistory = [] }) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTasks, setSelectedTasks] = useState(null);

  // Resolve logs: if dateFilter is specified, ensure all employees are shown (generate virtual absent logs if missing)
  const resolvedLogs = React.useMemo(() => {
    if (!dateFilter) return attendanceHistory;
    return myEmployees.map(emp => {
      const existing = attendanceHistory.find(rec => rec.employeeId === emp.id && rec.date === dateFilter);
      if (existing) return existing;
      return {
        id: `virtual-absent-${emp.id}-${dateFilter}`,
        employeeId: emp.id,
        date: dateFilter,
        status: 'absent',
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        breakMinutes: 0,
        extraHours: 0,
        lessHours: 0,
        breaks: []
      };
    });
  }, [myEmployees, attendanceHistory, dateFilter]);

  // Filter attendance logs based on search and status
  const filteredHistory = resolvedLogs.filter(rec => {
    const emp = myEmployees.find(e => e.id === rec.employeeId);
    
    // Search query matches employee name or position
    const matchesSearch = search === '' || (emp && (
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.position.toLowerCase().includes(search.toLowerCase())
    ));

    // Status matches
    const matchesStatus = statusFilter === 'All' || rec.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Sort logs: present/late employees first sorted by check-in time, then absent employees
  const sortedHistory = React.useMemo(() => {
    return [...filteredHistory].sort((recA, recB) => {
      const isPresentA = recA && recA.status !== 'absent';
      const isPresentB = recB && recB.status !== 'absent';
      
      if (isPresentA && !isPresentB) return -1;
      if (!isPresentA && isPresentB) return 1;
      
      if (isPresentA && isPresentB) {
        const timeA = recA.checkIn || '99:99:99';
        const timeB = recB.checkIn || '99:99:99';
        return timeA.localeCompare(timeB);
      }
      
      const empA = myEmployees.find(e => e.id === recA.employeeId);
      const empB = myEmployees.find(e => e.id === recB.employeeId);
      if (empA && empB) {
        return empA.name.localeCompare(empB.name);
      }
      return 0;
    });
  }, [filteredHistory, myEmployees]);

  const getStatusBadge = (status) => {
    const badges = {
      present: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      late: 'text-amber-700 bg-amber-50 border-amber-100',
      absent: 'text-rose-700 bg-rose-50 border-rose-100',
      'half-day': 'text-sky-700 bg-sky-50 border-sky-100',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badges[status] || 'bg-slate-50 text-slate-600 border-slate-100'} capitalize`}>
        {status}
      </span>
    );
  };

  const getTeaBreakDetails = (breaks = []) => {
    const teaBreaks = breaks.filter(b => b.type === 'tea');
    const count = teaBreaks.length;
    if (count === 0) return '—';
    
    const getSecsFromTime = (tStr) => {
      if (!tStr) return 0;
      const parts = tStr.split(':').map(Number);
      const h = parts[0] || 0;
      const m = parts[1] || 0;
      const s = parts[2] || 0;
      return h * 3600 + m * 60 + s;
    };
    
    let totalSecs = 0;
    teaBreaks.forEach(b => {
      if (b.start && b.end) {
        let bIn = getSecsFromTime(b.start);
        let bOut = getSecsFromTime(b.end);
        if (bOut < bIn) bOut += 86400;
        totalSecs += (bOut - bIn);
      }
    });
    
    const totalMins = Math.round(totalSecs / 60);
    return `${count}-${totalMins} min`;
  };

  const handleResetFilters = () => {
    setSearch('');
    setDateFilter('');
    setStatusFilter('All');
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Employee Attendance</h1>
        <p className="text-slate-500 text-sm mt-0.5">Track daily check-in/out activities and work hours of your project workforce</p>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-border p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by employee name or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
          />
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-border rounded-xl text-sm text-slate-600 focus:outline-none bg-slate-50 font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-border rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none bg-slate-50 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="half-day">Half Day</option>
            <option value="absent">Absent</option>
          </select>

          {(search || dateFilter || statusFilter !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Attendance History Log Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-slate-500 text-sm">{filteredHistory.length} logs found</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                {['Employee', 'Date', 'Check In', 'Check Out', 'Meal Break', 'Tea Break', 'Net Hours', 'Extra Hours', 'Less Hours', 'Status', 'Tasks'].map(h => (
                  <th key={h} className="text-left text-slate-400 font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedHistory.map(rec => {
                const emp = myEmployees.find(e => e.id === rec.employeeId);
                const isAbsent = rec.status === 'absent';
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      {emp ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-xs font-bold">{emp.avatar}</div>
                          <div>
                            <div className="text-slate-700 font-medium whitespace-nowrap">{emp.name}</div>
                            <div className="text-slate-400 text-xs">{emp.position}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Unknown Employee ({rec.employeeId})</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {rec.date}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {isAbsent ? 'Null' : (rec.checkIn || '—')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {isAbsent ? 'Null' : (
                        rec.checkOut ? (
                          <>
                            {rec.checkOutDate && rec.checkOutDate !== rec.date && (
                              <span className="text-[10px] text-slate-400 block font-sans mb-0.5">{rec.checkOutDate}</span>
                            )}
                            <span>{rec.checkOut}</span>
                          </>
                        ) : (rec.checkIn ? (
                          rec.onBreak ? (
                            <span className="text-amber-500 text-xs font-semibold">Meal Break</span>
                          ) : rec.onTeaBreak ? (
                            <span className="text-amber-500 text-xs font-semibold">Tea Break</span>
                          ) : (
                            <span className="text-emerald-500 text-xs font-semibold">Active</span>
                          )
                        ) : '—')
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {isAbsent ? 'Null' : formatBreakMinutes(rec.breakMinutes)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {isAbsent ? 'Null' : getTeaBreakDetails(rec.breaks)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {isAbsent ? 'Null' : formatDecimalHours(rec.totalHours)}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 font-medium whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {isAbsent ? 'Null' : (rec.extraHours > 0 ? `+${formatDecimalHours(rec.extraHours)}` : '—')}
                    </td>
                    <td className="py-3 px-4 text-red-500 font-medium whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {isAbsent ? 'Null' : formatDecimalHours(rec.lessHours)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(rec.status)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {!isAbsent && rec.tasks && rec.tasks.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedTasks({ name: emp?.name || 'Employee', date: rec.date || 'Today', tasks: rec.tasks })}
                          className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center font-semibold"
                          title="View Completed Tasks"
                        >
                          <ClipboardList className="w-4 h-4" />
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full ml-1 font-bold">{rec.tasks.length}</span>
                        </button>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    No attendance logs found matching filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Tasks Modal */}
      {selectedTasks && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-slate-800 font-bold text-base">Tasks Completed</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{selectedTasks.name} · {selectedTasks.date}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTasks(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {selectedTasks.tasks && selectedTasks.tasks.length > 0 ? (
                  selectedTasks.tasks.map((task, idx) => (
                    <div key={task._id || idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm space-y-1">
                      <p className="text-slate-700 font-medium leading-relaxed">{task.description}</p>
                      {task.timeContext && (
                        <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full w-fit block font-mono">
                          🕒 Logged at {task.timeContext}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm py-4 text-center">No tasks logged for this day.</p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTasks(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
