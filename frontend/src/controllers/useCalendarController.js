import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5001/api';

export function useCalendarController(role, employeeId, companyId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = async () => {
    if (role === 'employee' && !employeeId) {
      return;
    }
    if (role === 'company' && !companyId) {
      return;
    }
    try {
      setLoading(true);
      let url = `${BACKEND_URL}/calendar`;
      if (role === 'employee' && employeeId) {
        url += `?employeeId=${employeeId}`;
      } else if (role === 'company' && companyId) {
        url += `?companyId=${companyId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        fetchEvents();
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/calendar/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        fetchEvents();
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/calendar/${eventId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchEvents();
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleImportHolidays = async (country) => {
    try {
      setImporting(true);
      const res = await fetch(`${BACKEND_URL}/calendar/import-holidays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchEvents();
        alert(data.message || `Successfully imported holidays for ${country}`);
        return { success: true };
      } else {
        alert(data.error || 'Failed to import holidays');
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during import.');
      return { success: false, error: err.message };
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadEvents = async () => {
      if (role === 'employee' && !employeeId) {
        return;
      }
      if (role === 'company' && !companyId) {
        return;
      }
      try {
        setLoading(true);
        let url = `${BACKEND_URL}/calendar`;
        if (role === 'employee' && employeeId) {
          url += `?employeeId=${employeeId}`;
        } else if (role === 'company' && companyId) {
          url += `?companyId=${companyId}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setEvents(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEvents();
    return () => {
      active = false;
    };
  }, [role, employeeId, companyId]);

  return {
    events,
    loading,
    importing,
    currentDate,
    setCurrentDate,
    fetchEvents,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleImportHolidays,
  };
}
