import { useState } from 'react';
import { Users, Building2, ShieldCheck, Clock, AlertTriangle, CheckCircle2, XCircle, ClipboardList } from 'lucide-react';
import { formatDecimalHours, formatBreakMinutes } from '../../../utils/timeFormatter';

export function AdminDashboardView({
  employees,
  hrUsers,
  companies,
  dashboardStats,
  pendingLeaves,
  leaveCounts,
  selectedLeave,
  setSelectedLeave,
  rejectReason,
  setRejectReason,
  hrNote,
  setHrNote,
  leaveAction,
  setLeaveAction,
  handleConfirmLeaveAction,
  todayAttendance = [],
  selectedDate,
  setSelectedDate,
}) {
  const [selectedTasks, setSelectedTasks] = useState(null);
  const activeCount =
    (dashboardStats.activeEmployees ?? employees.filter((e) => e.status === 'active').length) +
    hrUsers.filter((h) => h.status === 'active').length;

  const pending = pendingLeaves || [];

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Super Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Control panel for global system aggregates</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Companies', value: dashboardStats.totalCompanies ?? companies.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: `${dashboardStats.activeCompanies ?? companies.filter((c) => c.status === 'active').length} active clients` },
          { label: 'System Active Accounts', value: activeCount, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Employees + HR active' },
          { label: 'HR Managers', value: dashboardStats.totalHR ?? hrUsers.length, icon: ShieldCheck, color: 'text-sky-600', bg: 'bg-sky-50', sub: `${dashboardStats.activeHR ?? hrUsers.filter((h) => h.status === 'active').length} active` },
          { label: 'Pending Leave Approvals', value: leaveCounts?.pending ?? pending.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Awaiting review' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-slate-800 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.5rem' }}>{s.value}</div>
              <div className="text-slate-800 text-sm font-medium">{s.label}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Pending Leave Requests ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((leave) => (
              <div key={leave.id} className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-slate-700 font-medium text-sm">{leave.employeeName}</div>
                    <div className="text-slate-500 text-xs mt-0.5 capitalize">{leave.type} · {leave.department} · {leave.days} day{leave.days !== 1 ? 's' : ''}</div>
                    <div className="text-slate-400 text-xs mt-1">{leave.startDate} → {leave.endDate}</div>
                    <div className="text-slate-500 text-xs mt-1 line-clamp-2">{leave.reason}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => { setSelectedLeave(leave); setLeaveAction('approve'); }}
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedLeave(leave); setLeaveAction('reject'); }}
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <p className="text-slate-400 text-sm py-4 text-center">No pending leave requests</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Platform Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Employees', value: dashboardStats.totalEmployees ?? employees.length },
              { label: 'Active Employees', value: dashboardStats.activeEmployees ?? employees.filter((e) => e.status === 'active').length },
              { label: 'Hiring Companies', value: dashboardStats.totalCompanies ?? companies.length },
              { label: 'Today Attendance Records', value: dashboardStats.todayAttendanceRecords ?? 0 },
              { label: 'Approved Leaves', value: leaveCounts?.approved ?? 0 },
              { label: 'Rejected Leaves', value: leaveCounts?.rejected ?? 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-slate-500 text-sm">{item.label}</span>
                <span className="text-slate-700 font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today attendance table */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h3 className="text-slate-800 font-semibold">Today's Attendance status</h3>
            <p className="text-slate-500 text-xs mt-0.5">Real-time attendance telemetry log</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs font-medium">Filter by Date:</span>
            <input
              type="date"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-border rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Employee', 'Department', 'Check In', 'Check Out', 'Break', 'Tea Break', 'Net Hours', 'Extra Hours', 'Less Hours', 'Status', 'Tasks'].map((h) => (
                  <th key={h} className="text-left text-slate-400 font-medium pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(employees || [])
                .filter((e) => e.status === 'active')
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
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">{emp.avatar}</div>
                        <div>
                          <div className="text-slate-700 font-medium">{emp.name}</div>
                          <div className="text-slate-400 text-xs">{emp.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{emp.department}</td>
                    <td className="py-3 pr-4 text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : (rec?.checkIn || '—')}</td>
                    <td className="py-3 pr-4 text-slate-400 font-medium whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                    <td className="py-3 pr-4 text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : formatBreakMinutes(rec?.breakMinutes)}</td>
                    <td className="py-3 pr-4 text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : (rec?.teaBreakCount > 0 ? `${rec.teaBreakCount}-${rec.teaBreakMinutes}` : '—')}</td>
                    <td className="py-3 pr-4 text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : formatDecimalHours(rec?.totalHours)}</td>
                    <td className="py-3 pr-4 text-emerald-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : (rec?.extraHours ? `+${formatDecimalHours(rec.extraHours)}` : '—')}</td>
                    <td className="py-3 pr-4 text-red-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : formatDecimalHours(rec?.lessHours)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusCls[status] || 'bg-slate-50 text-slate-600'}`}>{status}</span>
                    </td>
                    <td className="py-3 text-slate-400">
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

      {selectedLeave && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-md shadow-xl">
            <h3 className="text-slate-800 font-semibold mb-1">
              {leaveAction === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            <p className="text-slate-500 text-sm mb-4">{selectedLeave.employeeName} · {selectedLeave.type} · {selectedLeave.days} days</p>

            {leaveAction === 'approve' ? (
              <textarea
                placeholder="Optional note for employee..."
                value={hrNote}
                onChange={(e) => setHrNote(e.target.value)}
                className="w-full border border-border rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mb-4 min-h-[80px]"
              />
            ) : (
              <textarea
                placeholder="Rejection reason (required)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-border rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mb-4 min-h-[80px]"
              />
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setSelectedLeave(null); setLeaveAction(null); setHrNote(''); setRejectReason(''); }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeaveAction}
                disabled={leaveAction === 'reject' && !rejectReason.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 ${leaveAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'}`}
              >
                Confirm {leaveAction === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
