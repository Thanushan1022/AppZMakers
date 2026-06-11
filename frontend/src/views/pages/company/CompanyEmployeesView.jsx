import { Search, Users, Mail, Phone, Calendar } from 'lucide-react';

export function CompanyEmployeesView({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  filteredEmployees,
}) {
  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Hired Employees</h1>
        <p className="text-slate-500 text-sm mt-0.5">Directory roster of staff assigned to your company projects</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-border rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none bg-slate-50 font-medium text-slate-600"
        >
          <option value="All">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <span className="text-slate-500 text-sm">{filteredEmployees.length} staff found</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/50">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-white rounded-xl border border-border p-5 hover:border-indigo-200 transition-colors flex gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-base flex-shrink-0">
                {emp.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 truncate">{emp.name}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{emp.status}</span>
                </div>
                <div className="text-slate-500 text-xs mt-0.5">{emp.position} · {emp.department}</div>
                
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    <span>Hired since {emp.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-400 bg-white border border-border border-dashed rounded-xl">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No employees match this selection criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
