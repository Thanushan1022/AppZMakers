import { Coffee, LogIn, LogOut, TrendingUp, CalendarDays, Timer, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyHoursData } from '../../../models/mockData';
import { formatDecimalHours } from '../../../utils/timeFormatter';
import { CompanyCalendarView } from '../company/CompanyCalendarView';

export function EmployeeDashboardView({
  employee,
  checkedIn,
  onBreak,
  onTeaBreak,
  sessionSecs,
  breakSecs,
  teaBreakSecs,
  checkInTime,
  balance,
  presentDays,
  absentDays,
  totalWorkingDays,
  attendancePct,
  monthlyHours,
  totalLeaveUsed,
  totalLeave,
  filteredLeaves,
  filteredAttendance,
  formatDuration,
  handleCheckIn,
  handleCheckOut,
  confirmCheckOut,
  showCheckoutConfirm,
  setShowCheckoutConfirm,
  handleBreak,
  handleTeaBreak,
  // New props
  settings,
  remainingBreakSecs,
  isBreakOver,
  targetWorkSecs,
  totalExtraHours,
  totalLessHours,
  teaBreakEnabled,
  teaBreakAllowed,
  teaBreakLimitReached,
    teaBreakGapRemainingSecs,
    teaBreakDuration,
    todayTasks = [],
    shiftNotices = [],
    mealBreakCount,
    mealBreakMax,
    mealBreakLimitReached,
  }) {
    const recentAttendance = filteredAttendance.slice(0, 5);
  
    const formatGapTime = (secs) => {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      if (h > 0) {
        return `${h}h ${m}m ${s}s`;
      }
      return `${m}m ${s}s`;
    };
  
    const statusColor = {
      present: 'text-emerald-600 bg-emerald-50',
      late: 'text-amber-600 bg-amber-55',
      absent: 'text-red-600 bg-red-50',
      'half-day': 'text-sky-600 bg-sky-50',
    };
  
    return (
      <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {/* Exceeded Break Time Notification */}
      {checkedIn && isBreakOver && onBreak && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-sm font-medium animate-pulse">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <div>
            <div className="font-semibold text-rose-800">Break time over! Go back to work.</div>
            <div className="text-xs text-rose-600 mt-0.5">Your standard daily work target hours are automatically adjusted to compensate for extra break duration.</div>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Good morning, {employee.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">{employee.position} · {employee.department}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl text-sm text-slate-500">
          <span>Today's Target Break: {settings?.breakTime || '1 hour'}</span>
        </div>
      </div>

      {/* Attendance action widget */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">Today's Session</p>
            <div className="text-4xl text-slate-800 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              {checkedIn ? formatDuration(sessionSecs) : '—:——:——'}
            </div>
            {checkedIn && (
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Check-in: <strong className="text-slate-600">{checkInTime}</strong></span>
                {onBreak && <span className="flex items-center gap-1 text-amber-500"><Coffee className="w-3 h-3" />Meal Break: {formatDuration(breakSecs)}</span>}
                {onTeaBreak && <span className="flex items-center gap-1 text-emerald-500"><Coffee className="w-3 h-3" />Tea Break: {formatDuration(teaBreakSecs)}</span>}
              </div>
            )}
            {!checkedIn && <p className="text-slate-400 text-xs">You haven't checked in yet today</p>}
          </div>

          <div className="flex items-center gap-3">
            {checkedIn && (
              <div className="flex items-center gap-2">
                 <button
                  onClick={handleBreak}
                  disabled={onTeaBreak || (!onBreak && mealBreakLimitReached)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${onBreak
                      ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                      : mealBreakLimitReached
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                    }`}
                >
                  <Coffee className={`w-4 h-4 ${onBreak ? 'text-amber-500' : mealBreakLimitReached ? 'text-slate-400' : 'text-blue-500'}`} />
                  {onBreak ? `End Meal Break (${mealBreakCount}-${mealBreakMax})` : mealBreakLimitReached ? `Meal Break Limit Reached (${mealBreakCount}-${mealBreakMax})` : `Start Meal Break (${mealBreakCount}-${mealBreakMax})`}
                </button>
                {teaBreakEnabled && teaBreakAllowed && (
                  <>
                    {onTeaBreak ? (
                      <button
                        onClick={handleTeaBreak}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                      >
                        <Coffee className="w-4 h-4 text-emerald-500" />
                        End Tea Break
                      </button>
                    ) : teaBreakLimitReached ? (
                      <span className="text-slate-400 text-xs font-semibold px-3 py-2 bg-slate-100 rounded-xl border border-dashed border-slate-200 flex items-center gap-1">
                        Tea Break Limit Reached
                      </span>
                    ) : teaBreakGapRemainingSecs > 0 ? (
                      <span className="text-amber-600 text-xs font-semibold px-3 py-2 bg-amber-50 rounded-xl border border-dashed border-amber-200 flex items-center gap-1 animate-pulse">
                        <Timer className="w-3.5 h-3.5" />
                        Next Tea Break: {formatGapTime(teaBreakGapRemainingSecs)}
                      </span>
                    ) : (
                      <button
                        onClick={handleTeaBreak}
                        disabled={onBreak}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border bg-slate-50 text-slate-600 border-border hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Coffee className="w-4 h-4 text-emerald-500" />
                        Tea Break ({teaBreakDuration} min)
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
            <button
              onClick={checkedIn ? handleCheckOut : handleCheckIn}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${checkedIn ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
              {checkedIn ? <><LogOut className="w-4 h-4" />Check Out</> : <><LogIn className="w-4 h-4" />Check In</>}
            </button>
          </div>
        </div>

        {checkedIn && (
          <div className={`mt-4 pt-4 border-t border-border grid grid-cols-2 ${teaBreakEnabled && teaBreakAllowed ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-4`}>
            <div className="text-center">
              <div className="text-emerald-600 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {formatDuration(sessionSecs)}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">Net Work Time</div>
            </div>
            <div className="text-center">
              <div className="text-amber-500 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {formatDuration(breakSecs)}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">Meal Break</div>
            </div>
            {teaBreakEnabled && teaBreakAllowed && (
              <div className="text-center">
                <div className="text-emerald-500 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                  {formatDuration(teaBreakSecs)}
                </div>
                <div className="text-slate-400 text-xs mt-0.5">Tea Break</div>
              </div>
            )}
            <div className="text-center">
              <div className={`${isBreakOver ? 'text-rose-600 font-bold' : 'text-slate-600'} text-sm`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {isBreakOver ? 'Over Limit!' : formatDuration(remainingBreakSecs)}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">Remaining Break</div>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {formatDuration(Math.max(0, targetWorkSecs - sessionSecs))}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">Remaining Work</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attendance Rate', value: `${attendancePct}%`, sub: `${presentDays}/${totalWorkingDays} days`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Monthly Hours', value: formatDecimalHours(monthlyHours), sub: 'This month', icon: Timer, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Extra Hours', value: formatDecimalHours(totalExtraHours), sub: 'Total excess hours', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Less Hours', value: formatDecimalHours(totalLessHours), sub: 'Total deficit hours', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-slate-800 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.375rem' }}>{s.value}</div>
              <div className="text-slate-800 text-sm font-medium">{s.label}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly hours chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Weekly Hours — May 2026</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyHoursData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4338ca" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="hours" stroke="#4338ca" strokeWidth={2} fill="url(#hoursGrad)" dot={{ fill: '#4338ca', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leave balance */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Leave Balance</h3>
          <div className="space-y-4">
            {[
              { label: 'Annual', data: balance.annual, color: 'bg-indigo-500' },
              { label: 'Casual', data: balance.casual, color: 'bg-sky-500' },
              { label: 'Medical', data: balance.medical || balance.personal, color: 'bg-emerald-500' },
            ].map(({ label, data, color }) => {
              if (!data) return null;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600">{label}</span>
                    <span className="text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{data.total - data.used}/{data.total} remaining</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${((data.total - data.used) / data.total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* Recent leave requests */}
      {filteredLeaves.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Recent Leave Requests</h3>
          <div className="space-y-3">
            {filteredLeaves.slice(0, 3).map((leave) => (
              <div key={leave.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-medium capitalize">{leave.type} Leave</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${leave.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        leave.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>{leave.status}</span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1">{leave.startDate} → {leave.endDate} · {leave.days} day{leave.days !== 1 ? 's' : ''}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{leave.reason}</div>
                </div>
                {leave.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> :
                  leave.status === 'rejected' ? <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" /> : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embedded Location-Based Company Calendar */}
      {employee && (
        <div className="pt-4 border-t border-border">
          <CompanyCalendarView role="employee" employeeId={employee.id} />
        </div>
      )}

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
                {checkedIn && !onBreak && !mealBreakLimitReached && (
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
                {checkedIn && teaBreakEnabled && teaBreakAllowed && !teaBreakLimitReached && teaBreakGapRemainingSecs <= 0 && !onTeaBreak && (
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
    </div>
  );
}
