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
          const blobColors = {
            'text-indigo-600': 'bg-indigo-300/40 dark:bg-indigo-900/40',
            'text-emerald-600': 'bg-emerald-300/40 dark:bg-emerald-900/40',
            'text-sky-600': 'bg-sky-300/40 dark:bg-sky-900/40',
            'text-amber-600': 'bg-amber-300/40 dark:bg-amber-900/40'
          };
          const blobColor = blobColors[s.color] || 'bg-slate-300/40';

          return (
            <div key={s.label} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2.5rem] border border-white dark:border-slate-800 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
              <div className={`absolute -right-8 -top-8 w-32 h-32 ${blobColor} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-out`}></div>
              <div className={`w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-white dark:border-slate-700 shadow-sm relative z-10`}>
                <Icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div className="text-slate-800 dark:text-slate-100 mb-1 relative z-10" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: '1.75rem' }}>{s.value}</div>
              <div className="text-slate-600 dark:text-slate-300 text-sm font-bold relative z-10">{s.label}</div>
              <div className="text-slate-400 text-xs mt-1 relative z-10">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <h3 className="text-slate-800 dark:text-slate-100 font-bold mb-6 flex items-center gap-3 text-lg">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center border border-amber-100 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            Pending Leave Requests ({pending.length})
          </h3>
          <div className="space-y-4">
            {pending.map((leave) => (
              <div key={leave.id} className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-slate-800 dark:text-slate-200 font-bold text-base">{leave.employeeName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-bold capitalize">{leave.type}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{leave.department} · {leave.days} day{leave.days !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 text-xs mt-2 font-medium bg-white/50 dark:bg-slate-800/50 inline-block px-2 py-1 rounded-md">{leave.startDate} → {leave.endDate}</div>
                    <div className="text-slate-600 dark:text-slate-300 text-sm mt-2 line-clamp-2 leading-relaxed">{leave.reason}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => { setSelectedLeave(leave); setLeaveAction('approve'); }}
                      className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedLeave(leave); setLeaveAction('reject'); }}
                      className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 dark:text-slate-500 font-medium">No pending leave requests</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
          <h3 className="text-slate-800 dark:text-slate-100 font-bold mb-6 text-lg relative z-10">Platform Overview</h3>
          <div className="space-y-4 relative z-10">
            {[
              { label: 'Total Employees', value: dashboardStats.totalEmployees ?? employees.length },
              { label: 'Active Employees', value: dashboardStats.activeEmployees ?? employees.filter((e) => e.status === 'active').length },
              { label: 'Hiring Companies', value: dashboardStats.totalCompanies ?? companies.length },
              { label: 'Today Attendance Records', value: dashboardStats.todayAttendanceRecords ?? 0 },
              { label: 'Approved Leaves', value: leaveCounts?.approved ?? 0 },
              { label: 'Rejected Leaves', value: leaveCounts?.rejected ?? 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-white/50 dark:border-slate-700 shadow-sm">
                <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black text-lg bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/50" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      {selectedLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white dark:border-slate-800 w-full max-w-md shadow-2xl overflow-hidden p-8 animate-in zoom-in-95">
            <h3 className="text-slate-800 dark:text-slate-100 font-bold text-xl mb-1">
              {leaveAction === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300 font-bold">{selectedLeave.employeeName}</span> · <span className="capitalize">{selectedLeave.type}</span> · {selectedLeave.days} days
            </p>

            {leaveAction === 'approve' ? (
              <textarea
                placeholder="Optional note for employee..."
                value={hrNote}
                onChange={(e) => setHrNote(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl p-4 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mb-6 min-h-[100px] shadow-sm transition-all"
              />
            ) : (
              <textarea
                placeholder="Rejection reason (required)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-4 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 mb-6 min-h-[100px] shadow-sm transition-all placeholder:text-red-300 dark:placeholder:text-red-700"
              />
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setSelectedLeave(null); setLeaveAction(null); setHrNote(''); setRejectReason(''); }}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeaveAction}
                disabled={leaveAction === 'reject' && !rejectReason.trim()}
                className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed ${leaveAction === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25 border border-emerald-400' : 'bg-red-500 hover:bg-red-600 shadow-red-500/25 border border-red-400'}`}
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
