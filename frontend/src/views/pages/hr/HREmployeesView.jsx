import React, { useState } from 'react';
import { Search, Users, Mail, Phone, Calendar, Plus, FileText, Download } from 'lucide-react';

export function HREmployeesView({
  search,
  setSearch,
  deptFilter,
  setDeptFilter,
  statusFilter,
  setStatusFilter,
  selectedEmployeeId,
  setSelectedEmployeeId,
  departments,
  filteredEmployees,
  selectedEmployee,
  selectedAttendance,
  selectedBalance,
  getEmployeeStats,
  clients = [],
  handleAssignClient,
  handleUpdateEmployeeStatus,
  showModal,
  setShowModal,
  empForm,
  setEmpForm,
  handleAddEmployee,
  handleAdjustAttendance,
  handleCreateManualAttendance,
}) {
  const [adjustingRec, setAdjustingRec] = useState(null);
  const [adjustForm, setAdjustForm] = useState({
    checkIn: '',
    checkOut: '',
    status: 'present',
    reason: '',
    breakMinutes: 0,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    date: '',
    checkIn: '09:00:00',
    checkOut: '17:00:00',
    status: 'present',
    reason: '',
    breakMinutes: 0,
  });

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [attendanceDateFilter, setAttendanceDateFilter] = useState(getTodayDateString());
  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Employees</h1>
          <p className="text-slate-500 text-sm mt-0.5">View and manage all employee records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none bg-slate-50"
        >
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none bg-slate-50"
        >
          <option value="All">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={`grid gap-6 ${selectedEmployee ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Employee list */}
        <div className={selectedEmployee ? 'lg:col-span-2' : ''}>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <span className="text-slate-500 text-sm">{filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found</span>
            </div>
            <div className="divide-y divide-border">
              {filteredEmployees.map(emp => {
                const stats = getEmployeeStats(emp.id);
                const isSelected = selectedEmployeeId === emp.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(isSelected ? null : emp.id)}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${emp.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                      {emp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 font-medium">{emp.name}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{emp.status}</span>
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">{emp.position} · {emp.department}</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
                      <div className="text-right">
                        <div className="font-medium text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.pct}%</div>
                        <div>attendance</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredEmployees.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No employees found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employee detail panel */}
        {selectedEmployee && (() => {
          const stats = getEmployeeStats(selectedEmployee.id);
          const filteredAttendance = selectedAttendance.filter(rec => {
            if (!attendanceDateFilter) return true;
            return rec.date === attendanceDateFilter;
          });
          const recentRecs = filteredAttendance.slice(0, 5);
          return (
            <div className="space-y-4">
              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold">{selectedEmployee.avatar}</div>
                  <div>
                    <div className="font-semibold text-slate-800">{selectedEmployee.name}</div>
                    <div className="text-slate-400 text-xs">{selectedEmployee.position}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { icon: Mail, value: selectedEmployee.email },
                    { icon: Phone, value: selectedEmployee.phone || 'N/A' },
                    { icon: Calendar, value: `Joined: ${selectedEmployee.joinDate || 'N/A'}` },
                  ].map(({ icon: Icon, value }) => (
                    <div key={value} className="flex items-center gap-2 text-slate-500">
                      <Icon className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                      <span className="truncate text-xs">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-400 font-semibold mb-2">Account Status</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateEmployeeStatus(selectedEmployee.id, 'active')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedEmployee.status === 'active'
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/10'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:text-[#5b4cf5]'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateEmployeeStatus(selectedEmployee.id, 'inactive')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedEmployee.status === 'inactive'
                          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-sm shadow-red-500/10'
                          : 'bg-white hover:bg-slate-50 text-slate-650 border-slate-200 hover:text-red-500'
                      }`}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>

                {/* CV section */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-400 font-medium mb-2">CV / Resume</div>
                  {selectedEmployee.cvName && selectedEmployee.cvData ? (
                    <div className="flex items-center justify-between gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const base64Parts = selectedEmployee.cvData.split(',');
                            const byteString = atob(base64Parts[1]);
                            const mimeString = base64Parts[0].split(':')[1].split(';')[0];
                            const ab = new ArrayBuffer(byteString.length);
                            const ia = new Uint8Array(ab);
                            for (let i = 0; i < byteString.length; i++) {
                              ia[i] = byteString.charCodeAt(i);
                            }
                            const blob = new Blob([ab], { type: mimeString });
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl, '_blank');
                          } catch (e) {
                            const newWindow = window.open();
                            newWindow.document.write(`<iframe src="${selectedEmployee.cvData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                          }
                        }}
                        className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-slate-700 font-semibold text-xs truncate group-hover:text-indigo-600 transition-colors" title={selectedEmployee.cvName}>
                            {selectedEmployee.cvName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">Click to view</div>
                        </div>
                      </button>
                      <a
                        href={selectedEmployee.cvData}
                        download={selectedEmployee.cvName}
                        title="Download CV"
                        className="w-8 h-8 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors shadow-sm cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                      <FileText className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                      <span>No CV uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Assignment Card */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h4 className="text-slate-700 font-medium mb-3 text-sm flex items-center gap-1.5">
                  💼 Client Assignment
                </h4>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-3">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Current Client</div>
                    <div className="text-slate-800 font-semibold text-sm mt-1">{selectedEmployee.company || 'General (Our Company)'}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/50">
                    <label className="block text-slate-505 text-[10px] font-semibold mb-1">Assign to Client</label>
                    <select
                      value={selectedEmployee.companyId || 'unassigned'}
                      onChange={(e) => handleAssignClient(selectedEmployee.id, e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none bg-white font-medium cursor-pointer"
                    >
                      <option value="unassigned">General (Our Company)</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h4 className="text-slate-700 font-medium mb-3 text-sm">Performance</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Attendance', value: `${stats.pct}%`, color: 'text-emerald-600' },
                    { label: 'Hours', value: `${stats.hours.toFixed(1)}h`, color: 'text-indigo-600' },
                    { label: 'Extra Hours', value: stats.extraHours ? `+${stats.extraHours.toFixed(1)}h` : '—', color: 'text-emerald-600' },
                    { label: 'Less Hours', value: stats.lessHours ? `${stats.lessHours.toFixed(1)}h` : '—', color: 'text-red-500' },
                    { label: 'Present', value: `${stats.present}`, color: 'text-sky-600' },
                    { label: 'Absent', value: `${stats.total - stats.present}`, color: 'text-red-500' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-3">
                      <div className={`${s.color} font-semibold`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem' }}>{s.value}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave balance */}
              {selectedBalance && (
                <div className="bg-white rounded-2xl border border-border p-5">
                  <h4 className="text-slate-700 font-medium mb-3 text-sm flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-violet-400" />Leave Balance</h4>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Annual', data: selectedBalance.annual, color: 'bg-indigo-400' },
                      { label: 'Casual', data: selectedBalance.casual, color: 'bg-sky-400' },
                      { label: 'Medical', data: selectedBalance.medical, color: 'bg-rose-400' },
                    ].map(({ label, data, color }) => {
                      if (!data) return null;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">{label}</span>
                            <span className="text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{data.total - data.used}/{data.total}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${((data.total - data.used) / data.total) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent attendance */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h4 className="text-slate-700 font-medium text-sm">Recent Attendance</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const targetDate = attendanceDateFilter || getTodayDateString();
                        const existing = selectedAttendance.find(r => r.date === targetDate);
                        if (existing) {
                          setCreateForm({
                            date: targetDate,
                            checkIn: existing.checkIn || '09:00:00',
                            checkOut: existing.checkOut || '17:00:00',
                            status: existing.status || 'present',
                            reason: '',
                            breakMinutes: existing.breakMinutes || 0,
                          });
                        } else {
                          setCreateForm({
                            date: targetDate,
                            checkIn: '09:00:00',
                            checkOut: '17:00:00',
                            status: 'present',
                            reason: '',
                            breakMinutes: 0,
                          });
                        }
                        setShowCreateModal(true);
                      }}
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold cursor-pointer border border-indigo-100/50 transition-colors"
                    >
                      + Add Missed Log
                    </button>
                    <input
                      type="date"
                      value={attendanceDateFilter}
                      onChange={(e) => setAttendanceDateFilter(e.target.value)}
                      className="border border-border rounded-xl px-2.5 py-1 text-xs text-slate-600 focus:outline-none bg-slate-50 font-medium cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {recentRecs.map(rec => {
                    const s = { present: 'text-emerald-600 bg-emerald-50', late: 'text-amber-600 bg-amber-50', absent: 'text-red-500 bg-red-50', 'half-day': 'text-sky-600 bg-sky-50' };
                    return (
                      <div key={rec.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100/70">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">{new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${s[rec.status] || 'bg-slate-100 text-slate-700'} capitalize`}>
                            {rec.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-t border-slate-200/50 pt-2">
                          <span className="text-slate-400 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {rec.checkIn || '—'} to {rec.checkOut ? `${rec.checkOutDate && rec.checkOutDate !== rec.date ? `(${rec.checkOutDate}) ` : ''}${rec.checkOut}` : '—'}
                          </span>
                          <span className="text-slate-500 font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {rec.totalHours ? `${rec.totalHours.toFixed(1)}h` : '0h'}
                          </span>
                        </div>
                        {rec.adjusted && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100/50 rounded-lg px-2 py-1.5 w-full space-y-0.5">
                            <div className="font-semibold">✏️ Adjusted by {rec.adjustedBy || 'HR'}</div>
                            <div className="text-amber-800">Reason: {rec.adjustedReason || 'Manual entry'}</div>
                          </div>
                        )}

                        {rec.tasks && rec.tasks.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-250/30 space-y-1.5">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              📋 Logged Tasks ({rec.tasks.length})
                            </div>
                            <div className="space-y-1 pl-0.5">
                              {rec.tasks.map((task, tidx) => (
                                <div key={task._id || tidx} className="text-xs text-slate-600 bg-white rounded-lg p-2 border border-slate-200/60 shadow-sm">
                                  <div className="font-semibold text-slate-700">{task.description}</div>
                                  {task.timeContext && (
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Context: {task.timeContext}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end gap-2 mt-1 pt-1.5 border-t border-slate-200/50">
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustingRec(rec);
                              setAdjustForm({
                                checkIn: rec.checkIn || '09:00:00',
                                checkOut: rec.checkOut || new Date().toTimeString().slice(0, 8),
                                status: rec.status || 'present',
                                reason: '',
                                breakMinutes: rec.breakMinutes || 0,
                              });
                            }}
                            className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold transition-colors cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg"
                          >
                            {!rec.checkOut ? '⚠️ Force Clock Out' : 'Adjust'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {recentRecs.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-150">
                      No attendance record found for this date.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-8">
            <h3 className="text-slate-800 font-semibold mb-5">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Jane Smith' },
                  { key: 'email', label: 'Email', placeholder: 'jane@company.com' },
                  { key: 'position', label: 'Position', placeholder: 'Software Engineer' },
                  { key: 'department', label: 'Department', placeholder: 'Engineering' },
                  { key: 'joinDate', label: 'Join Date', placeholder: '' },
                ].map(f => (
                  <div key={f.key} className={f.key === 'name' || f.key === 'email' ? 'col-span-2' : ''}>
                    <label className="block text-slate-600 text-sm mb-1.5">{f.label}</label>
                    <input
                      type={f.key === 'joinDate' ? 'date' : 'text'}
                      value={empForm[f.key] || ''}
                      onChange={e => setEmpForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      required={f.key !== 'joinDate'}
                      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                    />
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="block text-slate-600 text-sm mb-1.5">Address</label>
                  <input
                    type="text"
                    value={empForm.address || ''}
                    onChange={e => setEmpForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="123 Main St, Colombo"
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 text-sm mb-1.5">Working Location (Country)</label>
                  <select
                    value={['Sri Lanka', 'USA', 'UK', 'Canada', 'Australia'].includes(empForm.country) ? (empForm.country || 'Sri Lanka') : 'other'}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'other') {
                        setEmpForm(p => ({ ...p, country: '' }));
                      } else {
                        setEmpForm(p => ({ ...p, country: val }));
                      }
                    }}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  >
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="other">Other (Type Custom)...</option>
                  </select>
                  {!['Sri Lanka', 'USA', 'UK', 'Canada', 'Australia'].includes(empForm.country) && (
                    <input
                      type="text"
                      placeholder="Type custom country name..."
                      value={empForm.country || ''}
                      onChange={e => setEmpForm(p => ({ ...p, country: e.target.value }))}
                      required
                      className="w-full mt-2 border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Add Employee</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-border py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Adjustment Modal */}
      {adjustingRec && (
        <div className="fixed inset-0 bg-black/45 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in duration-200">
            <h3 className="text-slate-800 font-semibold text-lg mb-1">Adjust Attendance</h3>
            <p className="text-xs text-slate-400 mb-4">
              Manually modify the attendance details for <strong className="text-slate-600 font-semibold">{selectedEmployee.name}</strong> on <strong className="text-slate-600 font-semibold">{adjustingRec.date}</strong>.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!adjustForm.reason.trim()) {
                  alert('Please enter a reason for this adjustment.');
                  return;
                }
                const res = await handleAdjustAttendance(adjustingRec.id, adjustForm);
                if (res && res.success) {
                  setAdjustingRec(null);
                } else {
                  alert(res?.error || 'Failed to adjust attendance');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Check In Time</label>
                <input
                  type="text"
                  placeholder="HH:MM:SS"
                  value={adjustForm.checkIn}
                  onChange={(e) => setAdjustForm((p) => ({ ...p, checkIn: e.target.value }))}
                  required
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Check Out Time</label>
                <input
                  type="text"
                  placeholder="HH:MM:SS"
                  value={adjustForm.checkOut}
                  onChange={(e) => setAdjustForm((p) => ({ ...p, checkOut: e.target.value }))}
                  required
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Break Time (Minutes)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={adjustForm.breakMinutes}
                  onChange={(e) => setAdjustForm((p) => ({ ...p, breakMinutes: parseInt(e.target.value, 10) || 0 }))}
                  required
                  min="0"
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Attendance Status</label>
                <select
                  value={adjustForm.status}
                  onChange={(e) => setAdjustForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none bg-slate-50"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Reason for Adjustment</label>
                <textarea
                  placeholder="e.g. Power outage, forgot to clock out, etc."
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm((p) => ({ ...p, reason: e.target.value }))}
                  required
                  rows={2}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Apply Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustingRec(null)}
                  className="flex-1 border border-border py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Manual Attendance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/45 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in duration-200">
            <h3 className="text-slate-800 font-semibold text-lg mb-1">Add Missed Attendance</h3>
            <p className="text-xs text-slate-400 mb-4">
              Manually create a new attendance record for <strong className="text-slate-600 font-semibold">{selectedEmployee.name}</strong>.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!createForm.reason.trim()) {
                  alert('Please enter a reason for this manual entry.');
                  return;
                }
                const res = await handleCreateManualAttendance(selectedEmployee.id, createForm);
                if (res && res.success) {
                  setShowCreateModal(false);
                } else {
                  alert(res?.error || 'Failed to create attendance log');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Date</label>
                <input
                  type="date"
                  value={createForm.date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    const existing = selectedAttendance.find(r => r.date === newDate);
                    if (existing) {
                      setCreateForm({
                        date: newDate,
                        checkIn: existing.checkIn || '09:00:00',
                        checkOut: existing.checkOut || '17:00:00',
                        status: existing.status || 'present',
                        reason: '',
                        breakMinutes: existing.breakMinutes || 0,
                      });
                    } else {
                      setCreateForm({
                        date: newDate,
                        checkIn: '09:00:00',
                        checkOut: '17:00:00',
                        status: 'present',
                        reason: '',
                        breakMinutes: 0,
                      });
                    }
                  }}
                  required
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Check In Time</label>
                <input
                  type="text"
                  placeholder="HH:MM:SS"
                  value={createForm.checkIn}
                  onChange={(e) => setCreateForm((p) => ({ ...p, checkIn: e.target.value }))}
                  required
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Check Out Time</label>
                <input
                  type="text"
                  placeholder="HH:MM:SS"
                  value={createForm.checkOut}
                  onChange={(e) => setCreateForm((p) => ({ ...p, checkOut: e.target.value }))}
                  required
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Break Time (Minutes)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={createForm.breakMinutes}
                  onChange={(e) => setCreateForm((p) => ({ ...p, breakMinutes: parseInt(e.target.value, 10) || 0 }))}
                  required
                  min="0"
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Attendance Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none bg-slate-50"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Reason for Creation</label>
                <textarea
                  placeholder="e.g. Employee forgot to clock in"
                  value={createForm.reason}
                  onChange={(e) => setCreateForm((p) => ({ ...p, reason: e.target.value }))}
                  required
                  rows={2}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Create Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-border py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
