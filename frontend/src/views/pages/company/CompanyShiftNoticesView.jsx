import { useState, useEffect } from 'react';

const formatNoticeDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return '';
  try {
    const dateObj = new Date(`${dateStr}T00:00:00`);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${hours}:${minutesStr} ${ampm}`;
    
    return `${formattedDate} at ${formattedTime}`;
  } catch (err) {
    return `${dateStr} @ ${timeStr}`;
  }
};

export function CompanyShiftNoticesView({
  myEmployees,
  shiftNotices = [],
  handleCreateShiftNotice,
  handleUpdateShiftNotice,
  handleDeleteShiftNotice,
}) {
  const [formData, setFormData] = useState({
    employeeId: 'all',
    date: '',
    time: '08:00',
    reason: '',
    noticeType: 'shift',
    endDate: '',
    leaveType: 'annual',
  });
  
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Get tomorrow's date string for input 'min' attribute validation
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleReasonChange = (e) => {
    const text = e.target.value;
    const words = getWordCount(text);
    if (words <= 75 || text === '') {
      setFormData({ ...formData, reason: text });
    }
  };

  const handleEditClick = (notice) => {
    setEditingId(notice._id);
    setFormData({
      employeeId: notice.employeeId,
      date: notice.date,
      time: notice.time || '08:00',
      reason: notice.reason,
      noticeType: notice.noticeType || 'shift',
      endDate: notice.endDate || '',
      leaveType: notice.leaveType || 'annual',
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      employeeId: 'all',
      date: '',
      time: '08:00',
      reason: '',
      noticeType: 'shift',
      endDate: '',
      leaveType: 'annual',
    });
  };

  useEffect(() => {
    if (formData.noticeType === 'shift' && formData.date && formData.time) {
      const shiftStart = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      const diffMs = shiftStart - now;
      const diffHrs = diffMs / (1000 * 60 * 60);
      setIsUrgent(diffHrs < 6);
    } else {
      setIsUrgent(false);
    }
  }, [formData.date, formData.time, formData.noticeType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.noticeType === 'leave') {
      if (!formData.date || !formData.endDate || !formData.reason.trim()) {
        setErrorMsg('Please fill in all leave fields (start date, end date, and reason).');
        return;
      }
      if (new Date(formData.endDate) < new Date(formData.date)) {
        setErrorMsg('End date cannot be earlier than start date.');
        return;
      }
    } else {
      if (!formData.date || !formData.time || !formData.reason.trim()) {
        setErrorMsg('Please fill in all shift notification fields.');
        return;
      }
    }

    setLoading(true);
    let result;
    if (editingId) {
      result = await handleUpdateShiftNotice(editingId, formData);
    } else {
      result = await handleCreateShiftNotice(formData);
    }
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Notification saved successfully.');
      setFormData({
        employeeId: 'all',
        date: '',
        time: '08:00',
        reason: '',
        noticeType: 'shift',
        endDate: '',
        leaveType: 'annual',
      });
      setEditingId(null);
      setIsUrgent(false);
    } else {
      setErrorMsg(result.error || 'Failed to save notification.');
    }
  };

  const formatNoticeDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const dateObj = new Date(`${dateStr}T00:00:00`);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Shift & Leave Messages</h1>
        <p className="text-slate-500 text-sm mt-0.5">Send work start instructions or assign leaves to employees, and manage history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Message Form Box */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-800 font-semibold mb-1 flex items-center gap-2">
              {editingId 
                ? (formData.noticeType === 'leave' ? '🍁 Edit Leave Assignment' : '✏️ Edit Shift Start Notice') 
                : (formData.noticeType === 'leave' ? '🍁 Assign Leave' : '💬 Schedule Start Shift Message')}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {formData.noticeType === 'leave' 
                ? 'Assign approved leave period to target employees.' 
                : 'Inform your employees when their work starts, with reasons.'}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Message Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Message Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, noticeType: 'shift' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      formData.noticeType === 'shift'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-slate-50 border-border text-slate-650 hover:bg-slate-100'
                    }`}
                  >
                    💬 Shift Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, noticeType: 'leave' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      formData.noticeType === 'leave'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-slate-50 border-border text-slate-650 hover:bg-slate-100'
                    }`}
                  >
                    🍁 Leave Assignment
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target Employees</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Employees</option>
                  {myEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                  ))}
                </select>
              </div>

              {formData.noticeType === 'leave' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">End Date</label>
                      <input
                        type="date"
                        min={formData.date}
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                    <input
                      type="date"
                      min={editingId ? undefined : getTomorrowStr()}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Reason / Instructions</label>
                  <span className="text-[10px] font-bold text-slate-400">
                    {getWordCount(formData.reason)}/75 words
                  </span>
                </div>
                <textarea
                  value={formData.reason}
                  onChange={handleReasonChange}
                  rows={3}
                  placeholder={formData.noticeType === 'leave' ? 'Reason for assigning this leave...' : 'Reason why the employee should login at this time...'}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {isUrgent && formData.noticeType === 'shift' && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-600 font-semibold flex items-start gap-2 animate-pulse">
                  <span>⚠️ Warning: Notice scheduled for less than 6 hours from now. HR will be automatically notified.</span>
                </div>
              )}

              {errorMsg && <div className="text-xs font-semibold text-red-500">{errorMsg}</div>}
              {successMsg && <div className="text-xs font-semibold text-emerald-600">{successMsg}</div>}

              <div className="flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                    formData.noticeType === 'leave'
                      ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/10'
                      : 'bg-[#5b4cf5] hover:bg-[#473ac7] hover:shadow-indigo-500/10'
                  }`}
                >
                  {loading ? 'Saving...' : editingId ? 'Update Notice' : formData.noticeType === 'leave' ? 'Assign Leave' : 'Send Shift Message'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* History Log Box */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 flex flex-col">
          <h3 className="text-slate-800 font-semibold mb-1 flex items-center gap-2">📋 Notice Sent History</h3>
          <p className="text-xs text-slate-400 mb-4">View previous shift messages and leave assignments sent to your employees.</p>
          
          <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-3">
            {shiftNotices.length > 0 ? (
              shiftNotices.map((n, idx) => (
                <div 
                  key={n._id || idx} 
                  className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-sm hover:shadow-md transition-shadow ${
                    n.noticeType === 'leave' 
                      ? 'bg-amber-50/20 border-amber-200 hover:border-amber-300' 
                      : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-700 font-bold bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full capitalize">
                        {n.employeeName}
                      </span>
                      {n.noticeType === 'leave' ? (
                        <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-250 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          🍁 Client Leave
                        </span>
                      ) : (
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          💬 Shift
                        </span>
                      )}
                      {n.informHR && n.noticeType !== 'leave' && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                          ⚠️ HR Notified (&lt; 6h)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 font-medium leading-relaxed">
                      <strong>Reason:</strong> {n.reason}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
                    <div className="text-left sm:text-right text-xs text-slate-400 font-semibold">
                      <div className={`${n.noticeType === 'leave' ? 'text-amber-600' : 'text-indigo-600'} font-bold`}>
                        {n.noticeType === 'leave' ? 'Leave Period:' : 'Start Time:'}
                      </div>
                      <div className="text-slate-705" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {n.noticeType === 'leave' 
                          ? `${formatNoticeDate(n.date)} to ${formatNoticeDate(n.endDate)}` 
                          : formatNoticeDateTime(n.date, n.time)}
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handleEditClick(n)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          n.noticeType === 'leave'
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-100'
                            : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
                        }`}
                        title="Edit Notice"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          const confirmMsg = n.noticeType === 'leave' 
                            ? 'Are you sure you want to delete this leave assignment? This will also remove the approved leave request.'
                            : 'Are you sure you want to delete this shift notice?';
                          if (window.confirm(confirmMsg)) {
                            setErrorMsg('');
                            setSuccessMsg('');
                            const res = await handleDeleteShiftNotice(n._id);
                            if (res.success) {
                              setSuccessMsg('Notice deleted successfully.');
                            } else {
                              setErrorMsg(res.error || 'Failed to delete notice.');
                            }
                          }
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg border border-rose-100 transition-all cursor-pointer"
                        title="Delete Notice"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm py-8 text-center my-auto">No notices sent yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
