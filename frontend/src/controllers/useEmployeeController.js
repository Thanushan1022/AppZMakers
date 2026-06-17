import { useState, useEffect } from 'react';

const BACKEND_URL = 'https://appzmakers-production.up.railway.app/api';

const parseBreakSeconds = (breakTimeSetting) => {
  let allowedBreakMin = 60;
  if (breakTimeSetting) {
    const match = breakTimeSetting.match(/(\d+)\s*(hour|minute|min)/i);
    if (match) {
      const val = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      allowedBreakMin = unit.startsWith('hour') ? val * 60 : val;
    }
  }
  return allowedBreakMin * 60;
};

export function useEmployeeController(userId, updateAuth) {
  const getLocalTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Real HTTP state stores
  const [employee, setEmployee] = useState(null);
  const [balance, setBalance] = useState({
    annual: { total: 0, used: 0 },
    casual: { total: 0, used: 0 },
    medical: { total: 0, used: 0 }
  });
  const [myAttendance, setMyAttendance] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [mySalary, setMySalary] = useState(null);
  const [settings, setSettings] = useState({
    workHours: '8 hours',
    breakTime: '1 hour'
  });

  // Loading state
  const [loading, setLoading] = useState(true);

  // Timers and checkin/checkout states
  const [checkedIn, setCheckedIn] = useState(false);
  const [hasAttendedToday, setHasAttendedToday] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [onTeaBreak, setOnTeaBreak] = useState(false);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [breakSecs, setBreakSecs] = useState(0);
  const [teaBreakSecs, setTeaBreakSecs] = useState(0);
  const [checkInTime, setCheckInTime] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [currentBreakStart, setCurrentBreakStart] = useState(null);
  const [teaBreakGapRemainingSecs, setTeaBreakGapRemainingSecs] = useState(0);
  const [todayTasks, setTodayTasks] = useState([]);
  const [shiftNotices, setShiftNotices] = useState([]);

  // Leave form states
  const [showForm, setShowForm] = useState(false);
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [leaveForm, setLeaveForm] = useState({
    type: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false
  });

  // Attendance history selection state
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));
  const [selectedMonthNum, setSelectedMonthNum] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const selectedMonth = `${selectedYear}-${selectedMonthNum}`;
  const [filterType, setFilterType] = useState('monthly'); // 'monthly', 'weekly', 'custom'
  const [selectedWeekDate, setSelectedWeekDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Load all user profile, leave, and attendance data from backend
  const fetchData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      // Fetch Employee Profile & Leave Balance
      const empRes = await fetch(`${BACKEND_URL}/employees/${userId}`);
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployee(empData.employee);
        setBalance(empData.leaveBalance);
        if (empData.settings) {
          setSettings(empData.settings);
        }
      }

      // Fetch Attendance Log
      const attRes = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`);
      if (attRes.ok) {
        const attData = await attRes.json();
        setMyAttendance(attData);

        // Detect if already clocked in or active session exists
        const todayStr = getLocalTodayStr();
        let todayRecord = attData.find(a => a.checkIn && !a.checkOut);
        if (!todayRecord) {
          todayRecord = attData.find(a => a.date === todayStr);
        }
        if (todayRecord) {
          setHasAttendedToday(true);
          setCheckInTime(todayRecord.checkIn);
          setCheckedIn(!!todayRecord.checkIn && !todayRecord.checkOut);
          setTodayTasks(todayRecord.tasks || []);
          if (todayRecord.checkIn && !todayRecord.checkOut) {
            const recBreaks = todayRecord.breaks || [];
            const recOnBreak = !!todayRecord.onBreak;
            const recOnTeaBreak = !!todayRecord.onTeaBreak;
            setBreaks(recBreaks);
            setOnBreak(recOnBreak);
            setOnTeaBreak(recOnTeaBreak);

            const now = new Date();
            const getSecsFromTime = (tStr) => {
              if (!tStr) return 0;
              const parts = tStr.split(':').map(Number);
              const h = parts[0] || 0;
              const m = parts[1] || 0;
              const s = parts[2] || 0;
              return h * 3600 + m * 60 + s;
            };
            const checkInSecs = getSecsFromTime(todayRecord.checkIn);
            const nowSecsRaw = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            const nowSecs = nowSecsRaw < checkInSecs ? (nowSecsRaw + 86400) : nowSecsRaw;

            const getAdjustedSecs = (tStr) => {
              const secs = getSecsFromTime(tStr);
              if (secs < checkInSecs) {
                return secs + 86400;
              }
              return secs;
            };

            let accumulatedBreakSecs = 0;
            let accumulatedTeaSecs = 0;
            recBreaks.forEach(b => {
              if (b.type === 'tea') {
                if (b.start && b.end) {
                  accumulatedTeaSecs += (getAdjustedSecs(b.end) - getAdjustedSecs(b.start));
                } else if (b.start && !b.end) {
                  accumulatedTeaSecs += (nowSecs - getAdjustedSecs(b.start));
                }
              } else {
                if (b.start && b.end) {
                  accumulatedBreakSecs += (getAdjustedSecs(b.end) - getAdjustedSecs(b.start));
                } else if (b.start && !b.end) {
                  accumulatedBreakSecs += (nowSecs - getAdjustedSecs(b.start));
                }
              }
            });

            setBreakSecs(Math.max(0, accumulatedBreakSecs));
            setTeaBreakSecs(Math.max(0, accumulatedTeaSecs));

            // Net work secs = elapsed total secs since check-in minus ONLY extra break secs (allowed breaks are included in work hours)
            const totalElapsedSecs = nowSecs - checkInSecs;
            const netWorkSecs = totalElapsedSecs - accumulatedBreakSecs;
            setSessionSecs(Math.max(0, netWorkSecs));
          }
        }
      }

      // Fetch Leaves
      const leavesRes = await fetch(`${BACKEND_URL}/employees/${userId}/leaves`);
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setAllLeaves(leavesData);
      }

      // Fetch Shift Notices
      const noticesRes = await fetch(`${BACKEND_URL}/employees/${userId}/shift-notices`);
      if (noticesRes.ok) {
        const noticesData = await noticesRes.json();
        setShiftNotices(noticesData || []);
      }

    } catch (err) {
      console.error('Error fetching employee telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Sync timers dynamically relative to absolute check-in time and actual breaks
  useEffect(() => {
    if (!checkedIn || !checkInTime) {
      return;
    }

    const updateTimers = () => {
      const now = new Date();
      const getSecsFromTime = (tStr) => {
        if (!tStr) return 0;
        const parts = tStr.split(':').map(Number);
        const h = parts[0] || 0;
        const m = parts[1] || 0;
        const s = parts[2] || 0;
        return h * 3600 + m * 60 + s;
      };

      const checkInSecs = getSecsFromTime(checkInTime);
      const nowSecsRaw = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const nowSecs = nowSecsRaw < checkInSecs ? (nowSecsRaw + 86400) : nowSecsRaw;

      const getAdjustedSecs = (tStr) => {
        const secs = getSecsFromTime(tStr);
        if (secs < checkInSecs) {
          return secs + 86400;
        }
        return secs;
      };

      let accumulatedBreakSecs = 0;
      let accumulatedTeaSecs = 0;
      const recBreaks = breaks || [];

      recBreaks.forEach(b => {
        if (b.type === 'tea') {
          if (b.start && b.end) {
            accumulatedTeaSecs += (getAdjustedSecs(b.end) - getAdjustedSecs(b.start));
          } else if (b.start && !b.end) {
            accumulatedTeaSecs += (nowSecs - getAdjustedSecs(b.start));
          }
        } else {
          if (b.start && b.end) {
            accumulatedBreakSecs += (getAdjustedSecs(b.end) - getAdjustedSecs(b.start));
          } else if (b.start && !b.end) {
            accumulatedBreakSecs += (nowSecs - getAdjustedSecs(b.start));
          }
        }
      });

      setBreakSecs(Math.max(0, accumulatedBreakSecs));
      setTeaBreakSecs(Math.max(0, accumulatedTeaSecs));

      const totalElapsedSecs = nowSecs - checkInSecs;
      const netWorkSecs = totalElapsedSecs - accumulatedBreakSecs;
      setSessionSecs(Math.max(0, netWorkSecs));
    };

    // Initial update
    updateTimers();

    const interval = setInterval(updateTimers, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTimers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', updateTimers);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', updateTimers);
    };
  }, [checkedIn, checkInTime, breaks]);


  // Sync gap/cooldown remaining seconds
  useEffect(() => {
    let timer = null;
    const calculateGap = () => {
      const teaBreaksMax = settings.teaBreaksMax !== undefined ? settings.teaBreaksMax : 2;
      const teaBreakGap = settings.teaBreakGap !== undefined ? settings.teaBreakGap : 120; // in minutes
      const teaBreaksList = breaks.filter(b => b.type === 'tea');
      const completedTeaCount = teaBreaksList.filter(b => b.end).length;

      if (teaBreaksList.length > 0 && teaBreaksList.length < teaBreaksMax && !onTeaBreak) {
        // Find the last tea break start time
        const lastTea = teaBreaksList[teaBreaksList.length - 1];
        if (lastTea && lastTea.start) {
          const parts = lastTea.start.split(':').map(Number);
          const lastStartSecs = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);

          const now = new Date();
          const nowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

          const elapsedSecs = nowSecs - lastStartSecs;
          const requiredGapSecs = teaBreakGap * 60;
          const remaining = Math.max(0, requiredGapSecs - elapsedSecs);
          setTeaBreakGapRemainingSecs(remaining);
          return;
        }
      }
      setTeaBreakGapRemainingSecs(0);
    };

    if (checkedIn) {
      calculateGap();
      timer = setInterval(calculateGap, 1000);
    } else {
      setTeaBreakGapRemainingSecs(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [checkedIn, breaks, onTeaBreak, settings]);

  // Auto-end Tea Break when duration is reached
  useEffect(() => {
    const teaBreakDuration = settings.teaBreakDuration !== undefined ? settings.teaBreakDuration : 20; // in minutes
    const limitSecs = teaBreakDuration * 60;
    if (onTeaBreak && teaBreakSecs >= limitSecs) {
      handleTeaBreak();
    }
  }, [onTeaBreak, teaBreakSecs, settings]);

  // Helpers
  const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getTimeString = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const [showTaskWarning, setShowTaskWarning] = useState(false);

  const handleDeleteLeave = async (leaveId) => {
    try {
      if (!window.confirm('Are you sure you want to hide this leave entry from your dashboard?')) return;
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/leaves/${leaveId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to remove leave history');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Actions
  const handleCheckIn = async () => {
    const todayStr = getLocalTodayStr();
    const timeNow = getTimeString();

    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clock-in', time: timeNow, date: todayStr })
      });
      if (res.ok) {
        setCheckedIn(true);
        setCheckInTime(timeNow);
        setSessionSecs(0);
        setBreakSecs(0);
        setTeaBreakSecs(0);
        setBreaks([]);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = () => {
    if (todayTasks.length === 0) {
      setShowTaskWarning(true);
      return;
    }
    setShowCheckoutConfirm(true);
  };

  const confirmCheckOut = async () => {
    setShowCheckoutConfirm(false);
    const todayStr = getLocalTodayStr();
    const timeNow = getTimeString();

    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-out',
          time: timeNow,
          date: todayStr
        })
      });
      if (res.ok) {
        setCheckedIn(false);
        setOnBreak(false);
        setOnTeaBreak(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBreak = async () => {
    const todayStr = getLocalTodayStr();
    const timeNow = getTimeString();
    const newOnBreak = !onBreak;

    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newOnBreak ? 'start-break' : 'end-break',
          time: timeNow,
          date: todayStr
        })
      });
      if (res.ok) {
        setOnBreak(newOnBreak);
        if (newOnBreak) {
          setCurrentBreakStart(timeNow);
          setBreaks(prev => [...prev, { start: timeNow, end: null, type: 'meal' }]);
        } else {
          setBreaks(prev => prev.map((b, i) => i === prev.length - 1 ? { ...b, end: timeNow } : b));
          setCurrentBreakStart(null);
        }
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeaBreak = async () => {
    const todayStr = getLocalTodayStr();
    const timeNow = getTimeString();
    const newOnTeaBreak = !onTeaBreak;

    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newOnTeaBreak ? 'start-tea-break' : 'end-tea-break',
          time: timeNow,
          date: todayStr
        })
      });
      if (res.ok) {
        setOnTeaBreak(newOnTeaBreak);
        if (newOnTeaBreak) {
          setBreaks(prev => [...prev, { start: timeNow, end: null, type: 'tea' }]);
        } else {
          setBreaks(prev => prev.map((b, i) => i === prev.length - 1 ? { ...b, end: timeNow } : b));
        }
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to toggle Tea Break');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveSubmit = async (e) => {
    if (e) e.preventDefault();
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    let days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
    if (leaveForm.halfDay) {
      days = 0.5;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: leaveForm.type,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          days,
          reason: leaveForm.reason
        })
      });

      if (res.ok) {
        setLeaveForm({ type: 'casual', startDate: '', endDate: '', reason: '', halfDay: false });
        setShowForm(false);
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to submit leave application');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (description, timeContext) => {
    const todayStr = getLocalTodayStr();
    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-task',
          description,
          timeContext,
          date: todayStr
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.record && data.record.tasks) {
          setTodayTasks(data.record.tasks);
        }
        fetchData();
        return { success: true };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Failed to add task' };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Server error' };
    }
  };

  const handleEditTask = async (taskId, description, timeContext) => {
    const todayStr = getLocalTodayStr();
    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit-task',
          taskId,
          description,
          timeContext,
          date: todayStr
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.record && data.record.tasks) {
          setTodayTasks(data.record.tasks);
        }
        fetchData();
        return { success: true };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Failed to edit task' };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Server error' };
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/employees/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        const data = await res.json();
        setEmployee(data.employee);
        fetchData();
        if (profileData.avatar !== undefined || profileData.name) {
          if (updateAuth) {
            updateAuth({
              avatar: data.employee.avatar || '',
              name: data.employee.name,
            });
          }
        }
        return { success: true, message: data.message || 'Profile updated successfully' };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Failed to update profile' };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message || 'Server error updating profile' };
    }
  };

  // Calculations for profile
  const presentDays = myAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentDays = myAttendance.filter(a => a.status === 'absent').length;
  const totalWorkingDays = myAttendance.length;
  const attendancePct = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;
  const monthlyHours = myAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);

  const totalLeaveUsed = (balance.annual?.used || 0) + (balance.casual?.used || 0) + (balance.medical?.used || 0);
  const totalLeave = (balance.annual?.total || 0) + (balance.casual?.total || 0) + (balance.medical?.total || 0);

  // Parse allowed break limits
  let allowedBreakMin = 60;
  if (settings && settings.breakTime) {
    const match = settings.breakTime.match(/(\d+)\s*(hour|minute|min)/i);
    if (match) {
      const val = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      allowedBreakMin = unit.startsWith('hour') ? val * 60 : val;
    }
  }
  const allowedBreakSecs = allowedBreakMin * 60;
  const remainingBreakSecs = Math.max(0, allowedBreakSecs - breakSecs);
  const isBreakOver = breakSecs > allowedBreakSecs;

  // Parse standard target work hours
  let stdHours = 8;
  if (settings && settings.workHours) {
    const match = settings.workHours.match(/(\d+)/);
    if (match) stdHours = parseInt(match[1]);
  }
  const targetWorkSecs = stdHours * 3600;

  const totalExtraHours = myAttendance.reduce((sum, a) => sum + (a.extraHours || 0), 0);
  const totalLessHours = myAttendance.reduce((sum, a) => sum + (a.lessHours || 0), 0);

  const isDateInCompanyMonth = (dateStr, companyMonthStr) => {
    const [yr, mo] = companyMonthStr.split('-').map(Number);
    let prevYr = yr;
    let prevMo = mo - 1;
    if (prevMo === 0) {
      prevMo = 12;
      prevYr -= 1;
    }
    const startStr = `${prevYr}-${String(prevMo).padStart(2, '0')}-28`;
    const endStr = `${yr}-${String(mo).padStart(2, '0')}-27`;
    return dateStr >= startStr && dateStr <= endStr;
  };

  const getWeekRange = (dateString) => {
    const d = new Date(dateString);
    const day = d.getDay();
    const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diffToMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const format = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const dayVal = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${dayVal}`;
    };
    return { mondayStr: format(monday), sundayStr: format(sunday) };
  };

  const filteredLeaves = leaveFilter === 'all' ? allLeaves : allLeaves.filter(l => l.status === leaveFilter);

  let filteredAttendance = [];
  if (filterType === 'monthly') {
    filteredAttendance = myAttendance.filter(a => isDateInCompanyMonth(a.date, selectedMonth));
  } else if (filterType === 'weekly') {
    const { mondayStr, sundayStr } = getWeekRange(selectedWeekDate);
    filteredAttendance = myAttendance.filter(a => a.date >= mondayStr && a.date <= sundayStr);
  } else if (filterType === 'custom') {
    filteredAttendance = myAttendance.filter(a => a.date >= customStartDate && a.date <= customEndDate);
  }

  const joinDateSafe = employee ? employee.joinDate : '2023-01-01';
  const yearsTenure = Math.floor((new Date().getTime() - new Date(joinDateSafe).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) || 0;
  const monthsTenure = Math.floor(((new Date().getTime() - new Date(joinDateSafe).getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000)) || 0;

  // Use a fallback empty object for loading state
  const currentEmployee = employee || {
    name: 'Sarah Johnson',
    email: 'sarah.j@techventures.com',
    position: 'Senior Developer',
    department: 'Engineering',
    company: 'TechVentures Ltd',
    phone: '+1 (555) 234-5678',
    address: '142 Oak Street, Austin TX 78701',
    avatar: 'SJ',
    country: 'United States'
  };

  return {
    employee: currentEmployee,
    myAttendance,
    balance,
    mySalary,
    checkedIn,
    hasAttendedToday,
    onBreak,
    onTeaBreak,
    sessionSecs,
    breakSecs,
    teaBreakSecs,
    checkInTime,
    breaks,
    currentBreakStart,
    showForm,
    setShowForm,
    leaveFilter,
    setLeaveFilter,
    leaveForm,
    setLeaveForm,
    selectedMonth,
    selectedYear,
    setSelectedYear,
    selectedMonthNum,
    setSelectedMonthNum,
    loading,
    settings,
    allowedBreakSecs,
    remainingBreakSecs,
    isBreakOver,
    targetWorkSecs,
    totalExtraHours,
    totalLessHours,

    // Calculated statistics
    presentDays,
    absentDays,
    totalWorkingDays,
    attendancePct,
    monthlyHours,
    totalLeaveUsed,
    totalLeave,
    filteredLeaves,
    filteredAttendance,
    yearsTenure,
    monthsTenure,

    // Formatting & actions
    formatDuration,
    handleCheckIn,
    handleCheckOut,
    confirmCheckOut,
    showCheckoutConfirm,
    setShowCheckoutConfirm,
    handleBreak,
    handleTeaBreak,
    handleLeaveSubmit,
    handleDeleteLeave,
    handleUpdateProfile,
    handleAddTask,
    handleEditTask,
    todayTasks,
    showTaskWarning,
    setShowTaskWarning,

    // Tea break helpers
    teaBreakEnabled: settings.teaBreakEnabled !== false,
    teaBreakAllowed: currentEmployee.teaBreakAllowed !== false && currentEmployee.companyTeaBreakAllowed !== false,
    teaBreakLimitReached: (breaks.filter(b => b.type === 'tea' && b.end).length >= (settings.teaBreaksMax !== undefined ? settings.teaBreaksMax : 2)) && !onTeaBreak,
    teaBreakGapRemainingSecs,
    teaBreakDuration: settings.teaBreakDuration !== undefined ? settings.teaBreakDuration : 15,

    // Meal break helpers
    mealBreakCount: breaks.filter(b => b.type === 'meal').length,
    mealBreakMax: settings.mealBreaksMax !== undefined ? settings.mealBreaksMax : 5,
    mealBreakLimitReached: breaks.filter(b => b.type === 'meal').length >= (settings.mealBreaksMax !== undefined ? settings.mealBreaksMax : 5),

    // Filter properties
    filterType,
    setFilterType,
    selectedWeekDate,
    setSelectedWeekDate,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    getWeekRange,
    shiftNotices
  };
}
