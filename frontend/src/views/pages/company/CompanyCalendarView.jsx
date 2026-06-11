import React, { useState } from 'react';
import { useCalendarController } from '../../../controllers/useCalendarController';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Globe,
  MapPin,
  Loader2,
  Trash2,
  Edit2,
  Info
} from 'lucide-react';

const EVENT_TYPE_COLORS = {
  holiday: 'bg-yellow-100 text-red-700 border-yellow-300 font-bold',
  'bank-holiday': 'bg-amber-50 text-amber-700 border-amber-100',
  festival: 'bg-orange-50 text-orange-700 border-orange-100',
  'company-holiday': 'bg-red-50 text-red-700 border-red-100',
  'team-event': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  meeting: 'bg-blue-50 text-blue-700 border-blue-100',
  training: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'day-off': 'bg-violet-50 text-violet-700 border-violet-100',
  special: 'bg-purple-50 text-purple-700 border-purple-100',
  'annual-leave': 'bg-indigo-50 text-indigo-750 text-indigo-700 border-indigo-200 font-bold shadow-sm shadow-indigo-500/5',
  'casual-leave': 'bg-sky-50 text-sky-750 text-sky-700 border-sky-200 font-bold shadow-sm shadow-sky-500/5',
  'medical-leave': 'bg-rose-50 text-rose-750 text-rose-700 border-rose-200 font-bold shadow-sm shadow-rose-500/5',
};

const EVENT_TYPE_DOTS = {
  holiday: 'bg-rose-500',
  'bank-holiday': 'bg-amber-500',
  festival: 'bg-orange-500',
  'company-holiday': 'bg-red-500',
  'team-event': 'bg-emerald-500',
  meeting: 'bg-blue-500',
  training: 'bg-indigo-500',
  'day-off': 'bg-violet-500',
  special: 'bg-purple-500',
  'annual-leave': 'bg-indigo-600',
  'casual-leave': 'bg-sky-500',
  'medical-leave': 'bg-rose-500',
};

