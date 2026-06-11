import { Users, Building2, ShieldCheck, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

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
}) {
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
