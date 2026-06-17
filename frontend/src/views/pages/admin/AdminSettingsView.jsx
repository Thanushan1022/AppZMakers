import { useState, useEffect } from 'react';
import { Clock, Shield, CalendarDays, RefreshCw, Check, Coffee } from 'lucide-react';

export function AdminSettingsView({
  settings,
  handleUpdateSetting,
  companies = [],
  employees = [],
  handleToggleEmployeeTeaBreak,
  handleToggleCompanyTeaBreak,
}) {
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [saveStatus, setSaveStatus] = useState({});
  const [allocationTab, setAllocationTab] = useState('companies');
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    const cleanNum = (val) => {
      if (val === null || val === undefined) return '';
      const match = String(val).match(/^(-?\d+(\.\d+)?)/);
      return match ? parseFloat(match[1]) : val;
    };
    setLocalSettings({
      ...settings,
      breakTime: cleanNum(settings.breakTime),
      workHours: cleanNum(settings.workHours),
    });
  }, [settings]);

  const handleLocalChange = (key, val) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleLeaveChange = (key, val) => {
    setLocalSettings(prev => ({
      ...prev,
      leaveAllocations: {
        ...prev.leaveAllocations,
        [key]: val
      }
    }));
  };

  const saveKey = async (key, val) => {
    setSaveStatus(prev => ({ ...prev, [key]: 'saving' }));
    try {
      await handleUpdateSetting(key, val);
      setSaveStatus(prev => ({ ...prev, [key]: 'saved' }));
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [key]: null }));
      }, 1500);
    } catch (err) {
      setSaveStatus(prev => ({ ...prev, [key]: 'error' }));
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800 font-bold" style={{ fontSize: '1.375rem' }}>System Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure system-wide preferences, working times, and leave balance parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Configurations Card */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
          <h2 className="text-slate-800 font-semibold flex items-center gap-2 border-b border-border pb-3">
            <Clock className="w-5 h-5 text-indigo-500" /> Working Times & Hours
          </h2>

          <div className="space-y-4">
            {/* Break Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Daily Standard Meal Break Time (Hours)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={localSettings.breakTime || ''}
                  onChange={e => handleLocalChange('breakTime', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  placeholder="hour"
                />
                <button
                  onClick={() => saveKey('breakTime', localSettings.breakTime)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.breakTime === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.breakTime === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
              <span className="text-slate-400 text-xs">Standard daily target meal break duration in hours</span>
            </div>

            {/* Meal Break Limit */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Daily Allowed Meal Breaks Limit</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={localSettings.mealBreaksMax !== undefined ? localSettings.mealBreaksMax : 5}
                  onChange={e => handleLocalChange('mealBreaksMax', parseInt(e.target.value) || 0)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  placeholder="e.g. 5"
                />
                <button
                  onClick={() => saveKey('mealBreaksMax', localSettings.mealBreaksMax !== undefined ? localSettings.mealBreaksMax : 5)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.mealBreaksMax === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.mealBreaksMax === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
              <span className="text-slate-400 text-xs">Maximum number of times an employee can start a meal break during their shift</span>
            </div>

            {/* Work Hours */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Standard Daily Work Hours</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={localSettings.workHours || ''}
                  onChange={e => handleLocalChange('workHours', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  placeholder="hour"
                />
                <button
                  onClick={() => saveKey('workHours', localSettings.workHours)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.workHours === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.workHours === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
              <span className="text-slate-400 text-xs">Standard daily target shift duration in hours</span>
            </div>
          </div>
        </div>

        {/* Tea Break Configurations Card */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
          <h2 className="text-slate-800 font-semibold flex items-center gap-2 border-b border-border pb-3">
            <Coffee className="w-5 h-5 text-amber-500" /> Tea Break Settings
          </h2>

          <div className="space-y-4">
            {/* Enable/Disable Tea Break */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-border">
              <div>
                <label className="text-slate-800 text-sm font-semibold">Enable Tea Break</label>
                <span className="block text-slate-400 text-xs mt-0.5">Toggle tea break feature visibility and options on dashboard</span>
              </div>
              <button
                onClick={() => {
                  const nextVal = localSettings.teaBreakEnabled === false ? true : false;
                  handleLocalChange('teaBreakEnabled', nextVal);
                  saveKey('teaBreakEnabled', nextVal);
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  localSettings.teaBreakEnabled !== false ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localSettings.teaBreakEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Max Tea Breaks */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Daily Allowed Tea Breaks</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={localSettings.teaBreaksMax !== undefined ? localSettings.teaBreaksMax : 2}
                  onChange={e => handleLocalChange('teaBreaksMax', parseInt(e.target.value) || 0)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
                <button
                  onClick={() => saveKey('teaBreaksMax', localSettings.teaBreaksMax !== undefined ? localSettings.teaBreaksMax : 2)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.teaBreaksMax === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.teaBreaksMax === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
            </div>

            {/* Tea Break Duration */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Tea Break Duration (Minutes)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={localSettings.teaBreakDuration !== undefined ? localSettings.teaBreakDuration : 20}
                  onChange={e => handleLocalChange('teaBreakDuration', parseInt(e.target.value) || 0)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
                <button
                  onClick={() => saveKey('teaBreakDuration', localSettings.teaBreakDuration !== undefined ? localSettings.teaBreakDuration : 20)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.teaBreakDuration === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.teaBreakDuration === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
            </div>

            {/* Tea Break Cooldown/Gap */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Gap Required Between Tea Breaks (Minutes)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={localSettings.teaBreakGap !== undefined ? localSettings.teaBreakGap : 120}
                  onChange={e => handleLocalChange('teaBreakGap', parseInt(e.target.value) || 0)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
                <button
                  onClick={() => saveKey('teaBreakGap', localSettings.teaBreakGap !== undefined ? localSettings.teaBreakGap : 120)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.teaBreakGap === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.teaBreakGap === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
              <span className="text-slate-400 text-xs">
                {localSettings.teaBreakGap ? `${localSettings.teaBreakGap} minutes (${(localSettings.teaBreakGap / 60).toFixed(1)} hours)` : 'No waiting gap'}
              </span>
            </div>
          </div>
        </div>

        {/* Leave Allocations Card */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
          <h2 className="text-slate-800 font-semibold flex items-center gap-2 border-b border-border pb-3">
            <CalendarDays className="w-5 h-5 text-emerald-500" /> Leave Balance Allocations
          </h2>

          <div className="space-y-4">
            {/* Medical Leaves */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Medical Leave Allocation (Days)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={localSettings.leaveAllocations?.medical || 0}
                  onChange={e => handleLeaveChange('medical', parseInt(e.target.value) || 0)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
                <button
                  onClick={() => saveKey('leaveAllocations.medical', localSettings.leaveAllocations.medical)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus['leaveAllocations.medical'] === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus['leaveAllocations.medical'] === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Sync'}
                </button>
              </div>
              <span className="text-slate-400 text-xs">Note: Updating allocations automatically synchronizes leave balances for all active employee files.</span>
            </div>
          </div>
        </div>

        {/* Security & System preferences Card */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6 lg:col-span-2">
          <h2 className="text-slate-800 font-semibold flex items-center gap-2 border-b border-border pb-3">
            <Shield className="w-5 h-5 text-violet-500" /> Platform & Telemetry
          </h2>

          <div className="max-w-md">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Session Timeout Duration</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.sessionTimeout || ''}
                  onChange={e => handleLocalChange('sessionTimeout', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
                <button
                  onClick={() => saveKey('sessionTimeout', localSettings.sessionTimeout)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.sessionTimeout === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.sessionTimeout === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client & Employee Tea Break Allocation Rules Card */}
      {settings.teaBreakEnabled !== false && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-slate-800 font-semibold flex items-center gap-2">
                <Coffee className="w-5 h-5 text-indigo-500" /> Tea Break Access Control
              </h2>
              <p className="text-slate-500 text-xs mt-1">Selectively assign tea break privileges to companies or individual employees</p>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-border">
              <button
                onClick={() => { setAllocationTab('companies'); setFilterQuery(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  allocationTab === 'companies'
                    ? 'bg-white text-indigo-600 shadow-sm border border-border/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Client Companies
              </button>
              <button
                onClick={() => { setAllocationTab('employees'); setFilterQuery(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  allocationTab === 'employees'
                    ? 'bg-white text-indigo-600 shadow-sm border border-border/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Employees
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={allocationTab === 'companies' ? "Search client companies..." : "Search employees..."}
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              className="w-full border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          </div>

          {/* List Container */}
          <div className="max-h-[350px] overflow-y-auto pr-2 divide-y divide-border scrollbar-thin">
            {allocationTab === 'companies' ? (
              companies
                .filter(co => co.name.toLowerCase().includes(filterQuery.toLowerCase()))
                .map(co => (
                  <div key={co.id} className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-slate-800 text-sm font-semibold">{co.name}</h4>
                      <span className="text-slate-400 text-xs">{co.industry || 'General Industry'} · {co.contact || 'No Contact'}</span>
                    </div>
                    <button
                      onClick={() => handleToggleCompanyTeaBreak(co.id, co.teaBreakAllowed !== false)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        co.teaBreakAllowed !== false ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          co.teaBreakAllowed !== false ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))
            ) : (
              employees
                .filter(emp => emp.name.toLowerCase().includes(filterQuery.toLowerCase()))
                .map(emp => (
                  <div key={emp.id} className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-slate-800 text-sm font-semibold">{emp.name}</h4>
                      <span className="text-slate-400 text-xs">{emp.position} · {emp.department} · <strong className="text-slate-500">{emp.company || 'Our Company'}</strong></span>
                    </div>
                    <button
                      onClick={() => handleToggleEmployeeTeaBreak(emp.id, emp.teaBreakAllowed !== false)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        emp.teaBreakAllowed !== false ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          emp.teaBreakAllowed !== false ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))
            )}
            {((allocationTab === 'companies' && companies.filter(co => co.name.toLowerCase().includes(filterQuery.toLowerCase())).length === 0) ||
              (allocationTab === 'employees' && employees.filter(emp => emp.name.toLowerCase().includes(filterQuery.toLowerCase())).length === 0)) && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No matching records found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
