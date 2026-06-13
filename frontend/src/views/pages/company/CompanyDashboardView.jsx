import { useState, useEffect } from 'react';
import { Users, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CompanyDashboardView({
  company,
  myEmployees,
  todayRecs,
  weeklyData,
  presentCount,
  absentCount,
  pendingLeaves,
  totalHours,
  shiftNotices = [],
  handleCreateShiftNotice,
}) {
  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>{company.name}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{company.industry} · {myEmployees.length} employees managed</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: myEmployees.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: `${myEmployees.filter(e => e.status === 'active').length} active` },
          { label: 'Present Today', value: presentCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: `${myEmployees.length > 0 ? Math.round((presentCount / myEmployees.length) * 100) : 0}% attendance` },
          { label: 'Absent Today', value: absentCount, icon: Clock, color: 'text-red-500', bg: 'bg-red-50', sub: `${pendingLeaves} leaves pending` },
          { label: 'Total Hours', value: `${totalHours.toFixed(0)}h`, icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50', sub: 'This period' },
        ].map(s => {
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
        {/* Weekly attendance chart */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData || []} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employee attendance status */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Today's Status</h3>
          <div className="space-y-3">
            {myEmployees.map(emp => {
              const rec = todayRecs.find(r => r.employeeId === emp.id);
              const status = rec?.status || 'absent';
              const statusCls = {
                present: 'text-emerald-600 bg-emerald-50',
                late: 'text-amber-600 bg-amber-50',
                absent: 'text-red-500 bg-red-50',
                'half-day': 'text-sky-600 bg-sky-50',
              };
              return (
                <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-xs font-bold">{emp.avatar}</div>
                    <div>
                      <div className="text-slate-700 text-sm font-medium">{emp.name}</div>
                      <div className="text-slate-400 text-xs">{emp.position}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {rec?.checkIn && <span className="text-slate-400 text-xs hidden sm:block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rec.checkIn}</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusCls[status] || 'bg-slate-50'}`}>{status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Company info */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="text-slate-800 font-semibold mb-4">Company Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Company Name', value: company.name },
            { label: 'Industry', value: company.industry },
            { label: 'Contact Person', value: company.contact },
            { label: 'Email', value: company.email },
            { label: 'Phone', value: company.phone },
            { label: 'Member Since', value: new Date(company.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 bg-slate-50 rounded-xl border border-border">
              <div className="text-slate-400 text-xs mb-1">{label}</div>
              <div className="text-slate-700 font-medium text-sm">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Start Alert (Work Start Notices) Section */}
      <ShiftAlertSection
        employees={myEmployees}
        shiftNotices={shiftNotices}
        onSendNotice={handleCreateShiftNotice}
      />
    </div>
  );
}

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

function ShiftAlertSection({ employees, shiftNotices = [], onSendNotice }) {
  const [formData, setFormData] = useState({
    employeeId: 'all',
    date: '',
    time: '08:00',
    reason: '',
  });
  
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  useEffect(() => {
    if (formData.date && formData.time) {
      const shiftStart = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      const diffMs = shiftStart - now;
      const diffHrs = diffMs / (1000 * 60 * 60);
      setIsUrgent(diffHrs < 6);
    } else {
      setIsUrgent(false);
    }
  }, [formData.date, formData.time]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.date || !formData.time || !formData.reason.trim()) {
      setErrorMsg('Please fill in all shift notification fields.');
      return;
    }

    setLoading(true);
    const result = await onSendNotice(formData);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Notification sent successfully.');
      setFormData({
        employeeId: 'all',
        date: '',
        time: '08:00',
        reason: '',
      });
      setIsUrgent(false);
    } else {
      setErrorMsg(result.error || 'Failed to send shift start notification.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Message Form Box */}
      <div className="bg-white rounded-2xl border border-border p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-slate-800 font-semibold mb-1 flex items-center gap-2">💬 Schedule Start Shift Message</h3>
          <p className="text-xs text-slate-400 mb-4">Inform your employees when their work starts, with reasons.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target Employees</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                <input
                  type="date"
                  min={getTomorrowStr()}
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
                placeholder="Reason why the employee should login at this time..."
                className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {isUrgent && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-600 font-semibold flex items-start gap-2 animate-pulse">
                <span>⚠️ Warning: Notice scheduled for less than 6 hours from now. HR will be automatically notified.</span>
              </div>
            )}

            {errorMsg && <div className="text-xs font-semibold text-red-500">{errorMsg}</div>}
            {successMsg && <div className="text-xs font-semibold text-emerald-600">{successMsg}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#5b4cf5] hover:bg-[#473ac7] text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-indigo-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Shift Message'}
            </button>
          </form>
        </div>
      </div>

      {/* History Log Box */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 flex flex-col">
        <h3 className="text-slate-800 font-semibold mb-1 flex items-center gap-2">📋 Notice Sent History</h3>
        <p className="text-xs text-slate-400 mb-4">View previous shift start notices sent to your employees.</p>
        
        <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-3">
          {shiftNotices.length > 0 ? (
            shiftNotices.map((n, idx) => (
              <div key={n._id || idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-700 font-bold bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 rounded-full capitalize">
                      {n.employeeName}
                    </span>
                    {n.informHR && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                        ⚠️ HR Notified (&lt; 6h)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 font-medium leading-relaxed">
                    <strong>Reason:</strong> {n.reason}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 text-xs text-slate-400 font-semibold">
                  <div className="text-indigo-600 font-bold">Start Time:</div>
                  <div className="text-slate-750" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatNoticeDateTime(n.date, n.time)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-sm py-8 text-center my-auto">No shift notices sent yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
