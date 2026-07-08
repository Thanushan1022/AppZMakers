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
    // Prevent negative numbers for numeric settings
    const numericKeys = ['breakTime', 'workHours', 'mealBreaksMax', 'teaBreaksMax', 'teaBreakDuration', 'teaBreakGap', 'sessionTimeout'];
    if (numericKeys.includes(key) && val !== '' && Number(val) < 0) {
      return;
    }
    setLocalSettings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleLeaveChange = (key, val) => {
    if (val !== '' && Number(val) < 0) return;
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
      <div className="relative z-10">
        <h1 className="text-slate-800 dark:text-slate-100" style={{ fontWeight: 800, fontSize: '1.75rem' }}>System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">Configure system-wide preferences, working times, and leave balance parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Configurations Card */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group space-y-6">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
          <h2 className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-3 border-b border-white/50 dark:border-slate-800/50 pb-4 text-lg relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
              <Clock className="w-5 h-5 text-indigo-500" />
            </div>
            Working Times & Hours
          </h2>

          <div className="space-y-4 relative z-10">
            {/* Break Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Daily Standard Meal Break Time (Hours)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  min="0"
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

            {/* Morning Shift Start Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Morning Shift Start Time</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="HH:MM (24-hour)"
                  pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                  value={localSettings.morningShiftStartTime || '09:00'}
                  onChange={e => handleLocalChange('morningShiftStartTime', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 font-mono"
                />
                <button
                  onClick={() => saveKey('morningShiftStartTime', localSettings.morningShiftStartTime)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.morningShiftStartTime === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.morningShiftStartTime === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
            </div>

            {/* Night Shift Start Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Night Shift Start Time</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="HH:MM (24-hour)"
                  pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                  value={localSettings.nightShiftStartTime || '21:00'}
                  onChange={e => handleLocalChange('nightShiftStartTime', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 font-mono"
                />
                <button
                  onClick={() => saveKey('nightShiftStartTime', localSettings.nightShiftStartTime)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.nightShiftStartTime === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.nightShiftStartTime === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
            </div>

            {/* Work Hours */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Standard Daily Work Hours</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  min="0"
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
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group space-y-6">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-700"></div>
          <h2 className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-3 border-b border-white/50 dark:border-slate-800/50 pb-4 text-lg relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center border border-amber-100 dark:border-amber-800/50">
              <Coffee className="w-5 h-5 text-amber-500" />
            </div>
            Tea Break Settings
          </h2>

          <div className="space-y-4 relative z-10">
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
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group space-y-6">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
          <h2 className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-3 border-b border-white/50 dark:border-slate-800/50 pb-4 text-lg relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
              <CalendarDays className="w-5 h-5 text-emerald-500" />
            </div>
            Leave Balance Allocations
          </h2>

          <div className="space-y-4 relative z-10">
            {/* Medical Leaves */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Medical Leave Allocation (Days)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
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

        {/* Department Overtime Rules */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group space-y-6 lg:col-span-2">
          <div className="absolute -top-16 -right-16 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-700"></div>
          <h2 className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-3 border-b border-white/50 dark:border-slate-800/50 pb-4 text-lg relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            Department Overtime Rules
          </h2>
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold text-center">Enable Confirmation</th>
                  <th className="px-4 py-3 font-semibold">Interval (mins)</th>
                  <th className="px-4 py-3 font-semibold">Timeout (mins)</th>
                  <th className="px-4 py-3 font-semibold text-center">Email Notify</th>
                  <th className="px-4 py-3 font-semibold">Max Hours</th>
                  <th className="px-4 py-3 rounded-tr-xl font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...new Set(employees.map(e => e.department).filter(Boolean))].map(dept => {
                  const ruleIndex = (localSettings.departmentOvertimeRules || []).findIndex(r => r.department === dept);
                  const rule = ruleIndex >= 0 ? localSettings.departmentOvertimeRules[ruleIndex] : {
                    department: dept, enabled: false, intervalMinutes: 60, timeoutMinutes: 30, emailNotification: true, maxOvertimeHours: 4
                  };
                  
                  const handleRuleChange = (field, val) => {
                    const newRules = [...(localSettings.departmentOvertimeRules || [])];
                    const idx = newRules.findIndex(r => r.department === dept);
                    if (idx >= 0) {
                      newRules[idx] = { ...newRules[idx], [field]: val };
                    } else {
                      newRules.push({ ...rule, [field]: val });
                    }
                    handleLocalChange('departmentOvertimeRules', newRules);
                  };

                  return (
                    <tr key={dept} className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">{dept}</td>
                      <td className="px-4 py-4 text-center">
                        <input type="checkbox" checked={rule.enabled} onChange={e => handleRuleChange('enabled', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                      </td>
                      <td className="px-4 py-4">
                        <input type="number" min="1" value={rule.intervalMinutes} onChange={e => handleRuleChange('intervalMinutes', Number(e.target.value))} className="w-20 border border-border rounded-lg px-2 py-1 text-sm bg-slate-50" />
                      </td>
                      <td className="px-4 py-4">
                        <input type="number" min="1" value={rule.timeoutMinutes} onChange={e => handleRuleChange('timeoutMinutes', Number(e.target.value))} className="w-20 border border-border rounded-lg px-2 py-1 text-sm bg-slate-50" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input type="checkbox" checked={rule.emailNotification} onChange={e => handleRuleChange('emailNotification', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                      </td>
                      <td className="px-4 py-4">
                        <input type="number" min="1" value={rule.maxOvertimeHours} onChange={e => handleRuleChange('maxOvertimeHours', Number(e.target.value))} className="w-20 border border-border rounded-lg px-2 py-1 text-sm bg-slate-50" />
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => saveKey('departmentOvertimeRules', localSettings.departmentOvertimeRules)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          {saveStatus.departmentOvertimeRules === 'saving' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Save All'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {[...new Set(employees.map(e => e.department).filter(Boolean))].length === 0 && (
                   <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">No departments found. Assign departments to employees first.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & System preferences Card */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group space-y-6 lg:col-span-2">
          <div className="absolute -top-16 -right-16 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-colors duration-700"></div>
          <h2 className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-3 border-b border-white/50 dark:border-slate-800/50 pb-4 text-lg relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center border border-violet-100 dark:border-violet-800/50">
              <Shield className="w-5 h-5 text-violet-500" />
            </div>
            Platform & Telemetry
          </h2>

          <div className="max-w-md relative z-10">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Session Timeout Duration</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
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

      {/* Client/Lead & Employee Tea Break Allocation Rules Card */}
      {settings.teaBreakEnabled !== false && (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-[2.5rem] border border-white dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group space-y-6">
          <div className="absolute -top-16 -left-16 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/50 dark:border-slate-800/50 pb-6 relative z-10">
            <div>
              <h2 className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-3 text-lg">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
                  <Coffee className="w-5 h-5 text-indigo-500" />
                </div>
                Tea Break Access Control
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2">Selectively assign tea break privileges to companies or individual employees</p>
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
                Client/Lead Companies
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
              placeholder={allocationTab === 'companies' ? "Search client/lead companies..." : "Search employees..."}
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
