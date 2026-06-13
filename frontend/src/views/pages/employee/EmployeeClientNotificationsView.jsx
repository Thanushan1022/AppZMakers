import React from 'react';
import { Bell, CalendarDays } from 'lucide-react';

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

export function EmployeeClientNotificationsView({ shiftNotices = [] }) {
  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Client Notifications</h1>
        <p className="text-slate-500 text-sm mt-0.5">Alerts and shift start instructions sent by your hiring client</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 flex flex-col">
        <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#5b4cf5]" />
          Shift Messages Log ({shiftNotices.length})
        </h3>

        {shiftNotices.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 animate-bounce" />
            <p className="font-medium text-slate-500">No client notifications received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shiftNotices.map((notice, idx) => (
              <div
                key={notice._id || idx}
                className={`border rounded-2xl p-5 hover:bg-slate-50/50 transition-all shadow-sm ${
                  notice.informHR
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-border bg-slate-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${
                    notice.informHR ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-[#5b4cf5]'
                  } flex-shrink-0`}>
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                        Client: {notice.companyName}
                      </span>
                      {notice.informHR && (
                        <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                          ⚠️ Late Schedule Notice
                        </span>
                      )}
                    </div>

                    <h4 className="text-slate-800 font-bold text-sm mt-1">
                      Scheduled Shift: {formatNoticeDateTime(notice.date, notice.time)}
                    </h4>

                    <div className="text-sm text-slate-600 leading-relaxed mt-3 bg-white border border-slate-100 p-3.5 rounded-xl italic">
                      &ldquo;{notice.reason}&rdquo;
                    </div>

                    <div className="mt-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Received: {new Date(notice.createdAt || Date.now()).toLocaleString()}
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
