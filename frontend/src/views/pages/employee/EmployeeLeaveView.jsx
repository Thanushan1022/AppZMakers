import { Plus, CheckCircle2, XCircle, Clock, Calendar, FileText } from 'lucide-react';

const leaveTypes = ['annual', 'casual', 'medical'];
const typeColors = {
  annual: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  casual: 'bg-sky-50 text-sky-700 border-sky-100',
  medical: 'bg-rose-50 text-rose-700 border-rose-100',
};

export function EmployeeLeaveView({
  balance,
  showForm,
  setShowForm,
  leaveFilter,
  setLeaveFilter,
  leaveForm,
  setLeaveForm,
  filteredLeaves,
  handleLeaveSubmit,
}) {
  const balanceItems = [
    { key: 'annual', label: 'Annual Leave', data: balance.annual, color: 'bg-indigo-500', ring: 'border-indigo-200' },
    { key: 'casual', label: 'Casual Leave', data: balance.casual, color: 'bg-sky-500', ring: 'border-sky-200' },
    { key: 'medical', label: 'Medical Leave', data: balance.medical, color: 'bg-rose-500', ring: 'border-rose-200' },
  ].filter(item => item.data);

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Leave Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Apply for leave and track your requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

      {/* Leave balance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {balanceItems.map(({ key, label, data, color }) => {
          const remaining = data.total - data.used;
          const pct = data.total > 0 ? (remaining / data.total) * 100 : 0;
          return (
            <div key={key} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 text-sm font-medium">{label}</span>
                <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-slate-800 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.75rem' }}>{remaining}</div>
              <div className="text-slate-400 text-xs mb-3">{data.used} used of {data.total} days</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            New Leave Application
          </h3>
          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">Leave Type</label>
                <select
                  value={leaveForm.type}
                  onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                >
                  {leaveTypes.map(t => <option key={t} value={t} className="capitalize">{t} Leave</option>)}
                </select>
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-2 text-slate-600 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={leaveForm.halfDay || false}
                    onChange={e => {
                      const checked = e.target.checked;
                      setLeaveForm(prev => ({
                        ...prev,
                        halfDay: checked,
                        endDate: checked ? prev.startDate : prev.endDate
                      }));
                    }}
                    className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  Apply for Half Day (0.5 days)
                </label>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={e => setLeaveForm(prev => ({
                    ...prev,
                    startDate: e.target.value,
                    endDate: prev.halfDay ? e.target.value : prev.endDate
                  }))}
                  required
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
              </div>
              {!leaveForm.halfDay && (
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    min={leaveForm.startDate}
                    required
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-slate-600 text-sm mb-1.5">Reason</label>
              <textarea
                value={leaveForm.reason}
                onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                required
                rows={3}
                placeholder="Please provide a reason for your leave request..."
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Submit Application
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave history */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <h3 className="text-slate-800 font-semibold">Leave History</h3>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setLeaveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${leaveFilter === f ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredLeaves.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeaves.map((leave) => (
              <div key={leave.id} className="border border-border rounded-xl p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${typeColors[leave.type]}`}>{leave.type} Leave</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        leave.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        leave.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>{leave.status}</span>
                      <span className="text-slate-400 text-xs">{leave.days} day{leave.days !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{leave.startDate}</span>
                      {leave.startDate !== leave.endDate && <><span className="text-slate-300">→</span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{leave.endDate}</span></>}
                    </div>
                    <p className="text-slate-500 text-sm mt-1.5">{leave.reason}</p>
                    {leave.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg text-xs text-red-600">
                        <strong>Rejection reason:</strong> {leave.rejectionReason}
                      </div>
                    )}
                    {leave.hrNote && leave.status === 'approved' && (
                      <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-xs text-emerald-600">
                        <strong>HR note:</strong> {leave.hrNote}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {leave.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {leave.status === 'rejected' && <XCircle className="w-5 h-5 text-red-400" />}
                    {leave.status === 'pending' && <Clock className="w-5 h-5 text-amber-400" />}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border text-xs text-slate-400">
                  Applied on {leave.appliedOn}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
