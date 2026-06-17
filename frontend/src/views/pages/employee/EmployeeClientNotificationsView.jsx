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

export function EmployeeClientNotificationsView({ employee, shiftNotices = [] }) {
  const userId = employee?.legacyId || employee?._id || 'employee_default';

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
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Client Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">Alerts, shift start instructions, and leaves sent by your hiring client</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 flex flex-col">
        <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          Client Messages & Leaves ({visibleNotices.length})
        </h3>

        {visibleNotices.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 animate-bounce text-emerald-500" />
            <p className="font-medium text-slate-500">No client notifications received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleNotices.map((notice, idx) => {
              const readKey = `${notice._id}_${notice.updatedAt || notice.createdAt}`;
              const isUnread = !readIds.includes(readKey);
              const isLeave = notice.noticeType === 'leave';
              
              // Styling logic: 
              // Unread Shift: border-emerald-300 bg-emerald-50/15
              // Unread Leave: border-amber-300 bg-amber-50/15
              // Read Leave: border-amber-100 bg-amber-50/5
              // Read Shift (Urgent): border-amber-200 bg-amber-50/10
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
                  cardStyle = 'border-amber-200 bg-amber-50/20';
                  iconStyle = 'bg-amber-100 text-amber-600';
                }
              }

              return (
                <div
                  key={notice._id || idx}
                  className={`border rounded-2xl p-5 hover:bg-slate-50/50 transition-all shadow-sm relative ${cardStyle}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${iconStyle} flex-shrink-0`}>
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                            Client: {notice.companyName}
                          </span>
                          {isLeave ? (
                            <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">
                              🍁 Client Leave
                            </span>
                          ) : (
                            <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold uppercase">
                              💬 Shift Message
                            </span>
                          )}
                          {!isLeave && notice.informHR && (
                            <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                              ⚠️ Late Schedule Notice
                            </span>
                          )}
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
                        Received: {new Date(notice.createdAt || Date.now()).toLocaleString()}
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
