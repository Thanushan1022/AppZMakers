import { useState, useRef } from 'react';
import { Clock, ClipboardList } from 'lucide-react';
import { formatDecimalHours, formatBreakMinutes } from '../../../utils/timeFormatter';

export function TodayAttendanceView({
  employees = [],
  todayAttendance = [],
  selectedDate,
  setSelectedDate,
}) {
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

  const [selectedTasks, setSelectedTasks] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const departments = [...new Set((employees || []).filter(e => e.status === 'active').map(e => e.department))].filter(Boolean).sort();

  
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

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Today's Attendance Status</h1>
        <p className="text-slate-500 text-sm mt-0.5">Real-time attendance telemetry log for the organization</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h3 className="text-slate-800 font-semibold">Telemetry Log</h3>
            <p className="text-slate-500 text-xs mt-0.5">Viewing records for the selected date</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-xs font-medium">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="border border-border rounded-xl px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 cursor-pointer"
              >
                <option value="all">All</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-xs font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-border rounded-xl px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 cursor-pointer"
              >
                <option value="all">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-slate-500 text-xs font-medium">Date:</span>
              <input
                type="date"
                value={selectedDate || ''}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-border rounded-xl px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="overflow-auto max-h-[600px] border border-slate-100 rounded-xl relative cursor-grab select-none"
        >
          <table className="w-full text-sm border-collapse">
            <thead className="z-30">
              <tr className="border-b border-border bg-white">
                {['Employee', 'Department', 'Check In', 'Check Out', 'Break', 'Tea Break', 'Net Hours', 'Extra Hours', 'Less Hours', 'Status', 'Tasks'].map((h, i) => {
                  const minWidths = [
                    'min-w-[180px]', // Employee
                    'min-w-[120px]', // Department
                    'min-w-[100px]', // Check In
                    'min-w-[110px]', // Check Out
                    'min-w-[90px]',  // Break
                    'min-w-[100px]', // Tea Break
                    'min-w-[100px]', // Net Hours
                    'min-w-[100px]', // Extra Hours
                    'min-w-[100px]', // Less Hours
                    'min-w-[95px]',  // Status
                    'min-w-[80px]',  // Tasks
                  ];
                  return (
                    <th key={h} className={`sticky top-0 text-left text-slate-400 font-medium py-3.5 px-4 bg-white z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] ${minWidths[i]}`}>{h}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(employees || [])
                .filter((e) => {
                  if (e.status !== 'active') return false;
                  if (departmentFilter !== 'all' && e.department !== departmentFilter) return false;
                  
                  const rec = todayAttendance.find((a) => a.employeeId === e.id);
                  const status = rec?.status || 'absent';
                  const isAbsent = status === 'absent';
                  
                  if (statusFilter === 'present' && isAbsent) return false;
                  if (statusFilter === 'absent' && !isAbsent) return false;

                  return true;
                })
                .sort((empA, empB) => {
                  const recA = todayAttendance.find((a) => a.employeeId === empA.id);
                  const recB = todayAttendance.find((a) => a.employeeId === empB.id);
                  const isPresentA = recA && recA.status !== 'absent';
                  const isPresentB = recB && recB.status !== 'absent';
                  if (isPresentA && !isPresentB) return -1;
                  if (!isPresentA && isPresentB) return 1;
                  if (isPresentA && isPresentB) {
                    const timeA = recA.checkIn || '99:99:99';
                    const timeB = recB.checkIn || '99:99:99';
                    return timeA.localeCompare(timeB);
                  }
                  return empA.name.localeCompare(empB.name);
                })
                .map((emp) => {
                  const rec = todayAttendance.find((a) => a.employeeId === emp.id);
                  const status = rec?.status || 'absent';
                  const isAbsent = status === 'absent';
                  const statusCls = {
                    present: 'bg-emerald-50 text-emerald-700',
                    late: 'bg-amber-50 text-amber-700',
                    absent: 'bg-red-50 text-red-600',
                    'half-day': 'bg-sky-50 text-sky-700',
                  };
                  return (
                    <tr key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 bg-white group-hover:bg-slate-50/50 min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0 overflow-hidden">
                            {emp.avatar && emp.avatar.startsWith('data:image/') ? (
                              <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                            ) : (
                              emp.avatar
                            )}
                          </div>
                          <div>
                            <div className="text-slate-700 font-medium whitespace-nowrap"><FormatMultilineName name={emp.name} /></div>
                            <div className="text-slate-400 text-xs">{emp.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{emp.department}</td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : (rec?.checkIn || '—')}</td>
                      <td className="py-3 px-4 text-slate-400 font-medium whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {isAbsent ? 'Null' : (
                          rec?.checkOut ? (
                            <>
                              {rec.checkOutDate && rec.checkOutDate !== rec.date && (
                                <span className="text-[10px] text-slate-400 block font-sans mb-0.5">{rec.checkOutDate}</span>
                              )}
                              <span>{rec.checkOut}</span>
                            </>
                          ) : (rec?.checkIn ? (
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
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : formatBreakMinutes(rec?.breakMinutes)}</td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : (rec?.teaBreakCount > 0 ? `${rec.teaBreakCount}-${rec.teaBreakMinutes}` : '—')}</td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : formatDecimalHours(rec?.totalHours)}</td>
                      <td className="py-3 px-4 text-emerald-600 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : (rec?.extraHours ? `+${formatDecimalHours(rec.extraHours)}` : '—')}</td>
                      <td className="py-3 px-4 text-red-500 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : formatDecimalHours(rec?.lessHours)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusCls[status] || 'bg-slate-50 text-slate-600'}`}>{status}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {!isAbsent && rec?.tasks?.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedTasks({ name: emp.name, date: rec.date || 'Today', tasks: rec.tasks })}
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
                    <p className="text-slate-400 text-xs mt-0.5">{(selectedTasks.name || '').split(' ')[0]} · {selectedTasks.date}</p>
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
