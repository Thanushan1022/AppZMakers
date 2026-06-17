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
  handleUpdateShiftNotice,
  handleDeleteShiftNotice,
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
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
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
                    <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-xs font-bold overflow-hidden flex-shrink-0">
                      {emp.avatar && emp.avatar.startsWith('data:image/') ? (
                        <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                      ) : (
                        emp.avatar
                      )}
                    </div>
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
    </div>
  );
}
