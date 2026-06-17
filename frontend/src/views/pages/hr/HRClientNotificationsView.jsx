import React from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

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

export function HRClientNotificationsView({ hrProfile, shiftNotices = [] }) {
  const userId = hrProfile?.legacyId || hrProfile?._id || 'hr_default';

  const [readIds, setReadIds] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`readNoticeIds_${userId}`) || '[]');
    } catch {
      return [];
    }
  });

  const [deletedIds, setDeletedIds] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`deletedNoticeIds_${userId}`) || '[]');
    } catch {
      return [];
    }
  });

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

  // Sort visible shift notices: informHR (urgent) first, then by date/creation descending
  const sortedNotices = [...visibleNotices].sort((a, b) => {
    if (a.informHR && !b.informHR) return -1;
    if (!a.informHR && b.informHR) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

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
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Client Notifications</h1>
        <p className="text-slate-500 text-sm mt-0.5">Telemetry log of shift start messages and leave assignments sent from clients to employees</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 flex flex-col">
        <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          All Client Messages & Leaves ({sortedNotices.length})
        </h3>

        {sortedNotices.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 animate-bounce text-emerald-500" />
            <p className="font-medium text-slate-500">No client notifications recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotices.map((notice, idx) => {
              const readKey = `${notice._id}_${notice.updatedAt || notice.createdAt}`;
              const isUnread = !readIds.includes(readKey);
              const isLeave = notice.noticeType === 'leave';

              // Styling logic: 
              // Unread Shift: border-emerald-300 bg-emerald-50/15
              // Unread Leave: border-amber-300 bg-amber-50/15
              // Read Leave: border-amber-100 bg-amber-50/5
              // Read Shift (Urgent): border-rose-200 bg-rose-50/40
              // Read Shift (Normal): border-border bg-slate-50/30
              let cardStyle = 'border-border bg-slate-50/30';
              let iconStyle = 'bg-slate-100 text-slate-500';
              
              if (isUnread) {
                if (isLeave) {
                  cardStyle = 'border-amber-300 bg-amber-50/15 shadow-amber-100/30';
                  iconStyle = 'bg-amber-100 text-amber-600';
                } else {
                  cardStyle = 'border-emerald-300 bg-emerald-50/15 shadow-emerald-100/30';
                  iconStyle = 'bg-emerald-100 text-emerald-600';
                }
              } else {
                if (isLeave) {
                  cardStyle = 'border-amber-100 bg-amber-50/5';
                  iconStyle = 'bg-amber-50 text-amber-500';
                } else if (notice.informHR) {
                  cardStyle = 'border-rose-200 bg-rose-50/40';
                  iconStyle = 'bg-rose-100 text-rose-600';
                }
              }

              return (
                <div
                  key={notice._id || idx}
                  className={`border rounded-2xl p-5 hover:bg-slate-50/50 transition-all shadow-sm relative ${cardStyle}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${iconStyle} flex-shrink-0`}>
                      {isLeave ? (
                        <Clock className="w-5 h-5" />
                      ) : notice.informHR ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                            Client: {notice.companyName}
                          </span>
                          <span className="text-slate-300 text-xs">|</span>
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                            Target Employee: {notice.employeeName}
                          </span>
                          {isLeave ? (
                            <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">
                              🍁 Client Leave
                            </span>
                          ) : notice.informHR ? (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-200 shadow-sm animate-pulse">
                              ⚠️ Urgent (&lt; 6h)
                            </span>
                          ) : null}
                          {isUnread && (
                            <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold animate-pulse ${
                              isLeave
                                ? 'text-amber-700 bg-amber-100 border-amber-250'
                                : 'text-emerald-700 bg-emerald-100 border-emerald-250'
                            }`}>
                              New / Edited Leave Assignment
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isUnread ? (
                            <button
                              onClick={() => handleMarkAsRead(notice._id, notice.updatedAt || notice.createdAt)}
                              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-sm ${
                                isLeave
                                  ? 'text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-100'
                                  : 'text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-100'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Mark as Read
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDelete(notice._id)}
                              className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-100 transition-all cursor-pointer shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="text-slate-800 font-bold text-sm mt-2">
                        {isLeave ? (
                          <span>Assigned Leave Period: {formatNoticeDateOnly(notice.date)} to {formatNoticeDateOnly(notice.endDate)}</span>
                        ) : (
                          <span>Scheduled Shift: {formatNoticeDateTime(notice.date, notice.time)}</span>
                        )}
                      </h4>

                      <div className={`text-sm text-slate-600 leading-relaxed mt-3 bg-white border p-3.5 rounded-xl italic ${
                        isLeave ? 'border-amber-100/50' : 'border-slate-100'
                      }`}>
                        &ldquo;{notice.reason}&rdquo;
                      </div>

                      <div className="mt-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Sent at: {new Date(notice.createdAt || Date.now()).toLocaleString()}
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
  );
}
