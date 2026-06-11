import { CheckCircle2, XCircle, Clock, Calendar, Search } from 'lucide-react';

const typeColors = {
  annual: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  casual: 'bg-sky-50 text-sky-700 border-sky-100',
  personal: 'bg-rose-50 text-rose-700 border-rose-100',
};

export function HRLeaveApprovalsView({
  leaveTabFilter,
  setLeaveTabFilter,
  leaveSearch,
  setLeaveSearch,
  selectedLeave,
  setSelectedLeave,
  rejectReason,
  setRejectReason,
  hrNote,
  setHrNote,
  leaveAction,
  setLeaveAction,
  handleConfirmLeaveAction,
  filteredLeaves,
  leaveCounts,
}) {
  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Leave Approvals</h1>
        <p className="text-slate-500 text-sm mt-0.5">Review and act on employee leave requests</p>
      </div>

      {/* Filter tabs + search */}
      <div className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setLeaveTabFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${leaveTabFilter === f ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f} ({leaveCounts[f] || 0})
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or department..."
            value={leaveSearch}
            onChange={e => setLeaveSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
          />
        </div>
      </div>

      {/* Leave cards */}
      <div className="space-y-3">
        {filteredLeaves.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <Clock className="w-10 h-10 mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400">No leave requests found</p>
          </div>
        ) : filteredLeaves.map(leave => (
          <div key={leave.id} className="bg-white rounded-2xl border border-border p-5 hover:border-indigo-200 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                {leave.employeeName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="font-medium text-slate-700">{leave.employeeName}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{leave.department} · Applied {leave.appliedOn}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    leave.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                    leave.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>{leave.status}</span>
                </div>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${typeColors[leave.type] || 'bg-slate-50 text-slate-600'}`}>{leave.type} Leave</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{leave.startDate}</span>
                    {leave.startDate !== leave.endDate && <><span>→</span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{leave.endDate}</span></>}
                    <span className="text-slate-300">·</span>
                    <span className="font-medium text-slate-600">{leave.days} day{leave.days !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <p className="mt-2 text-slate-600 text-sm">{leave.reason}</p>

                {leave.rejectionReason && (
                  <div className="mt-2 p-2.5 bg-red-50 rounded-lg text-xs text-red-600">
                    <strong>Rejection reason:</strong> {leave.rejectionReason}
                  </div>
                )}
                {leave.hrNote && (
                  <div className="mt-2 p-2.5 bg-emerald-50 rounded-lg text-xs text-emerald-600">
                    <strong>HR note:</strong> {leave.hrNote}
                  </div>
                )}
              </div>
            </div>

            {leave.status === 'pending' && (
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                <button
                  onClick={() => { setSelectedLeave(leave); setLeaveAction('approve'); }}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />Approve
                </button>
                <button
                  onClick={() => { setSelectedLeave(leave); setLeaveAction('reject'); }}
                  className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action modal */}
      {selectedLeave && leaveAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-slate-800 font-semibold mb-1">
              {leaveAction === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              {selectedLeave.employeeName} · {selectedLeave.type} leave · {selectedLeave.days} day{selectedLeave.days !== 1 ? 's' : ''}
            </p>

            {leaveAction === 'reject' ? (
              <div className="mb-4">
                <label className="block text-slate-600 text-sm mb-1.5">Rejection Reason <span className="text-red-400">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Explain why this leave is being rejected..."
                  rows={3}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-slate-50 resize-none"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-slate-600 text-sm mb-1.5">HR Note (optional)</label>
                <textarea
                  value={hrNote}
                  onChange={e => setHrNote(e.target.value)}
                  placeholder="Add a note for the employee..."
                  rows={2}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleConfirmLeaveAction}
                disabled={leaveAction === 'reject' && !rejectReason.trim()}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  leaveAction === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Confirm {leaveAction === 'approve' ? 'Approval' : 'Rejection'}
              </button>
              <button
                onClick={() => { setSelectedLeave(null); setRejectReason(''); setHrNote(''); setLeaveAction(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors border border-border"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
