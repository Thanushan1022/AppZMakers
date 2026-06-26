import React from 'react';
import { Bell, CalendarDays, CheckCircle2, Trash2 } from 'lucide-react';

const formatNoticeDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return '';
  try {
    const dateObj = new Date(`${dateStr}T00:00:00`);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${hours}:${minutesStr} ${ampm}`;

    return `${formattedDate} at ${formattedTime}`;
  } catch (err) {
    return `${dateStr} @ ${timeStr}`;
  }
};

export function EmployeeClientNotificationsView({ employee, shiftNotices = [], allLeaves = [] }) {
  const userId = employee?.id || employee?._id || 'employee_default';

  const [readIds, setReadIds] = React.useState([]);
  const [deletedIds, setDeletedIds] = React.useState([]);

  React.useEffect(() => {
    if (userId !== 'employee_default') {
      try {
        setReadIds(JSON.parse(localStorage.getItem(`readNoticeIds_${userId}`) || '[]'));
        setDeletedIds(JSON.parse(localStorage.getItem(`deletedNoticeIds_${userId}`) || '[]'));
      } catch {
        setReadIds([]);
        setDeletedIds([]);
      }
    }
  }, [userId]);

  const handleMarkAsRead = (id, updatedAt) => {
    const key = `${id}_${updatedAt}`;
    const updated = [...readIds, key];
    setReadIds(updated);
    localStorage.setItem(`readNoticeIds_${userId}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDelete = (id) => {
    const updated = [...deletedIds, id];
    setDeletedIds(updated);
    localStorage.setItem(`deletedNoticeIds_${userId}`, JSON.stringify(updated));
  };

  const visibleNotices = shiftNotices.filter(n => !deletedIds.includes(n._id));

  const formatNoticeDateOnly = (dateStr) => {
    if (!dateStr) return '';
    try {
      const dateObj = new Date(`${dateStr}T00:00:00`);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Client/Lead Notifications</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Alerts, shift start instructions, and leaves sent by your hiring client</p>
        </div>
      </div>

      <div className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white dark:border-slate-800 p-6 md:p-8 shadow-2xl shadow-emerald-100/50 dark:shadow-none min-h-[400px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <h3 className="text-slate-800 dark:text-slate-100 font-black text-xl mb-8 flex items-center gap-3 tracking-tight border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/50 dark:to-teal-900/50 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 shadow-sm relative">
              <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              {visibleNotices.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800 shadow-sm">
                  {visibleNotices.length}
                </span>
              )}
            </div>
            Activity Feed
          </h3>

          {visibleNotices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6 relative">
                <Bell className="w-10 h-10 opacity-30 text-emerald-500 dark:text-emerald-400" />
                <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 rounded-full animate-ping opacity-50"></div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              <p className="font-bold text-slate-500 dark:text-slate-400 text-lg">You're all caught up!</p>
              <p className="text-sm font-medium mt-1">No new client/lead notifications at the moment.</p>
            </div>
          ) : (
            <div className="space-y-5 relative before:absolute before:inset-y-0 before:left-[27px] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800 pl-2">
              {visibleNotices.map((notice, idx) => {
                const readKey = `${notice._id}_${notice.updatedAt || notice.createdAt}`;
                const isUnread = !readIds.includes(readKey);
                const isLeave = notice.noticeType === 'leave';

                let cardStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm dark:shadow-none';
                let iconWrapperStyle = 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700';
                let iconStyle = 'text-slate-400 dark:text-slate-500';

                if (isUnread) {
                  if (isLeave) {
                    cardStyle = 'border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50/80 to-white dark:from-amber-900/30 dark:to-slate-800 shadow-md shadow-amber-100/50 dark:shadow-none scale-[1.01] z-10 relative ring-1 ring-amber-400/20';
                    iconWrapperStyle = 'bg-amber-100 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800/50 shadow-md shadow-amber-200/50 dark:shadow-none animate-pulse';
                    iconStyle = 'text-amber-600 dark:text-amber-400';
                  } else {
                    cardStyle = 'border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-50/80 to-white dark:from-emerald-900/30 dark:to-slate-800 shadow-md shadow-emerald-100/50 dark:shadow-none scale-[1.01] z-10 relative ring-1 ring-emerald-400/20';
                    iconWrapperStyle = 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800/50 shadow-md shadow-emerald-200/50 dark:shadow-none animate-pulse';
                    iconStyle = 'text-emerald-600 dark:text-emerald-400';
                  }
                } else {
                  if (isLeave) {
                    cardStyle = 'border-amber-100 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-900/10 shadow-sm dark:shadow-none';
                    iconWrapperStyle = 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30';
                    iconStyle = 'text-amber-400 dark:text-amber-500';
                  } else if (notice.informHR) {
                    cardStyle = 'border-rose-100 dark:border-rose-900/30 bg-rose-50/10 dark:bg-rose-900/10 shadow-sm dark:shadow-none';
                    iconWrapperStyle = 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30';
                    iconStyle = 'text-rose-400 dark:text-rose-500';
                  }
                }

                let matchedLeave = null;
                if (isLeave) {
                  // The client-assigned leave will have a reason starting with "Client assigned leave:"
                  // or the same dates
                  matchedLeave = allLeaves.find(l => 
                    l.type === 'client-assigned' && 
                    l.startDate === notice.date && 
                    (l.endDate === notice.endDate || (!l.endDate && !notice.endDate))
                  );
                }

                return (
                  <div key={notice._id || idx} className="relative flex gap-6 pl-12 group">
                    {/* Timeline dot/icon */}
                    <div className="absolute left-0 top-6 -translate-y-1/2 z-10">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${iconWrapperStyle}`}>
                        <CalendarDays className={`w-5 h-5 ${iconStyle}`} />
                      </div>
                    </div>

                    <div className={`flex-1 border rounded-2xl p-6 transition-all duration-300 ${cardStyle}`}>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                {notice.companyName}
                              </span>

                              {isLeave ? (
                                <span className="text-[10px] text-amber-700 bg-amber-100/80 border border-amber-200 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Leave Notice
                                </span>
                              ) : (
                                <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Shift Message
                                </span>
                              )}

                              {!isLeave && notice.informHR && (
                                <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span> Urgent / Late
                                </span>
                              )}

                              {isUnread && (
                                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1.5 ${isLeave ? 'text-amber-700 bg-amber-100 border border-amber-300' : 'text-emerald-700 bg-emerald-100 border border-emerald-300'
                                  }`}>
                                  ✨ New Activity
                                </span>
                              )}
                            </div>

                            <h4 className="text-slate-800 dark:text-slate-100 font-black text-base md:text-lg tracking-tight">
                              {isLeave ? (
                                <span>Leave Period: <span className="text-amber-600 dark:text-amber-400 font-mono text-sm ml-1">{formatNoticeDateOnly(notice.date)} — {formatNoticeDateOnly(notice.endDate)}</span></span>
                              ) : (
                                <span>Shift Scheduled: <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm ml-1">{formatNoticeDateTime(notice.date, notice.time)}</span></span>
                              )}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 self-start">
                            {isUnread ? (
                              <button
                                onClick={() => handleMarkAsRead(notice._id, notice.updatedAt || notice.createdAt)}
                                className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 ${isLeave
                                    ? 'text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 border-amber-200 shadow-amber-200/50'
                                    : 'text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border-emerald-200 shadow-emerald-200/50'
                                  }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Mark Read
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDelete(notice._id)}
                                className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 px-3 py-2 rounded-xl border border-rose-100 hover:border-rose-600 transition-all cursor-pointer shadow-sm active:scale-95 opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className={`text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border p-4 rounded-xl shadow-inner ${isLeave ? 'border-amber-100/50 dark:border-amber-800/50' : 'border-slate-100 dark:border-slate-700/50'
                          }`}>
                          <span className="text-slate-400 font-serif text-lg leading-none mr-1">&ldquo;</span>
                          {notice.reason}
                          <span className="text-slate-400 font-serif text-lg leading-none ml-1">&rdquo;</span>
                        </div>

                        {isLeave && matchedLeave && matchedLeave.status !== 'pending' && (
                          <div className={`mt-2 p-3 rounded-xl border flex items-start gap-3 ${
                            matchedLeave.status === 'approved' 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' 
                              : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50'
                          }`}>
                            {matchedLeave.status === 'approved' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-rose-200 dark:bg-rose-800 flex items-center justify-center mt-0.5"><div className="w-2 h-0.5 bg-rose-600 dark:bg-rose-400"></div></div>
                            )}
                            <div>
                              <p className={`text-sm font-bold ${
                                matchedLeave.status === 'approved' 
                                  ? 'text-emerald-800 dark:text-emerald-300' 
                                  : 'text-rose-800 dark:text-rose-300'
                              }`}>
                                HR Status: {matchedLeave.status.toUpperCase()}
                              </p>
                              {matchedLeave.status === 'rejected' && matchedLeave.rejectionReason && (
                                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                                  Reason: {matchedLeave.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                          Received {new Date(notice.createdAt || Date.now()).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