const COUNTRY_STYLES = {
  'sri lanka': { code: 'lk', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-sm shadow-emerald-500/5' },
  'usa': { code: 'us', color: 'bg-blue-50 text-blue-800 border-blue-300 font-bold shadow-sm shadow-blue-500/5' },
  'united states': { code: 'us', color: 'bg-blue-50 text-blue-800 border-blue-300 font-bold shadow-sm shadow-blue-500/5' },
  'uk': { code: 'gb', color: 'bg-purple-50 text-purple-800 border-purple-300 font-bold shadow-sm shadow-purple-500/5' },
  'united kingdom': { code: 'gb', color: 'bg-purple-50 text-purple-800 border-purple-300 font-bold shadow-sm shadow-purple-500/5' },
  'canada': { code: 'ca', color: 'bg-rose-50 text-rose-800 border-rose-300 font-bold shadow-sm shadow-rose-500/5' },
  'australia': { code: 'au', color: 'bg-amber-50 text-amber-800 border-amber-300 font-bold shadow-sm shadow-amber-500/5' }
};

const getEventStyle = (event) => {
  if (event.type === 'annual-leave') {
    return { flag: '🌴', color: EVENT_TYPE_COLORS['annual-leave'] };
  }
  if (event.type === 'casual-leave') {
    return { flag: '🏠', color: EVENT_TYPE_COLORS['casual-leave'] };
  }
  if (event.type === 'medical-leave') {
    return { flag: '🤒', color: EVENT_TYPE_COLORS['medical-leave'] };
  }

  if (event.type === 'holiday' || event.type === 'bank-holiday' || event.type === 'festival') {
    let countryKey = '';
    if (event.targetValue) {
      countryKey = event.targetValue.toLowerCase().trim();
    } else {
      const match = event.title.match(/^\[(.*?)\]/);
      if (match) {
        countryKey = match[1].toLowerCase().trim();
      }
    }
    if (countryKey && COUNTRY_STYLES[countryKey]) {
      return COUNTRY_STYLES[countryKey];
    }
    return { code: '', color: 'bg-teal-50 text-teal-800 border-teal-300 font-bold' };
  }
  return { code: '', color: EVENT_TYPE_COLORS[event.type] || 'bg-slate-50 text-slate-700 border-slate-200' };
};

export function CompanyCalendarView({ role, employeeId, companyId }) {
  const {
    events,
    loading,
    importing,
    currentDate,
    setCurrentDate,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleImportHolidays,
  } = useCalendarController(role, employeeId, companyId);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'team-event',
    targetLocation: 'all',
    targetValue: '',
  });

  const [importCountry, setImportCountry] = useState('Sri Lanka');

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const dayEvents = getEventsForDay(day);
    setSelectedDayEvents({ day, events: dayEvents });
  };

  // Calendar Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prefixArray = Array.from({ length: firstDayIndex }, (_, i) => null);

  const calendarDays = [...prefixArray, ...daysArray];

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(
      (e) => e.start <= dateStr && e.end >= dateStr
    );
  };

  const canManageEvents = role === 'hr' || role === 'superadmin';

  const openAddEvent = (day) => {
    if (!canManageEvents) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setEventForm({
      title: '',
      description: '',
      start: dateStr,
      end: dateStr,
      type: 'team-event',
      targetLocation: 'all',
      targetValue: '',
    });
    setEditingEventId(null);
    setShowEventModal(true);
  };

  const openEditEvent = (event, e) => {
    e.stopPropagation();
    const isHoliday = event.type === 'holiday' || event.type === 'bank-holiday' || event.type === 'festival' || !!event.googleEventId;
    if (!canManageEvents || isHoliday) {
      setSelectedEvent(event);
      return;
    }
    setEventForm({
      title: event.title,
      description: event.description,
      start: event.start,
      end: event.end,
      type: event.type,
      targetLocation: event.targetLocation,
      targetValue: event.targetValue || '',
    });
    setEditingEventId(event._id || event.id);
    setShowEventModal(true);
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (editingEventId) {
      const res = await handleUpdateEvent(editingEventId, eventForm);
      if (res.success) setShowEventModal(false);
    } else {
      const res = await handleCreateEvent(eventForm);
      if (res.success) setShowEventModal(false);
    }
  };

  const handleDelete = async (eventId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      await handleDeleteEvent(eventId);
      setShowEventModal(false);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Company Calendar</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {canManageEvents 
              ? 'Manage company events'
              : 'View company holidays, team events, and meetings'
            }
          </p>
        </div>
        {canManageEvents && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer border border-border shadow-sm"
            >
              <Globe className="w-4 h-4 text-indigo-500" />
              Import Holidays
            </button>
            <button
              onClick={() => {
                const todayStr = new Date().toISOString().split('T')[0];
                setEventForm({
                  title: '',
                  description: '',
                  start: todayStr,
                  end: todayStr,
                  type: 'team-event',
                  targetLocation: 'all',
                  targetValue: '',
                });
                setEditingEventId(null);
                setShowEventModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        )}
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/50">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-indigo-500" />
            <span className="text-slate-800 font-bold text-lg">
              {monthNames[month]} {year}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-border text-center bg-slate-50/30 text-slate-400 text-xs font-semibold py-2.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
            <span className="text-sm text-slate-500 font-medium">Loading calendar...</span>
          </div>
        ) : (
          <div className="grid grid-cols-7 grid-rows-5 bg-slate-100 gap-[1px]">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isToday = day &&
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              const isSunday = idx % 7 === 0;
              const isSaturday = idx % 7 === 6;
              const isWeekend = isSunday || isSaturday;

              return (
                <div
                  key={idx}
                  onClick={() => day && handleDayClick(day)}
                  className={`min-h-[135px] p-2 flex flex-col justify-between transition-colors relative ${day ? 'cursor-pointer' : ''} ${isWeekend ? 'bg-slate-50/70 hover:bg-slate-100/60' : 'bg-white hover:bg-slate-50/50'} ${!day ? 'bg-slate-50/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center' : isSunday ? 'text-rose-600' : isSaturday ? 'text-slate-400' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-2 flex-1 overflow-y-auto max-h-[96px]">
                    {dayEvents.slice(0, 3).map((event) => {
                      const style = getEventStyle(event);
                      return (
                        <div
                          key={event._id || event.id}
                          onClick={(e) => openEditEvent(event, e)}
                          className={`px-1.5 py-0.5 rounded-lg border text-[10px] font-semibold truncate transition-all ${style.color}`}
                          title={event.title}
                        >
                          {style.code ? (
                            <img
                              src={`https://flagcdn.com/16x12/${style.code}.png`}
                              alt=""
                              className="inline-block mr-1 w-3.5 h-2.5 object-cover rounded-sm align-middle mb-0.5"
                            />
                          ) : style.flag ? (
                            <span className="mr-1">{style.flag}</span>
                          ) : (
                            (event.type === 'holiday' || event.type === 'bank-holiday' || event.type === 'festival') && (
                              <span className="mr-1">🌐</span>
                            )
                          )}
                          {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-slate-400 font-bold pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* Add / Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800 font-semibold">
                {editingEventId ? 'Edit Calendar Event' : 'Add New Event'}
              </h3>
              {editingEventId && (
                <button
                  onClick={(e) => handleDelete(editingEventId, e)}
                  className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitEvent} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  placeholder="e.g. Sinhala & Tamil New Year"
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Details about the event"
                  rows={2}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={eventForm.start}
                    onChange={(e) => setEventForm((p) => ({ ...p, start: e.target.value }))}
                    required
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={eventForm.end}
                    onChange={(e) => setEventForm((p) => ({ ...p, end: e.target.value }))}
                    required
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">Event Type</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none bg-slate-50"
                  >
                    <option value="holiday">Public Holiday</option>
                    <option value="bank-holiday">Bank Holiday</option>
                    <option value="festival">Festival Day</option>
                    <option value="company-holiday">Company Holiday</option>
                    <option value="team-event">Team Event</option>
                    <option value="meeting">Meeting</option>
                    <option value="training">Training Session</option>
                    <option value="day-off">Employee Day-Off</option>
                    <option value="special">Special Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">Target Location</label>
                  <select
                    value={eventForm.targetLocation}
                    onChange={(e) => setEventForm((p) => ({ ...p, targetLocation: e.target.value, targetValue: '' }))}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none bg-slate-50"
                  >
                    <option value="all">All Locations</option>
                    <option value="country">Country</option>
                    <option value="branch">Branch/Office</option>
                  </select>
                </div>
                {eventForm.targetLocation !== 'all' && (
                  <div>
                    <label className="block text-slate-600 text-xs font-semibold mb-1.5">Location Name</label>
                    <input
                      type="text"
                      value={eventForm.targetValue}
                      onChange={(e) => setEventForm((p) => ({ ...p, targetValue: e.target.value }))}
                      required
                      placeholder={eventForm.targetLocation === 'country' ? 'e.g. Sri Lanka' : 'e.g. Colombo'}
                      className="w-full border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none bg-slate-50"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  {editingEventId ? 'Save Changes' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 border border-border py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Display Modal (Employee View/Read Only click) */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`w-3 h-3 rounded-full ${EVENT_TYPE_DOTS[selectedEvent.type] || 'bg-slate-400'}`} />
              <h3 className="text-slate-800 font-bold text-lg flex items-center gap-1.5">
                {(() => {
                  const style = getEventStyle(selectedEvent);
                  if (style.code) {
                    return (
                      <img
                        src={`https://flagcdn.com/16x12/${style.code}.png`}
                        alt=""
                        className="w-4 h-3 object-cover rounded-sm inline-block"
                      />
                    );
                  }
                  if (style.flag) {
                    return <span className="text-xl">{style.flag}</span>;
                  }
                  if (selectedEvent.type === 'holiday' || selectedEvent.type === 'bank-holiday' || selectedEvent.type === 'festival') {
                    return <span>🌐</span>;
                  }
                  return null;
                })()}
                {selectedEvent.title}
              </h3>
            </div>
            
            <p className="text-slate-600 text-sm mb-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {selectedEvent.description || 'No description provided.'}
            </p>

            <div className="space-y-2.5 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span>Date: {selectedEvent.start} {selectedEvent.end !== selectedEvent.start && `to ${selectedEvent.end}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Target: {selectedEvent.targetLocation === 'all' ? 'All locations' : `${selectedEvent.targetLocation === 'country' ? 'Country' : 'Branch'}: ${selectedEvent.targetValue}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="capitalize">Type: {selectedEvent.type.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-5">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Import Holidays Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in duration-200">
            <h3 className="text-slate-800 font-semibold mb-2">Import Public Holidays</h3>
            <p className="text-xs text-slate-400 mb-4">
              Fetch and import official public holidays from Google's calendar service.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await handleImportHolidays(importCountry);
                if (res && res.success) {
                  setShowImportModal(false);
                }
              }}
              className="space-y-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 text-xs font-semibold">Select Country</label>
                <select
                  value={['Sri Lanka', 'USA', 'UK', 'Canada', 'Australia'].includes(importCountry) ? importCountry : 'other'}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'other') {
                      setImportCountry('');
                    } else {
                      setImportCountry(val);
                    }
                  }}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-slate-650 focus:outline-none bg-slate-50 cursor-pointer"
                >
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="USA">USA (United States)</option>
                  <option value="UK">UK (United Kingdom)</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="other">Other (Type Custom)...</option>
                </select>

                {!['Sri Lanka', 'USA', 'UK', 'Canada', 'Australia'].includes(importCountry) && (
                  <input
                    type="text"
                    placeholder="Type custom country name..."
                    value={importCountry}
                    onChange={e => setImportCountry(e.target.value)}
                    required
                    className="w-full mt-2 border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={importing}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import Holidays'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 border border-border py-2 rounded-xl text-sm text-slate-505 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Day Events Modal */}
      {selectedDayEvents && (
        <div className="fixed inset-0 bg-black/45 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-slate-800 font-bold text-base">
                  Events on {monthNames[month]} {selectedDayEvents.day}, {year}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {selectedDayEvents.events.length} event{selectedDayEvents.events.length !== 1 ? 's' : ''} listed
                </span>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {selectedDayEvents.events.map((event) => {
                const style = getEventStyle(event);
                return (
                  <div
                    key={event._id || event.id}
                    onClick={(e) => {
                      setSelectedDayEvents(null);
                      openEditEvent(event, e);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:translate-x-0.5 ${style.color}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {style.code ? (
                        <img
                          src={`https://flagcdn.com/16x12/${style.code}.png`}
                          alt=""
                          className="w-3.5 h-2.5 object-cover rounded-sm inline-block"
                        />
                      ) : style.flag ? (
                        <span className="mr-1">{style.flag}</span>
                      ) : (
                        (event.type === 'holiday' || event.type === 'bank-holiday' || event.type === 'festival') && (
                          <span>🌐</span>
                        )
                      )}
                      <span className="font-bold">{event.title}</span>
                    </div>
                    {event.description && (
                      <p className="text-[11px] font-normal opacity-90 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                );
              })}
              {selectedDayEvents.events.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No events scheduled for this day.
                </div>
              )}
            </div>

            {canManageEvents && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    const day = selectedDayEvents.day;
                    setSelectedDayEvents(null);
                    openAddEvent(day);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
                >
                  <Plus className="w-4 h-4" />
                  Add New Event
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
