import React from 'react';
import { Bell, Clock, AlertTriangle } from 'lucide-react';

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

export function HRClientNotificationsView({ shiftNotices = [] }) {
  // Sort shift notices: informHR (urgent) first, then by date/creation descending
  const sortedNotices = [...shiftNotices].sort((a, b) => {
    if (a.informHR && !b.informHR) return -1;
    if (!a.informHR && b.informHR) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Client Notifications</h1>
        <p className="text-slate-500 text-sm mt-0.5">Telemetry log of shift start messages sent from clients to employees</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 flex flex-col">
        <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#5b4cf5]" />
          All Client Shift Messages ({sortedNotices.length})
        </h3>

        {sortedNotices.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 animate-bounce" />
            <p className="font-medium text-slate-500">No client notifications recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotices.map((notice, idx) => (
              <div
                key={notice._id || idx}
                className={`border rounded-2xl p-5 hover:bg-slate-50/50 transition-all shadow-sm ${
                  notice.informHR
                    ? 'border-rose-200 bg-rose-50/40'
                    : 'border-border bg-slate-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${
                    notice.informHR ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-[#5b4cf5]'
                  } flex-shrink-0`}>
                    {notice.informHR ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                          Client: {notice.companyName}
                        </span>
                        <span className="text-slate-300 text-xs">|</span>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          Target Employee: {notice.employeeName}
                        </span>
                      </div>
                      {notice.informHR && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-200 shadow-sm animate-pulse">
                          ⚠️ Urgent (&lt; 6h)
                        </span>
                      )}
                    </div>

                    <h4 className="text-slate-800 font-bold text-sm mt-2">
                      Scheduled Shift: {formatNoticeDateTime(notice.date, notice.time)}
                    </h4>

                    <div className="text-sm text-slate-600 leading-relaxed mt-3 bg-white border border-slate-100 p-3.5 rounded-xl italic">
                      &ldquo;{notice.reason}&rdquo;
                    </div>

                    <div className="mt-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Sent at: {new Date(notice.createdAt || Date.now()).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
