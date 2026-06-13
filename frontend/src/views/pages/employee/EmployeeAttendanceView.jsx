import { useState } from 'react';
import { LogIn, LogOut, Coffee, Clock, Calendar, ChevronLeft, ChevronRight, AlertCircle, ClipboardList, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDecimalHours, formatBreakMinutes } from '../../../utils/timeFormatter';

const statusStyles = {
  present: { label: 'Present', cls: 'bg-emerald-50 text-emerald-700' },
  late: { label: 'Late', cls: 'bg-amber-50 text-amber-700' },
  absent: { label: 'Absent', cls: 'bg-red-50 text-red-700' },
  'half-day': { label: 'Half Day', cls: 'bg-sky-50 text-sky-700' },
};

export function EmployeeAttendanceView({
  checkedIn,
  onBreak,
  onTeaBreak,
  sessionSecs,
  breakSecs,
  teaBreakSecs,
  checkInTime,
  breaks,
  selectedMonth,
  setSelectedMonth,
  filteredAttendance,
  formatDuration,
  handleCheckIn,
  handleCheckOut,
  confirmCheckOut,
  showCheckoutConfirm,
  setShowCheckoutConfirm,
  handleBreak,
  handleTeaBreak,
  todayTasks = [],
  handleAddTask,
  // New props
  settings,
  targetWorkSecs,
  totalExtraHours,
  totalLessHours,
  remainingBreakSecs,
  isBreakOver,
  teaBreakEnabled,
  teaBreakLimitReached,
  teaBreakGapRemainingSecs,
  teaBreakDuration,
  // Filter props
  filterType,
  setFilterType,
  selectedWeekDate,
  setSelectedWeekDate,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  getWeekRange,
  selectedYear,
  setSelectedYear,
  selectedMonthNum,
  setSelectedMonthNum,
}) {
  const [isTaskBoxExpanded, setIsTaskBoxExpanded] = useState(false);
  const [taskDesc, setTaskDesc] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskError, setTaskError] = useState('');
  const [selectedTasks, setSelectedTasks] = useState(null);

  const wordCount = taskDesc.trim().split(/\s+/).filter(Boolean).length;

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setTaskError('');
    if (!taskDesc.trim()) {
      setTaskError('Task description is required.');
      return;
    }
    if (wordCount > 50) {
      setTaskError('Task description must not exceed 50 words.');
      return;
    }
    const res = await handleAddTask(taskDesc.trim(), taskTime.trim());
    if (res.success) {
      setTaskDesc('');
      setTaskTime('');
    } else {
      setTaskError(res.error || 'Failed to save task.');
    }
  };

  const formatGapTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    return `${m}m ${s}s`;
  };

  const getTeaBreakDetails = (breaks = []) => {
    const teaBreaks = breaks.filter(b => b.type === 'tea');
    const count = teaBreaks.length;
    if (count === 0) return '—';
    
    const getSecsFromTime = (tStr) => {
      if (!tStr) return 0;
      const parts = tStr.split(':').map(Number);
      const h = parts[0] || 0;
      const m = parts[1] || 0;
      const s = parts[2] || 0;
      return h * 3600 + m * 60 + s;
    };
    
    let totalSecs = 0;
    teaBreaks.forEach(b => {
      if (b.start && b.end) {
        let bIn = getSecsFromTime(b.start);
        let bOut = getSecsFromTime(b.end);
        if (bOut < bIn) bOut += 86400;
        totalSecs += (bOut - bIn);
      }
    });
    
    const totalMins = Math.round(totalSecs / 60);
    return `${count}-${totalMins} min`;
  };

  const netWork = sessionSecs;
  const currentTarget = targetWorkSecs || 28800;
  const progress = Math.min(100, (netWork / currentTarget) * 100);

  const weeklyTotalHours = filterType === 'weekly'
    ? filteredAttendance.reduce((sum, r) => sum + (r.totalHours || 0), 0)
    : 0;

  const handlePrevWeek = () => {
    if (!selectedWeekDate) return;
    const [y, m, d] = selectedWeekDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 7);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    setSelectedWeekDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextWeek = () => {
    if (!selectedWeekDate) return;
    const [y, m, d] = selectedWeekDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 7);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    setSelectedWeekDate(`${newY}-${newM}-${newD}`);
  };

  const availableYears = [];
  for (let y = 2030; y >= 2024; y--) {
    availableYears.push(y);
  }

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const getCompanyMonthRangeLabel = (yearStr, monthNumStr) => {
    const yr = Number(yearStr);
    const mo = Number(monthNumStr);
    let prevYr = yr;
    let prevMo = mo - 1;
    if (prevMo === 0) {
      prevMo = 12;
      prevYr -= 1;
    }
    const formatMonthName = (m) => {
      const dates = new Date(2000, m - 1, 1);
      return dates.toLocaleDateString('en-US', { month: 'short' });
    };
    return `${formatMonthName(prevMo)} 28, ${prevYr} - ${formatMonthName(mo)} 27, ${yr}`;
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Attendance</h1>
        <p className="text-slate-500 text-sm mt-0.5">Track your daily check-in, check-out, and breaks</p>
      </div>

      {/* Main clock */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center">
          <p className="text-slate-400 text-sm mb-2">Current Session Timer</p>
          <div className="text-white mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '3.5rem', letterSpacing: '0.05em' }}>
            {formatDuration(sessionSecs)}
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            {checkedIn ? (
              <>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Session active {checkInTime ? `since ${checkInTime}` : ''}
              </>
            ) : (
              <span>Not checked in</span>
            )}
          </div>

          {/* Progress ring area */}
          {checkedIn && (
            <div className="mt-6 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>0h</span>
                <span className="text-slate-300">{Math.round(progress)}% of {Math.round(currentTarget / 3600)}h target</span>
                <span>{Math.round(currentTarget / 3600)}h</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%`, background: progress >= 100 ? '#10b981' : '#4338ca' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {!checkedIn ? (
              <button
                onClick={handleCheckIn}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-medium transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Mark Check-In
              </button>
            ) : (
              <>
                <button
                  onClick={handleBreak}
                  disabled={onTeaBreak}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-colors border ${
                    onBreak
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <Coffee className="w-5 h-5" />
                  {onBreak ? 'End Meal Break' : 'Start Meal Break'}
                </button>
                {teaBreakEnabled && (
                  <>
                    {onTeaBreak ? (
                      <button
                        onClick={handleTeaBreak}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-colors border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      >
                        <Coffee className="w-5 h-5 text-emerald-500" />
                        End Tea Break
                      </button>
                    ) : teaBreakLimitReached ? (
                      <span className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-400 border border-dashed border-slate-200">
                        Tea Break Limit Reached
                      </span>
                    ) : teaBreakGapRemainingSecs > 0 ? (
                      <span className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 border border-dashed border-amber-200 animate-pulse">
                        Next Tea Break: {formatGapTime(teaBreakGapRemainingSecs)}
                      </span>
                    ) : (
                      <button
                        onClick={handleTeaBreak}
                        disabled={onBreak}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-colors border bg-slate-50 text-slate-700 border-border hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Coffee className="w-5 h-5 text-emerald-500" />
                        Tea Break ({teaBreakDuration} min)
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={handleCheckOut}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Mark Check-Out
                </button>
              </>
            )}
          </div>

          {checkedIn && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
              {[
                { label: 'Work Time', value: formatDuration(netWork), color: 'text-emerald-600' },
                { label: 'Meal Break', value: formatDuration(breakSecs), color: 'text-amber-500' },
                { label: 'Tea Break', value: formatDuration(teaBreakSecs), color: 'text-emerald-500' },
                { label: 'Remaining', value: formatDuration(Math.max(0, currentTarget - netWork)), color: 'text-indigo-600' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`${s.color} font-semibold`} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem' }}>{s.value}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Breaks today */}
      {breaks.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2"><Coffee className="w-4 h-4 text-amber-500" />Today's Breaks</h3>
          <div className="space-y-2">
            {breaks.map((b, i) => (
              <div key={i} className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${b.type === 'tea' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                <span className="font-medium capitalize">{b.type === 'tea' ? 'Tea Break' : 'Meal Break'}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-slate-500">
                  {b.start} → {b.end || <span className={b.type === 'tea' ? 'text-emerald-600 animate-pulse' : 'text-amber-600 animate-pulse'}>ongoing</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Tasks Section */}
      <div className="bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/40 rounded-2xl border border-indigo-100 overflow-hidden shadow-sm">
        <button
          onClick={() => setIsTaskBoxExpanded(!isTaskBoxExpanded)}
          className={`w-full flex items-center justify-between p-6 transition-all text-left cursor-pointer ${
            isTaskBoxExpanded ? 'bg-indigo-600/5 border-b border-indigo-100/60' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/10">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-indigo-950 font-bold text-base">Today's Work Log</h3>
              <p className="text-slate-500 text-xs mt-0.5">Log completed tasks for transparency and productivity tracking ({todayTasks.length} logged)</p>
            </div>
          </div>
          <div className="text-indigo-600 font-semibold">
            {isTaskBoxExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {isTaskBoxExpanded && (
          <div className="p-6 space-y-5">
            {checkedIn ? (
              <form onSubmit={handleTaskSubmit} className="bg-white rounded-xl border border-indigo-100 p-5 space-y-4 shadow-md shadow-indigo-100/10">
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  Log New Task
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-semibold mb-1.5">Task Description (Max 50 words)</label>
                  <textarea
                    value={taskDesc}
                    onChange={(e) => {
                      setTaskDesc(e.target.value);
                      if (taskError) setTaskError('');
                    }}
                    placeholder="Describe what you accomplished..."
                    rows={2}
                    className="w-full text-sm border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium placeholder:text-slate-350 transition-all"
                  />
                  <div className="flex justify-between items-center mt-1.5 text-xs">
                    <span className={wordCount > 50 ? 'text-rose-500 font-bold' : 'text-slate-400 font-medium'}>
                      {wordCount} / 50 words
                    </span>
                    {taskError && <span className="text-rose-500 font-semibold">{taskError}</span>}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={taskTime}
                      onChange={(e) => setTaskTime(e.target.value)}
                      placeholder="Time/Duration context (e.g. 10:00 AM, 30 mins) - Optional"
                      className="w-full text-sm border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium placeholder:text-slate-350 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/15"
                  >
                    <Plus className="w-4 h-4" />
                    Log Task
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm font-semibold flex items-center gap-2.5 shadow-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>You can only log tasks during active working hours. Please Check-In first.</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                Logged Tasks Today
              </div>
              {todayTasks.length > 0 ? (
                <div className="space-y-2.5">
                  {todayTasks.map((task, idx) => (
                    <div key={task._id || idx} className="p-4 bg-white border-l-4 border-l-indigo-500 border border-indigo-100/50 rounded-xl text-sm flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-1">
                        <p className="text-slate-700 font-semibold leading-relaxed">{task.description}</p>
                        <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50/50 px-2 py-0.5 rounded-full w-fit block font-mono">
                          🕒 Logged at {task.timeContext || new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-indigo-100/60 rounded-xl bg-white/50 font-medium">
                  No tasks logged for today's session yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attendance history */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex flex-col gap-4 mb-6 border-b border-border pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-slate-800 font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />Attendance History
            </h3>
            
            {/* Filter Type Swapper */}
            <div className="flex bg-slate-100 p-1 rounded-xl items-center self-end">
              {[
                { id: 'monthly', label: 'Monthly' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'custom', label: 'Custom Range' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    filterType === tab.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Filter Input Panel */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
            {filterType === 'monthly' && (
              <div className="flex flex-wrap items-end gap-4 w-full">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Select Year</label>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="text-sm border border-border rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer min-w-[120px]"
                  >
                    {availableYears.map(y => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Select Month</label>
                  <select
                    value={selectedMonthNum}
                    onChange={e => setSelectedMonthNum(e.target.value)}
                    className="text-sm border border-border rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer min-w-[150px]"
                  >
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-slate-500 font-semibold pb-2 bg-indigo-50/50 px-3 py-2 rounded-lg border border-indigo-100/30">
                  🗓️ Company Month Period: <strong className="text-indigo-700">{getCompanyMonthRangeLabel(selectedYear, selectedMonthNum)}</strong>
                </div>
              </div>
            )}

            {filterType === 'weekly' && (
              <div className="flex flex-wrap items-end gap-3.5 w-full">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Select Day in Week</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevWeek}
                      className="p-2 border border-border rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                      title="Previous Week"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <input
                      type="date"
                      value={selectedWeekDate}
                      onChange={e => setSelectedWeekDate(e.target.value)}
                      className="text-sm border border-border rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={handleNextWeek}
                      className="p-2 border border-border rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                      title="Next Week"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {(() => {
                  const { mondayStr, sundayStr } = getWeekRange(selectedWeekDate);
                  const format = (s) => {
                    const [y, m, d] = s.split('-');
                    const date = new Date(y, m - 1, d);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  };
                  return (
                    <div className="text-xs text-slate-500 font-medium pb-2">
                      Resolved Week: <strong className="text-slate-700">{format(mondayStr)}</strong> to <strong className="text-slate-700">{format(sundayStr)}</strong>
                    </div>
                  );
                })()}
              </div>
            )}

            {filterType === 'custom' && (
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={e => setCustomStartDate(e.target.value)}
                    className="text-sm border border-border rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={e => setCustomEndDate(e.target.value)}
                    className="text-sm border border-border rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {filterType === 'weekly' && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4 shadow-sm">
            <div>
              <div className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Weekly Requirement Progress</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-slate-800 font-bold text-2xl" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {weeklyTotalHours.toFixed(2)}h
                </span>
                <span className="text-slate-400 text-sm">/ 40.0h</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {weeklyTotalHours >= 40 ? (
                <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm border border-emerald-100">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  Weekly Requirement Completed
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm border border-amber-100 animate-pulse">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  Weekly Requirement Incomplete
                </span>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Check In', 'Check Out', 'Meal Break', 'Tea Break', 'Net Hours', 'Extra Hours', 'Less Hours', 'Status', 'Tasks'].map(h => (
                  <th key={h} className="text-left text-slate-400 font-medium pb-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAttendance.map((rec) => {
                const st = statusStyles[rec.status] || { label: rec.status, cls: 'bg-slate-50 text-slate-700' };
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4 text-slate-700 whitespace-nowrap">
                      <div>{new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{rec.checkIn || '—'}</div>
                    </td>
                    <td className="py-3 pr-4 text-slate-700 whitespace-nowrap">
                      {rec.checkOut ? (
                        <>
                          <div>
                            {new Date(rec.checkOutDate || rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{rec.checkOut}</div>
                        </>
                      ) : (
                        rec.checkIn ? <span className="text-emerald-500 text-xs font-semibold">Active</span> : '—'
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatBreakMinutes(rec.breakMinutes)}</td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{getTeaBreakDetails(rec.breaks)}</td>
                    <td className="py-3 pr-4 text-slate-700 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatDecimalHours(rec.totalHours)}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-emerald-600 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {rec.extraHours > 0 ? `+${formatDecimalHours(rec.extraHours)}` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {formatDecimalHours(rec.lessHours)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {rec.tasks && rec.tasks.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedTasks({ name: 'My tasks', date: rec.date || 'Today', tasks: rec.tasks })}
                          className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center font-semibold"
                          title="View Completed Tasks"
                        >
                          <ClipboardList className="w-4 h-4" />
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full ml-1 font-bold">{rec.tasks.length}</span>
                        </button>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
              {filteredAttendance.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400 text-sm">No records for this month</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary row */}
        {filteredAttendance.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Present Days', value: filteredAttendance.filter(r => r.status === 'present' || r.status === 'late').length },
              { label: 'Absent Days', value: filteredAttendance.filter(r => r.status === 'absent').length },
              { label: 'Total Hours', value: formatDecimalHours(filteredAttendance.reduce((s, r) => s + r.totalHours, 0)) },
              { label: 'Extra Hours', value: formatDecimalHours(filteredAttendance.reduce((s, r) => s + (r.extraHours || 0), 0)) },
              { label: 'Less Hours', value: formatDecimalHours(filteredAttendance.reduce((s, r) => s + (r.lessHours || 0), 0)) },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-slate-800 font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check-Out Confirmation Modal */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 text-amber-500 mb-4">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <h3 className="text-slate-800 text-lg font-bold">Check-Out Confirmation</h3>
              </div>
              <p className="text-slate-600 text-sm mb-6">
                Would you like to take a break (Meal / Tea Break) before leaving, or would you like to proceed with checking out?
              </p>
              
              <div className="space-y-3">
                {/* Take Meal Break button */}
                {checkedIn && !onBreak && (
                  <button
                    onClick={() => {
                      setShowCheckoutConfirm(false);
                      handleBreak();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold py-3 px-4 rounded-xl border border-amber-200 transition-colors text-sm cursor-pointer"
                  >
                    <Coffee className="w-4 h-4" />
                    Take a Meal Break
                  </button>
                )}

                {/* Take Tea Break button */}
                {checkedIn && teaBreakEnabled && !teaBreakLimitReached && teaBreakGapRemainingSecs <= 0 && !onTeaBreak && (
                  <button
                    onClick={() => {
                      setShowCheckoutConfirm(false);
                      handleTeaBreak();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-3 px-4 rounded-xl border border-emerald-200 transition-colors text-sm cursor-pointer"
                  >
                    <Coffee className="w-4 h-4 text-emerald-500" />
                    Take a Tea Break
                  </button>
                )}

                {/* Proceed to Check-out */}
                <button
                  onClick={confirmCheckOut}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Proceed to Check-Out
                </button>

                {/* Cancel */}
                <button
                  onClick={() => setShowCheckoutConfirm(false)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Tasks Modal */}
      {selectedTasks && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-slate-800 font-bold text-base">Completed Tasks</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{selectedTasks.name} · {selectedTasks.date}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTasks(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {selectedTasks.tasks && selectedTasks.tasks.length > 0 ? (
                  selectedTasks.tasks.map((task, idx) => (
                    <div key={task._id || idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm space-y-1">
                      <p className="text-slate-700 font-medium leading-relaxed">{task.description}</p>
                      {task.timeContext && (
                        <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full w-fit block font-mono">
                          🕒 Logged at {task.timeContext}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm py-4 text-center">No tasks logged for this day.</p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTasks(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

