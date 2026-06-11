import { Users, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { formatDecimalHours, formatBreakMinutes } from '../../../utils/timeFormatter';

const deptColors = {
  Engineering: '#4338ca',
  Design: '#0ea5e9',
  Product: '#10b981',
  Operations: '#f59e0b',
  Analytics: '#8b5cf6',
};

export function HRDashboardView({
  employeesList,
  todayAttendance,
  weeklyAttendanceData,
  deptData,
  todayLabel,
  leaveCounts,
  leavesList,
  selectedDate,
  setSelectedDate,
}) {
  const present = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const absent = todayAttendance.filter((a) => a.status === 'absent').length;
  const late = todayAttendance.filter((a) => a.status === 'late').length;
  const pendingLeaves = leavesList.filter((l) => l.status === 'pending');

  const pieData = [
    { name: 'Present', value: present, color: '#10b981' },
    { name: 'Absent', value: absent, color: '#ef4444' },
    { name: 'Late', value: late, color: '#f59e0b' },
  ];

  // Compute department distribution from active employees
  const activeEmployees = employeesList.filter((e) => e.status === 'active');
  const deptCounts = {};
  activeEmployees.forEach((emp) => {
    if (emp.department) {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
    }
  });

  const departmentData = Object.keys(deptCounts).map((dept) => ({
    name: dept,
    value: deptCounts[dept],
    color: deptColors[dept] || '#475569',
  }));

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>HR Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Workforce overview for today, {todayLabel || 'today'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: employeesList.filter((e) => e.status === 'active').length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: `${employeesList.length} total incl. inactive` },
          { label: 'Present Today', value: present, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: `${employeesList.length > 0 ? Math.round((present / employeesList.length) * 100) : 0}% of workforce` },
          { label: 'Absent Today', value: absent, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', sub: `${late} late arrivals` },
          { label: 'Pending Approvals', value: leaveCounts.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Leave requests pending' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Weekly Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyAttendanceData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Today's Breakdown</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-slate-500">{p.name}</span>
                </div>
                <span className="text-slate-700 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Pending Leave Requests ({pendingLeaves.length})
          </h3>
          <div className="space-y-3">
            {pendingLeaves.map((leave) => (
              <div key={leave.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <div>
                  <div className="text-slate-700 font-medium text-sm">{leave.employeeName}</div>
                  <div className="text-slate-500 text-xs mt-0.5 capitalize">{leave.type} · {leave.days} day{leave.days !== 1 ? 's' : ''} · {leave.startDate}</div>
                  <div className="text-slate-400 text-xs mt-0.5 line-clamp-1">{leave.reason}</div>
                </div>
              </div>
            ))}
            {pendingLeaves.length === 0 && (
              <p className="text-slate-400 text-sm py-4 text-center">No pending leave requests</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Attendance by Department</h3>
          <div className="space-y-4">
            {deptData.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-600 text-sm">{d.name}</span>
                  <span className="text-slate-400 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{d.present}/{d.total}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${d.total > 0 ? (d.present / d.total) * 100 : 0}%`, background: deptColors[d.name] || '#4338ca' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col items-center justify-between">
          <h3 className="text-slate-800 font-semibold mb-2 self-start">Department Distribution</h3>
          {departmentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full grid grid-cols-2 gap-2 mt-4">
                {departmentData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600 truncate">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm my-auto">No department distribution details available.</p>
          )}
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
                {['Employee', 'Department', 'Check In', 'Check Out', 'Break', 'Net Hours', 'Extra Hours', 'Less Hours', 'Status'].map((h) => (
                  <th key={h} className="text-left text-slate-400 font-medium pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employeesList.filter((e) => e.status === 'active').map((emp) => {
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
                        ) : (rec?.checkIn ? <span className="text-emerald-500 text-xs">Active</span> : '—')
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : formatBreakMinutes(rec?.breakMinutes)}</td>
                    <td className="py-3 pr-4 text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : formatDecimalHours(rec?.totalHours)}</td>
                    <td className="py-3 pr-4 text-emerald-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : (rec?.extraHours ? `+${formatDecimalHours(rec.extraHours)}` : '—')}</td>
                    <td className="py-3 pr-4 text-red-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{isAbsent ? 'Null' : formatDecimalHours(rec?.lessHours)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusCls[status] || 'bg-slate-50 text-slate-600'}`}>{status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
