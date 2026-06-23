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
      <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
        <div>
          <h1 className="text-slate-800 dark:text-slate-100" style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Hired Employees</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Directory roster of staff assigned to your company projects</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/30 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-slate-700/50 p-6 flex flex-col sm:flex-row gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"></div>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-white/60 dark:border-slate-700/60 rounded-2xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md placeholder:text-slate-400 transition-all font-medium relative z-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-white/60 dark:border-slate-700/60 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md font-bold transition-all appearance-none cursor-pointer sm:w-48 relative z-10"
        >
          <option value="All">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white/30 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"></div>
        <div className="p-6 border-b border-white/40 dark:border-slate-700/40 bg-white/20 dark:bg-slate-800/20 relative z-10">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">{filteredEmployees.length} staff found</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 relative z-10">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-600/50 p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-none transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex gap-4">
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-black text-xl flex-shrink-0 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                  {emp.avatar && emp.avatar.startsWith('data:image/') ? (
                    <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                  ) : (
                    emp.avatar
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-black text-slate-800 dark:text-slate-100 text-base truncate tracking-tight">{emp.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>{emp.status}</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{emp.position} · {emp.department}</div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-600/50 space-y-3 relative z-10">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-8 h-8 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-8 h-8 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span>{emp.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-8 h-8 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span>Hired since {emp.joinDate}</span>
                </div>
              </div>
              </div>
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-3xl">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-500" />
              <p className="text-sm font-bold uppercase tracking-widest">No employees match this selection criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
