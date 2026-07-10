import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Calendar, Clock, ClipboardList, LogIn, LogOut, Coffee, Utensils } from 'lucide-react';
import { formatDecimalHours, formatBreakMinutes } from '../../../utils/timeFormatter';

export function CompanyAttendanceView({ myEmployees = [], attendanceHistory = [] }) {
  const FormatMultilineName = ({ name }) => {
    if (!name) return null;
    const parts = name.trim().split(/\s+/);
    return (
      <div className="flex flex-col">
        {parts.map((p, i) => (
          <span key={i} className="leading-tight capitalize">{p}</span>
        ))}
      </div>
    );
  };

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [selectedTasks, setSelectedTasks] = useState(null);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);

  const containerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    if (e.target.closest('button, input, select, a')) return;
    isDown.current = true;
    containerRef.current.classList.add('cursor-grabbing');
    containerRef.current.classList.remove('cursor-grab');
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.classList.remove('cursor-grabbing');
      containerRef.current.classList.add('cursor-grab');
    }
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.classList.remove('cursor-grabbing');
      containerRef.current.classList.add('cursor-grab');
    }
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

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
    const normalizedFilter = statusFilter.toLowerCase() === 'half day' ? 'half-day' : statusFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || 
                          rec.status === normalizedFilter || 
                          (normalizedFilter === 'present' && rec.status === 'late');

    // Employee matches
    const matchesEmployee = employeeFilter === 'All' || rec.employeeId === employeeFilter;

    // Activity matches
    let matchesActivity = true;
    if (activityFilter !== 'All') {
      const isOnMealBreak = rec.breaks?.some(b => b.type !== 'tea' && !b.end);
      const isOnTeaBreak = rec.breaks?.some(b => b.type === 'tea' && !b.end);
      if (activityFilter === 'Active') matchesActivity = rec.checkIn && !rec.checkOut && !isOnMealBreak && !isOnTeaBreak;
      else if (activityFilter === 'Meal Break') matchesActivity = !!isOnMealBreak;
      else if (activityFilter === 'Tea Break') matchesActivity = !!isOnTeaBreak;
    }

    return matchesSearch && matchesStatus && matchesEmployee && matchesActivity;
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
      present: 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400',
      late: 'text-amber-700 bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-400',
      absent: 'text-rose-700 bg-rose-50 border-rose-100 dark:bg-rose-900/30 dark:border-rose-800/50 dark:text-rose-400',
      'half-day': 'text-sky-700 bg-sky-50 border-sky-100 dark:bg-sky-900/30 dark:border-sky-800/50 dark:text-sky-400',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badges[status] || 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700'}`}>
        {status}
      </span>
    );
  };

  const getTeaBreakDetails = (breaks = [], checkOutStr = null) => {
    const teaBreaks = breaks?.filter(b => b.type === 'tea') || [];
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
      if (b.start) {
        let bIn = getSecsFromTime(b.start);
        let endStr = b.end;
        if (!endStr) {
          if (checkOutStr) {
            endStr = checkOutStr;
          } else {
            const now = new Date();
            endStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
          }
        }
        let bOut = getSecsFromTime(endStr);
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
    setActivityFilter('All');
    setEmployeeFilter('All');
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
        <div>
          <h1 className="text-slate-800 dark:text-slate-100" style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Employee Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Track daily check-in/out activities and work hours of your project workforce</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-3xl border border-white dark:border-slate-800 p-6 flex flex-col md:flex-row gap-4 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by employee name or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 bg-slate-50 dark:bg-slate-800 placeholder:text-slate-400 transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-4">
          <div className="relative flex-1 sm:flex-none">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 bg-slate-50 dark:bg-slate-800 font-bold transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 bg-slate-50 dark:bg-slate-800 font-bold transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm font-medium">Activity:</span>
            <select
              value={activityFilter}
              onChange={e => setActivityFilter(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 bg-slate-50 dark:bg-slate-800 font-bold transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Activities</option>
              <option value="Meal Break">Meal Break</option>
              <option value="Tea Break">Tea Break</option>
              <option value="Active">Active</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm font-medium">Employee:</span>
            <select
              value={employeeFilter}
              onChange={e => setEmployeeFilter(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 bg-slate-50 dark:bg-slate-800 font-bold transition-all appearance-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="All">All Employees</option>
              {myEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {(search || dateFilter || statusFilter !== 'All' || activityFilter !== 'All' || employeeFilter !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:text-white bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-500 dark:hover:bg-rose-600 rounded-2xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Attendance History Log Table */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-3xl border border-white dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">{filteredHistory.length} logs found</span>
        </div>

        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="overflow-auto max-h-[600px] cursor-grab select-none custom-scrollbar"
        >
          <table className="w-full text-sm border-collapse">
            <thead className="z-30">
              <tr className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                {['Employee', 'Date', 'Check In / Out', 'Meal Break', 'Tea Break', 'Net Hrs', 'Extra Hrs', 'Less Hrs', 'Status', 'Tasks'].map((h, i) => (
                  <th key={h} className={`sticky top-0 text-left text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest py-4 px-6 whitespace-nowrap bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-md z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.02)] ${i === 0 ? 'min-w-[250px]' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {sortedHistory.map(rec => {
                const emp = myEmployees.find(e => e.id === rec.employeeId);
                const isAbsent = rec.status === 'absent';
                const isOnMealBreak = rec.breaks?.some(b => b.type !== 'tea' && !b.end);
                const isOnTeaBreak = rec.breaks?.some(b => b.type === 'tea' && !b.end);
                return (
                  <tr key={rec.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 bg-white dark:bg-slate-900 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800/50 min-w-[250px] transition-colors">
                      {emp ? (
                        <div
                          className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -ml-2 rounded-xl transition-all"
                          onClick={() => setSelectedRecordDetail({ rec, emp })}
                        >
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-sm font-black overflow-hidden flex-shrink-0 shadow-sm">
                            {emp.avatar && emp.avatar.startsWith('data:image/') ? (
                              <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                            ) : (
                              emp.avatar || (emp.name ? emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '')
                            )}
                          </div>
                          <div>
                            <div className="text-slate-800 dark:text-slate-100 font-bold whitespace-nowrap"><FormatMultilineName name={emp.name} /></div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{emp.position}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">Unknown Employee ({rec.employeeId})</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 whitespace-nowrap font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {rec.date}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {isAbsent ? <span className="text-slate-300 dark:text-slate-600 font-bold font-mono">Null</span> : (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black"><LogIn className="w-3.5 h-3.5" /></span>
                            <span className="text-slate-700 font-mono font-bold">{rec.checkIn || '—'}</span>
                          </div>
                          {rec.checkOut ? (
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-[10px] font-black"><LogOut className="w-3.5 h-3.5" /></span>
                              <span className="text-slate-700 font-mono font-bold">
                                {rec.checkOutDate && rec.checkOutDate !== rec.date && (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1 font-sans tracking-wider uppercase">{rec.checkOutDate}</span>
                                )}
                                {rec.checkOut}
                              </span>
                            </div>
                          ) : rec.checkIn ? (
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black"><Clock className="w-3.5 h-3.5 animate-pulse" /></span>
                              <span className="text-blue-500 text-xs font-bold uppercase tracking-wider animate-pulse">
                                {isOnMealBreak ? 'Meal Break' : isOnTeaBreak ? 'Tea Break' : 'Active'}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {isAbsent ? <span className="text-slate-300 dark:text-slate-600 font-bold font-mono">Null</span> : (
                        rec.breakMinutes > 0 ? (
                          <div className="w-fit text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 border border-amber-100 shadow-sm">
                            <Utensils className="w-3.5 h-3.5" />
                            {formatBreakMinutes(rec.breakMinutes)}
                          </div>
                        ) : (
                          <div className="w-fit text-amber-700/50 bg-amber-50/50 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 border border-amber-100/50 shadow-sm">
                            <Utensils className="w-3.5 h-3.5" />
                            —
                          </div>
                        )
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {isAbsent ? <span className="text-slate-300 dark:text-slate-600 font-bold font-mono">Null</span> : (
                        rec.breaks && rec.breaks.some(b => b.type === 'tea') ? (
                          <div className="w-fit text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 border border-emerald-100 shadow-sm">
                            <Coffee className="w-3.5 h-3.5" />
                            {getTeaBreakDetails(rec.breaks, rec.checkOut)}
                          </div>
                        ) : (
                          <div className="w-fit text-emerald-700/50 bg-emerald-50/50 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 border border-emerald-100/50 shadow-sm">
                            <Coffee className="w-3.5 h-3.5" />
                            —
                          </div>
                        )
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {isAbsent ? <span className="text-slate-300 dark:text-slate-600 font-bold font-mono text-sm">Null</span> : (
                        <div className="w-fit text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-black border border-indigo-100 shadow-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {formatDecimalHours(rec.totalHours)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-black whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {isAbsent ? <span className="text-slate-300 dark:text-slate-600">Null</span> : (rec.extraHours > 0 ? `+${formatDecimalHours(rec.extraHours)}` : '—')}
                    </td>
                    <td className="py-4 px-6 text-rose-600 dark:text-rose-400 font-black whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {isAbsent ? <span className="text-slate-300 dark:text-slate-600">Null</span> : formatDecimalHours(rec.lessHours)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(rec.status)}
                    </td>
                    <td className="py-4 px-6 text-slate-400 dark:text-slate-500">
                      {!isAbsent && rec.tasks && rec.tasks.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedTasks({ name: emp?.name || 'Employee', date: rec.date || 'Today', tasks: rec.tasks })}
                          className="px-3 py-1.5 text-indigo-700 bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center font-black active:scale-95 shadow-sm"
                          title="View Completed Tasks"
                        >
                          <ClipboardList className="w-4 h-4" />
                          <span className="text-[10px] ml-1 font-black">{rec.tasks.length}</span>
                        </button>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm font-bold bg-slate-50/50 dark:bg-slate-800/20">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-500" />
                    No attendance logs found matching filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Tasks Modal */}
      {selectedTasks && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 dark:text-slate-100 font-black text-lg tracking-tight">Tasks Completed</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-bold">{selectedTasks.name} · {selectedTasks.date}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTasks(null)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-black p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95 bg-slate-50 dark:bg-slate-800/50"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                {selectedTasks.tasks && selectedTasks.tasks.length > 0 ? (
                  selectedTasks.tasks.map((task, idx) => (
                    <div key={task._id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl text-sm space-y-2 relative group hover:shadow-md transition-all">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl"></div>
                      <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">{task.description}</p>
                      {task.timeContext && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg w-fit block font-mono uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                          🕒 Logged at {task.timeContext}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 font-bold text-sm py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">No tasks logged for this day.</p>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTasks(null)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm font-black rounded-2xl transition-all cursor-pointer shadow-lg shadow-indigo-500/30 active:scale-95 uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Attendance Details Modal */}
      {selectedRecordDetail && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#f0f2f5] dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-8 overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 dark:text-slate-100 font-black text-2xl tracking-tight">Attendance Details</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-0.5">
                      {new Date(selectedRecordDetail.rec.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecordDetail(null)}
                  className="w-10 h-10 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Grid 1: Check In / Out */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-indigo-50 dark:border-indigo-900/30 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 font-black text-xs uppercase tracking-widest">
                      <LogIn className="w-4 h-4" /> Check In
                    </div>
                    {selectedRecordDetail.rec.checkIn && <span className="text-xs text-indigo-700 dark:text-indigo-300 font-black bg-indigo-100/80 dark:bg-indigo-800/50 px-2 py-0.5 rounded shadow-sm border border-indigo-200/50 dark:border-indigo-700/50 tracking-wide font-mono">{selectedRecordDetail.rec.date}</span>}
                  </div>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {selectedRecordDetail.rec.checkIn || '—'}
                  </div>
                </div>
                <div className="bg-rose-50/30 dark:bg-rose-900/10 rounded-3xl p-5 border border-rose-100 dark:border-rose-900/30 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 font-black text-xs uppercase tracking-widest">
                      <LogOut className="w-4 h-4" /> Check Out
                    </div>
                    {selectedRecordDetail.rec.checkOut && <span className="text-xs text-rose-700 dark:text-rose-300 font-black bg-rose-100/80 dark:bg-rose-800/50 px-2 py-0.5 rounded shadow-sm border border-rose-200/50 dark:border-rose-700/50 tracking-wide font-mono">{selectedRecordDetail.rec.checkOutDate || selectedRecordDetail.rec.date}</span>}
                  </div>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {selectedRecordDetail.rec.checkOut || '—'}
                  </div>
                </div>
              </div>

              {/* Grid 2: Breaks */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-amber-50/50 dark:bg-amber-900/20 rounded-3xl p-5 border border-amber-100 dark:border-amber-900/30 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-black text-xs uppercase tracking-widest mb-3">
                    <Utensils className="w-4 h-4" /> Meal Break
                  </div>
                  <div className="text-lg font-black text-amber-900 dark:text-amber-100" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {selectedRecordDetail.rec.breakMinutes > 0 ? formatBreakMinutes(selectedRecordDetail.rec.breakMinutes) : '—'}
                  </div>
                  {selectedRecordDetail.rec.breaks && selectedRecordDetail.rec.breaks.filter(b => b.type !== 'tea').length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {selectedRecordDetail.rec.breaks.filter(b => b.type !== 'tea').map((b, i) => (
                        <div key={i} className="text-xs font-bold text-amber-700/80 dark:text-amber-400/80 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          {i + 1}{['st', 'nd', 'rd'][i] || 'th'} meal: {b.start} - {b.end || 'Ongoing'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-900/20 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-black text-xs uppercase tracking-widest mb-3">
                    <Coffee className="w-4 h-4" /> Tea Break
                  </div>
                  <div className="text-lg font-black text-emerald-900 dark:text-emerald-100" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {getTeaBreakDetails(selectedRecordDetail.rec.breaks, selectedRecordDetail.rec.checkOut) !== '—' ? getTeaBreakDetails(selectedRecordDetail.rec.breaks, selectedRecordDetail.rec.checkOut) : '—'}
                  </div>
                  {selectedRecordDetail.rec.breaks && selectedRecordDetail.rec.breaks.filter(b => b.type === 'tea').length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {selectedRecordDetail.rec.breaks.filter(b => b.type === 'tea').map((b, i) => (
                        <div key={i} className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {i + 1}{['st', 'nd', 'rd'][i] || 'th'} tea: {b.start} - {b.end || 'Ongoing'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Grid 3: Hours & Status */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="col-span-1 bg-[#f4f7ff] dark:bg-indigo-900/20 rounded-3xl p-5 shadow-sm">
                  <div className="text-[#3b82f6] dark:text-blue-400 font-black text-[10px] uppercase tracking-widest mb-2 leading-tight">Net Hours</div>
                  <div className="text-[#1e3a8a] dark:text-blue-100 font-black text-lg" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatDecimalHours(selectedRecordDetail.rec.totalHours)}
                  </div>
                </div>
                <div className="col-span-1 bg-[#f0fdf4] dark:bg-emerald-900/20 rounded-3xl p-5 shadow-sm">
                  <div className="text-[#10b981] dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-2 leading-tight">Extra Hrs</div>
                  <div className="text-[#065f46] dark:text-emerald-300 font-black text-lg" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {selectedRecordDetail.rec.extraHours > 0 ? `+${formatDecimalHours(selectedRecordDetail.rec.extraHours)}` : '—'}
                  </div>
                </div>
                <div className="col-span-1 bg-[#fff1f2] dark:bg-rose-900/10 rounded-3xl p-5 shadow-sm">
                  <div className="text-[#f43f5e] dark:text-rose-400 font-black text-[10px] uppercase tracking-widest mb-2 leading-tight">Less Hrs</div>
                  <div className="text-[#9f1239] dark:text-rose-300 font-black text-lg" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {selectedRecordDetail.rec.lessHours > 0 ? formatDecimalHours(selectedRecordDetail.rec.lessHours) : '—'}
                  </div>
                </div>
                <div className="col-span-1 bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-center items-center">
                  <div className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2 w-full text-left">Status</div>
                  <div className="w-full">
                    {getStatusBadge(selectedRecordDetail.rec.status)}
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">
                  <ClipboardList className="w-4 h-4" /> Completed Tasks ({selectedRecordDetail.rec.tasks?.length || 0})
                </div>
                <div className="space-y-3">
                  {selectedRecordDetail.rec.tasks && selectedRecordDetail.rec.tasks.length > 0 ? (
                    selectedRecordDetail.rec.tasks.map((task, idx) => (
                      <div key={task._id || idx} className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">{task.description}</p>
                        {task.timeContext && (
                          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> {task.timeContext}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 font-medium">No tasks logged.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
