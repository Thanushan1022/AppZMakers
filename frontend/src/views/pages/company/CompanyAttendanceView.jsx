import React, { useState } from 'react';
import { Search, Calendar, Clock } from 'lucide-react';
import { formatDecimalHours, formatBreakMinutes } from '../../../utils/timeFormatter';

export function CompanyAttendanceView({ myEmployees = [], attendanceHistory = [] }) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter attendance history based on search, date, and status
  const filteredHistory = attendanceHistory.filter(rec => {
    const emp = myEmployees.find(e => e.id === rec.employeeId);
    
    // Search query matches employee name or position
    const matchesSearch = search === '' || (emp && (
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.position.toLowerCase().includes(search.toLowerCase())
    ));

    // Date matches exactly
    const matchesDate = dateFilter === '' || rec.date === dateFilter;

    // Status matches
    const matchesStatus = statusFilter === 'All' || rec.status === statusFilter.toLowerCase();

    return matchesSearch && matchesDate && matchesStatus;
  });

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
                {['Employee', 'Date', 'Check In', 'Check Out', 'Meal Break', 'Tea Break', 'Net Hours', 'Extra Hours', 'Less Hours', 'Status'].map(h => (
                  <th key={h} className="text-left text-slate-400 font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredHistory.map(rec => {
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
                        ) : (rec.checkIn ? <span className="text-emerald-500 text-xs font-semibold">Active</span> : '—')
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
    </div>
  );
}
