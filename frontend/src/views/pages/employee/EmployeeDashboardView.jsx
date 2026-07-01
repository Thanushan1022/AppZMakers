import { Coffee, Utensils, LogIn, LogOut, TrendingUp, CalendarDays, Timer, AlertCircle, CheckCircle2, XCircle, Trophy, Star, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyHoursData } from '../../../models/mockData';
import { formatDecimalHours } from '../../../utils/timeFormatter';
import confetti from 'canvas-confetti';
import React, { useEffect, useMemo, useCallback } from 'react';

export const EmployeeDashboardView = React.memo(function EmployeeDashboardView({
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
  isTeaBreakOver,
  teaBreakGapRemainingSecs,
  teaBreakDuration,
  todayTasks = [],
  shiftNotices = [],
  mealBreakCount,
  mealBreakMax,
  mealBreakLimitReached,
  showGoodbye,
  todaySummary,
  showSessionOverModal,
  setShowSessionOverModal,
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

  const isBirthday = (() => {
    if (!employee || !employee.dateOfBirth) return false;
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return employee.dateOfBirth.endsWith(`${mm}-${dd}`);
  })();



  useEffect(() => {
    if (isBirthday) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isBirthday]);

  const { isAnniversary, yearsOfService } = (() => {
    if (!employee || !employee.joinDate) return { isAnniversary: false, yearsOfService: 0 };
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    if (employee.joinDate.endsWith(`${mm}-${dd}`)) {
      const joinYear = parseInt(employee.joinDate.substring(0, 4), 10);
      const years = today.getFullYear() - joinYear;
      if (years > 0) {
        return { isAnniversary: true, yearsOfService: years };
      }
    }
    return { isAnniversary: false, yearsOfService: 0 };
  })();

  useEffect(() => {
    if (isAnniversary) {
      const duration = 10000; // 10 seconds of fireworks
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100, colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'] };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Firework 1 (left side)
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        // Firework 2 (right side)
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
        // Firework 3 (center)
        if (Math.random() > 0.5) {
            confetti(Object.assign({}, defaults, { 
            particleCount: particleCount * 1.5, 
            origin: { x: randomInRange(0.4, 0.6), y: Math.random() - 0.3 } 
            }));
        }
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isAnniversary]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Exceeded Break Time Notification */}
      {checkedIn && isBreakOver && onBreak && (
        <div className="bg-gradient-to-r from-rose-500/10 to-red-500/10 dark:from-rose-500/20 dark:to-red-500/20 backdrop-blur-md border border-rose-200/50 dark:border-rose-800/50 rounded-2xl p-4 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm font-medium animate-pulse shadow-lg shadow-rose-500/5">
          <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
          <div>
            <div className="font-bold text-rose-800 dark:text-rose-100 text-base">Break time over! Go back to work.</div>
            <div className="text-sm text-rose-600 dark:text-rose-400 mt-0.5 opacity-90">Your standard daily work target hours are automatically adjusted to compensate for extra break duration.</div>
          </div>
        </div>
      )}

      {/* Hero / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-8 text-white shadow-xl shadow-indigo-500/20 group">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-100">
              {getGreeting()}, {employee.name.split(' ')[0]} 👋
            </h1>
            <p className="text-indigo-100 font-medium text-lg flex items-center gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-md border border-white/10">{employee.position}</span>
              <span className="opacity-70">•</span>
              <span className="opacity-90">{employee.department}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-inner">
             <Timer className="w-5 h-5 text-indigo-200" />
             <div className="flex flex-col">
               <span className="text-xs text-indigo-200 uppercase tracking-wider font-bold">Target Break</span>
               <span className="text-sm font-semibold">{settings?.breakTime || '1 hour'}</span>
             </div>
          </div>
        </div>
      </div>

      {isBirthday && (
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 rounded-3xl p-6 text-white shadow-xl shadow-pink-500/30 relative overflow-hidden animate-in slide-in-from-top-4 duration-700">
          <div className="absolute -top-10 -right-10 text-9xl opacity-20 hover:scale-110 transition-transform duration-500 cursor-default">🎂</div>
          <div className="absolute -bottom-6 -left-6 text-7xl opacity-20 animate-bounce">🎈</div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/40">
              🎉
            </div>
            <div>
              <h2 className="text-3xl font-black mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Happy Birthday, {employee.name.split(' ')[0]}!</h2>
              <p className="text-pink-50 text-base font-medium opacity-95">
                Wishing you a fantastic day filled with joy and success. Have a wonderful birthday! 🎂✨
              </p>
            </div>
          </div>
        </div>
      )}

      {isAnniversary && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden animate-in slide-in-from-top-4 duration-700">
          <div className="absolute -top-10 -right-10 text-9xl opacity-20 hover:rotate-12 transition-transform duration-500">🏆</div>
          <div className="absolute -bottom-6 -left-6 text-7xl opacity-20 animate-pulse">🌟</div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center shadow-inner border border-white/40">
              <span className="text-3xl font-black leading-none drop-shadow-md">{yearsOfService}</span>
              <span className="text-[11px] uppercase font-bold tracking-wider opacity-90">Year{yearsOfService !== 1 ? 's' : ''}</span>
            </div>
            <div>
              <h2 className="text-3xl font-black mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Happy Work Anniversary!</h2>
              <p className="text-indigo-50 text-base font-medium opacity-95">
                Congratulations on completing {yearsOfService} year{yearsOfService !== 1 ? 's' : ''} with us, {employee.name.split(' ')[0]}! Thank you for your continued dedication. 🚀👏
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Action Widget - Premium Glassmorphism */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-none p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none">
        {showGoodbye && todaySummary ? (
          <div className="relative overflow-hidden flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-700 py-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl -m-8 p-8 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500 opacity-20 rounded-full blur-3xl animate-pulse delay-700"></div>
            
            <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center border-4 border-amber-200/50 shadow-[0_0_40px_rgba(251,191,36,0.6)] mb-2 animate-bounce">
              <Trophy className="w-12 h-12 text-amber-900" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-200 animate-ping" />
            </div>
            
            <div className="relative z-10 space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 tracking-tight drop-shadow-sm">
                Outstanding Work!
              </h2>
              <p className="text-indigo-200 text-lg font-medium max-w-lg mx-auto">
                Thank you for your dedication today, <span className="font-bold text-white">{employee.name.split(' ')[0]}</span>. Your efforts are truly appreciated. See you next time! 🌟
              </p>
            </div>
            
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-left bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-inner mt-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1.5"><Timer className="w-3.5 h-3.5"/> Total Work</span>
                <p className="text-2xl font-black text-white font-mono drop-shadow-md">{formatDuration(todaySummary.sessionSecs)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5"/> Meal Break</span>
                <p className="text-2xl font-black text-amber-300 font-mono drop-shadow-md">{formatDuration(todaySummary.breakSecs)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5"/> Tea Break</span>
                <p className="text-2xl font-black text-emerald-300 font-mono drop-shadow-md">{formatDuration(todaySummary.teaBreakSecs)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1.5"><Star className="w-3.5 h-3.5"/> Tasks</span>
                <p className="text-2xl font-black text-white font-mono drop-shadow-md">{todaySummary.tasks?.length || 0}</p>
              </div>
            </div>

            <div className="relative z-10 pt-6 text-sm text-indigo-300/70 font-medium flex items-center gap-2">
               <Timer className="w-4 h-4 animate-spin-slow" /> Resetting workspace shortly...
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
                     <Timer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Today's Session</p>
                </div>
                
                <div className="text-5xl text-slate-800 dark:text-slate-100 mb-3 tracking-tight" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
                  {checkedIn ? formatDuration(sessionSecs) : '—:——:——'}
                </div>
                
                {checkedIn && (
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 font-medium">
                      Check-in: <strong className="text-slate-800 dark:text-slate-100 ml-1">{checkInTime}</strong>
                    </span>
                    {onBreak && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 dark:bg-amber-900/40 backdrop-blur-sm border border-amber-200 dark:border-amber-800/50 rounded-lg text-amber-700 dark:text-amber-400 font-bold animate-pulse">
                        <Utensils className="w-4 h-4" /> Meal Break: {formatDuration(breakSecs)}
                      </span>
                    )}
                    {onTeaBreak && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-900/40 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-emerald-700 dark:text-emerald-400 font-bold animate-pulse">
                        <Coffee className="w-4 h-4" /> Tea Break: {formatDuration(teaBreakSecs)}
                      </span>
                    )}
                  </div>
                )}
                {!checkedIn && <p className="text-slate-400 dark:text-slate-500 text-sm font-medium bg-slate-50/50 dark:bg-slate-800/50 inline-block px-3 py-1 rounded-lg">You haven't checked in yet today.</p>}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                {checkedIn && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      onClick={handleBreak}
                      disabled={onTeaBreak || (!onBreak && (mealBreakLimitReached || isBreakOver))}
                      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform active:scale-95 border-2 shadow-lg ${onBreak
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/50 shadow-amber-200/50 dark:shadow-none hover:bg-amber-200 dark:hover:bg-amber-900/70 hover:shadow-amber-300/50 dark:hover:shadow-none'
                        : (mealBreakLimitReached || isBreakOver)
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed shadow-none'
                          : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 shadow-blue-100/50 dark:shadow-none hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                    >
                      <Utensils className={`w-5 h-5 ${onBreak ? 'text-amber-600 dark:text-amber-400' : (mealBreakLimitReached || isBreakOver) ? 'text-slate-400 dark:text-slate-500' : 'text-blue-500 dark:text-blue-400'}`} />
                      {onBreak ? `End Meal Break (${mealBreakCount}-${mealBreakMax})` : (mealBreakLimitReached || isBreakOver) ? `Meal Limit Reached` : `Start Meal Break (${mealBreakCount}-${mealBreakMax})`}
                    </button>
                    {teaBreakEnabled && teaBreakAllowed && (
                      <>
                        {onTeaBreak ? (
                          <button
                            onClick={handleTeaBreak}
                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform active:scale-95 border-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/50 shadow-lg shadow-emerald-200/50 dark:shadow-none hover:bg-emerald-200 dark:hover:bg-emerald-900/70 hover:shadow-emerald-300/50"
                          >
                            <Coffee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            End Tea Break
                          </button>
                        ) : (teaBreakLimitReached || isTeaBreakOver) ? (
                          <span className="text-slate-400 dark:text-slate-500 text-sm font-bold px-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2">
                            Tea Limit Reached
                          </span>
                        ) : teaBreakGapRemainingSecs > 0 ? (
                          <span className="text-amber-700 dark:text-amber-500 text-sm font-bold px-6 py-4 bg-amber-50 dark:bg-amber-900/30 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 flex items-center justify-center gap-2">
                            <Timer className="w-5 h-5 animate-spin-slow" />
                            Next Tea: {formatGapTime(teaBreakGapRemainingSecs)}
                          </span>
                        ) : (
                          <button
                            onClick={handleTeaBreak}
                            disabled={onBreak}
                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform active:scale-95 border-2 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 shadow-lg shadow-emerald-100/50 dark:shadow-none hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                          >
                            <Coffee className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            Tea Break ({teaBreakDuration}m)
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
                <button
                  onClick={checkedIn ? handleCheckOut : handleCheckIn}
                  className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-black transition-all duration-300 transform active:scale-95 shadow-xl ${checkedIn ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-red-500/30' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/30'
                    }`}
                >
                  {checkedIn ? <><LogOut className="w-5 h-5" /> CHECK OUT</> : <><LogIn className="w-5 h-5" /> CHECK IN</>}
                </button>
              </div>
            </div>

            {checkedIn && (
              <div className={`mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 grid grid-cols-2 ${teaBreakEnabled && teaBreakAllowed ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4`}>
                {[
                  { label: 'Net Work Time', val: sessionSecs, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                  { label: 'Meal Break', val: breakSecs, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                  ...(teaBreakEnabled && teaBreakAllowed ? [{ label: isTeaBreakOver ? 'Over Limit!' : 'Tea Break', val: teaBreakSecs, color: isTeaBreakOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400', bg: isTeaBreakOver ? 'bg-rose-50 dark:bg-rose-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30', isDanger: isTeaBreakOver }] : []),
                  { label: isBreakOver ? 'Over Limit!' : 'Remaining Break', val: remainingBreakSecs, color: isBreakOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400', bg: isBreakOver ? 'bg-rose-50 dark:bg-rose-900/30' : 'bg-slate-50 dark:bg-slate-800/50', isDanger: isBreakOver },
                  { label: 'Remaining Work', val: Math.max(0, targetWorkSecs - sessionSecs), color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' }
                ].map((stat, idx) => (
                  <div key={idx} className={`flex flex-col items-center justify-center p-4 rounded-2xl ${stat.bg} border border-white/50 dark:border-slate-700/50 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md`}>
                    <div className={`${stat.color} text-lg ${stat.isDanger ? 'font-black animate-pulse' : 'font-bold'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {formatDuration(stat.val)}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold mt-1 text-center">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats - Floating Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Monthly Hours', value: formatDecimalHours(monthlyHours), sub: 'This month', icon: Timer, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30', border: 'border-indigo-200 dark:border-indigo-800' },
          { label: 'Extra Hours', value: formatDecimalHours(totalExtraHours), sub: 'Total excess hours', icon: CheckCircle2, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800' },
          { label: 'Less Hours', value: formatDecimalHours(totalLessHours), sub: 'Total deficit hours', icon: XCircle, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30', border: 'border-rose-200 dark:border-rose-800' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-3xl border border-white dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none relative overflow-hidden group">
              <div className={`absolute -right-6 -top-6 w-24 h-24 ${s.bg} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out`}></div>
              <div className="relative z-10">
                <div className={`w-12 h-12 ${s.bg} border ${s.border} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div className="text-slate-800 dark:text-slate-100 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: '1.75rem' }}>{s.value}</div>
                <div className="text-slate-700 dark:text-slate-300 text-sm font-bold">{s.label}</div>
                <div className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly hours chart */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-3xl border border-white dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-800 dark:text-slate-100 text-lg font-black tracking-tight">Weekly Hours Analysis</h3>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider">May 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyHoursData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
                itemStyle={{ color: '#4f46e5' }}
              />
              <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={4} fill="url(#hoursGrad)" dot={{ fill: '#fff', stroke: '#4f46e5', strokeWidth: 3, r: 6 }} activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leave balance */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-3xl border border-white dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 lg:p-8 flex flex-col">
          <h3 className="text-slate-800 dark:text-slate-100 text-lg font-black tracking-tight mb-6">Leave Balance</h3>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {[
              { label: 'Annual', data: balance.annual, color: 'bg-indigo-500', light: 'bg-indigo-100 dark:bg-indigo-900/50' },
              { label: 'Casual', data: balance.casual, color: 'bg-sky-500', light: 'bg-sky-100 dark:bg-sky-900/50' },
              { label: 'Medical', data: balance.medical || balance.personal, color: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/50' },
            ].map(({ label, data, color, light }) => {
              if (!data) return null;
              const pct = ((data.total - data.used) / data.total) * 100;
              return (
                <div key={label} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{label}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-800 dark:text-slate-100" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{data.total - data.used}</span>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ {data.total} d</span>
                    </div>
                  </div>
                  <div className={`h-3 ${light} rounded-full overflow-hidden relative shadow-inner`}>
                    <div className={`absolute top-0 left-0 h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }}>
                       <div className="w-full h-full opacity-30 bg-gradient-to-r from-transparent to-white"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent leave requests */}
      {filteredLeaves.length > 0 && (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-3xl border border-white dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 lg:p-8">
          <h3 className="text-slate-800 dark:text-slate-100 text-lg font-black tracking-tight mb-6">Recent Leave Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLeaves.slice(0, 3).map((leave) => (
              <div key={leave.id} className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute top-0 left-0 w-1 h-full ${leave.status === 'approved' ? 'bg-emerald-400' : leave.status === 'rejected' ? 'bg-red-400' : 'bg-amber-400'}`}></div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-slate-800 dark:text-slate-100 font-bold capitalize text-base">{leave.type} Leave</span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-black ${leave.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' :
                        leave.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                        }`}>{leave.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-900/50 inline-block px-2 py-1 rounded-md mb-2">
                      <span>{leave.startDate} → {leave.endDate}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <strong className="text-slate-600 dark:text-slate-300">{leave.days} day{leave.days !== 1 ? 's' : ''}</strong>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">{leave.reason}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 ${leave.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400' : leave.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400'}`}>
                    {leave.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : leave.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <Timer className="w-5 h-5 animate-pulse" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-Out Confirmation Modal - Premium Style */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-8 h-8 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="text-slate-800 dark:text-slate-100 text-2xl font-black tracking-tight mb-2">Check-Out Confirmation</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
                {(onBreak || onTeaBreak) 
                  ? "You are currently on a break. Checking out now will automatically end your break. Are you sure you want to proceed?" 
                  : "Would you like to take a break before leaving, or proceed directly with checking out of your shift?"}
              </p>

              <div className="space-y-4">
                {/* Take Meal Break button */}
                {checkedIn && !onBreak && !mealBreakLimitReached && !isBreakOver && (
                  <button
                    onClick={() => {
                      setShowCheckoutConfirm(false);
                      handleBreak();
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-amber-50 text-amber-600 font-bold py-4 px-6 rounded-2xl border-2 border-amber-200 transition-all duration-200 text-sm shadow-sm hover:shadow-md active:scale-95"
                  >
                    <Utensils className="w-5 h-5" />
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
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-emerald-50 text-emerald-600 font-bold py-4 px-6 rounded-2xl border-2 border-emerald-200 transition-all duration-200 text-sm shadow-sm hover:shadow-md active:scale-95"
                  >
                    <Coffee className="w-5 h-5" />
                    Take a Tea Break
                  </button>
                )}

                {/* Proceed to Check-out */}
                <button
                  onClick={confirmCheckOut}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black tracking-wider py-4 px-6 rounded-2xl shadow-lg shadow-red-500/30 transition-all duration-200 text-sm active:scale-95"
                >
                  <LogOut className="w-5 h-5" />
                  PROCEED TO CHECK-OUT
                </button>

                {/* Cancel */}
                <button
                  onClick={() => setShowCheckoutConfirm(false)}
                  className="w-full mt-2 text-slate-500 hover:text-slate-800 font-bold py-3 transition-colors text-sm"
                >
                  Cancel and return to dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Over Modal */}
      {showSessionOverModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-200 dark:border-blue-800">
                <AlertCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-slate-800 dark:text-slate-100 text-2xl font-black tracking-tight mb-2">Session Over</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
                Today's section is over. If you need further details, please contact HR.
              </p>
              <button
                onClick={() => setShowSessionOverModal(false)}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black tracking-wider py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-200 text-sm active:scale-95"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
