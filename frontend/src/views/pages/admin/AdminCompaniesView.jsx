import React, { useState } from 'react';
import { Building2, Users, Mail, Phone, Briefcase, ChevronRight, User, MapPin } from 'lucide-react';

export function AdminCompaniesView({ companies = [], employees = [] }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const FormatMultilineName = ({ name }) => {
    if (!name) return null;
    const parts = name.trim().split(/\s+/);
    return (
      <div className="flex flex-col">
        {parts.map((p, i) => (
          <span key={i} className="leading-tight capitalize">{p}</span>
        ))}
      </div>
    );
  };

  // If no company is selected, select the first one by default if list is not empty
  const activeCompanyId = selectedCompanyId || (companies[0]?.id || null);
  const selectedCompany = companies.find(c => c.id === activeCompanyId);

  // Get employees assigned to the active company
  const companyEmployees = selectedCompany
    ? employees.filter(e => e.companyId === selectedCompany.id)
    : [];

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="relative z-10">
        <h1 className="text-slate-800 dark:text-slate-100" style={{ fontWeight: 800, fontSize: '1.75rem' }}>Clients/Leads & Teams</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">View client/lead companies and the employees assigned to them</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Companies List */}
        <div className="md:col-span-1 space-y-3">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2rem] border border-white dark:border-slate-800 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none relative z-10">
            <h3 className="text-slate-800 dark:text-slate-100 font-bold text-base mb-4">Client/Lead Companies</h3>
            <div className="max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="space-y-2">
                {companies.map(co => {
                  const isSelected = co.id === activeCompanyId;
                  const empCount = employees.filter(e => e.companyId === co.id).length;
                  return (
                    <div
                      key={co.id}
                      onClick={() => {
                        setSelectedCompanyId(co.id);
                        setSelectedEmployee(null);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isSelected
                          ? 'border-indigo-200 bg-indigo-50/50 text-indigo-900 shadow-sm'
                          : 'border-border hover:bg-slate-50/50 text-slate-700'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                          {co.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{co.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{co.industry}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-medium">
                          {empCount}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
                {companies.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-sm">No client/lead companies found</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Company Info & Assigned Employees */}
        <div className="md:col-span-2 space-y-6">
          {selectedCompany ? (
            <>
              {/* Company Details Card */}
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2rem] border border-white dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-lg">
                      {selectedCompany.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-slate-800 font-bold text-lg">{selectedCompany.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{selectedCompany.industry}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedCompany.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {selectedCompany.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-4 border-t border-border">
                  {[
                    { icon: User, label: 'Contact Person', value: selectedCompany.contact },
                    { icon: Mail, label: 'Email', value: selectedCompany.email },
                    { icon: Phone, label: 'Phone', value: selectedCompany.phone || 'N/A' },
                    { icon: MapPin, label: 'Address', value: selectedCompany.address || 'N/A' },
                    { icon: MapPin, label: 'Country', value: selectedCompany.country || 'N/A' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </div>
                      <div className="text-slate-700 text-sm font-medium truncate">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Employees */}
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2rem] border border-white dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative z-10">
                <h3 className="text-slate-800 dark:text-slate-100 font-bold mb-6 flex items-center gap-3 text-base">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  Assigned Employees ({companyEmployees.length})
                </h3>
                <div className="max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {companyEmployees.map(emp => (
                      <div
                        key={emp.id}
                        onClick={() => setSelectedEmployee(emp)}
                        className="p-4 rounded-xl border border-border hover:border-indigo-200 hover:bg-indigo-50/20 cursor-pointer transition-all flex items-center gap-3"
                      >
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                          {emp.avatar && emp.avatar.startsWith('data:image/') ? (
                            <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                          ) : (
                            emp.avatar
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 text-sm truncate"><FormatMultilineName name={emp.name} /></div>
                          <div className="text-slate-400 text-xs truncate">{emp.position}</div>
                          <div className="text-indigo-600 text-[11px] font-medium mt-0.5">{emp.department}</div>
                        </div>
                      </div>
                    ))}
                    {companyEmployees.length === 0 && (
                      <div className="sm:col-span-2 py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No employees assigned to this client/lead yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center text-slate-400 relative z-10">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40 text-slate-400" />
              <p className="text-sm">Select a company from the list to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white dark:border-slate-800 shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full font-bold text-lg cursor-pointer transition-colors"
            >
              &times;
            </button>
            <div className="flex flex-col items-center text-center pb-4 border-b border-border">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-xl mb-3 shadow-sm overflow-hidden flex-shrink-0">
                {selectedEmployee.avatar && selectedEmployee.avatar.startsWith('data:image/') ? (
                  <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-full h-full object-cover" />
                ) : (
                  selectedEmployee.avatar
                )}
              </div>
              <h3 className="text-slate-800 font-bold text-lg"><FormatMultilineName name={selectedEmployee.name} /></h3>
              <p className="text-slate-400 text-xs mt-0.5">{selectedEmployee.position}</p>
              <span className={`mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${selectedEmployee.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {selectedEmployee.status}
              </span>
            </div>
            <div className="py-4 space-y-3.5">
              {[
                { icon: Mail, label: 'Email', value: selectedEmployee.email },
                { icon: Phone, label: 'Phone', value: selectedEmployee.phone || 'N/A' },
                { icon: Briefcase, label: 'Department', value: selectedEmployee.department || 'General' },
                { icon: Building2, label: 'Company / Client/Lead', value: selectedEmployee.company || 'General (Our Company)' },
                { icon: MapPin, label: 'Address', value: selectedEmployee.address || 'N/A' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">{label}</div>
                    <div className="text-slate-700 text-sm font-medium mt-0.5">{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
