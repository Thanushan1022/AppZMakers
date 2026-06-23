export const getTodayString = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatDisplayDate = (date = new Date()) =>
  date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export const getTodayAttendanceForEmployees = (employees, attendanceRecords, date = getTodayString(), allLeaves = []) =>
  employees.map((emp) => {
    const rec = attendanceRecords.find((r) => r.employeeId === emp.id && r.date === date);
    let teaBreakCount = 0;
    let teaBreakMinutes = 0;
    if (rec && rec.breaks) {
      rec.breaks.forEach((b) => {
        if (b.type === 'tea') {
          teaBreakCount++;
          if (b.start) {
            const partsStart = b.start.split(':').map(Number);
            const endVal = b.end || b.start;
            const partsEnd = endVal.split(':').map(Number);
            const inSecs = (partsStart[0] || 0) * 3600 + (partsStart[1] || 0) * 60 + (partsStart[2] || 0);
            let outSecs = (partsEnd[0] || 0) * 3600 + (partsEnd[1] || 0) * 60 + (partsEnd[2] || 0);
            if (outSecs < inSecs) outSecs += 86400;
            teaBreakMinutes += Math.round((outSecs - inSecs) / 60);
          }
        }
      });
    }

    let fallbackStatus = 'absent';
    const activeLeave = allLeaves.find(
      (l) =>
        l.employeeId === emp.id &&
        l.status === 'approved' &&
        l.startDate <= date &&
        l.endDate >= date
    );
    if (activeLeave) {
      fallbackStatus = `on leave (${activeLeave.type})`;
    }

    return {
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date,
      status: rec?.status || fallbackStatus,
      checkIn: rec?.checkIn || null,
      checkOut: rec?.checkOut || null,
      totalHours: rec?.totalHours || 0,
      breakMinutes: rec?.breakMinutes || 0,
      extraHours: rec?.extraHours || 0,
      lessHours: rec?.lessHours || 0,
      breaks: rec?.breaks || [],
      teaBreakCount,
      teaBreakMinutes,
      onBreak: rec?.onBreak || false,
      onTeaBreak: rec?.onTeaBreak || false,
      tasks: rec?.tasks || [],
    };
  });

export const computeEmployeeStats = (employeeId, attendanceRecords) => {
  const records = attendanceRecords.filter((r) => r.employeeId === employeeId);
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const total = records.length;
  const hours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
  const extraHours = records.reduce((sum, r) => sum + (r.extraHours || 0), 0);
  const lessHours = records.reduce((sum, r) => sum + (r.lessHours || 0), 0);
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  const mealBreakMinutes = records.reduce((sum, r) => sum + (r.breakMinutes || 0), 0);
  
  let teaBreakMinutes = 0;
  records.forEach((r) => {
    if (r.breaks) {
      r.breaks.forEach((b) => {
        if (b.type === 'tea' && b.start && b.end) {
          const partsStart = b.start.split(':').map(Number);
          const partsEnd = b.end.split(':').map(Number);
          const inSecs = (partsStart[0] || 0) * 3600 + (partsStart[1] || 0) * 60 + (partsStart[2] || 0);
          let outSecs = (partsEnd[0] || 0) * 3600 + (partsEnd[1] || 0) * 60 + (partsEnd[2] || 0);
          if (outSecs < inSecs) outSecs += 86400;
          teaBreakMinutes += Math.round((outSecs - inSecs) / 60);
        }
      });
    }
  });

  return { 
    present, 
    late, 
    absent, 
    total, 
    hours, 
    extraHours, 
    lessHours, 
    pct,
    mealBreakMinutes,
    teaBreakMinutes
  };
};

export const getWeeklyAttendanceData = (attendanceRecords, employeeIds, referenceDate = new Date(), allLeaves = []) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const result = [];

  const ref = new Date(referenceDate);
  const day = ref.getDay();
  const diffToMon = ref.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(ref.getFullYear(), ref.getMonth(), diffToMon);

  for (let i = 0; i < 5; i += 1) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    const dateStr = getTodayString(currentDay);

    const dayRecords = attendanceRecords.filter(
      (r) => r.date === dateStr && employeeIds.includes(r.employeeId)
    );

    const presentCount = dayRecords.filter((r) => r.status === 'present').length;
    const lateCount = dayRecords.filter((r) => r.status === 'late').length;
    const onLeaveCount = employeeIds.filter(empId => isEmployeeOnLeave(empId, allLeaves, dateStr)).length;
    const absentCount = Math.max(0, employeeIds.length - presentCount - lateCount - onLeaveCount);

    result.push({
      day: days[i],
      date: dateStr,
      present: presentCount,
      late: lateCount,
      onLeave: onLeaveCount,
      absent: absentCount,
    });
  }

  return result;
};

export const getDeptAttendanceData = (employees, todayAttendance) => {
  const depts = [...new Set(employees.map((e) => e.department))];
  return depts.map((name) => {
    const deptEmps = employees.filter((e) => e.department === name);
    const deptPresent = deptEmps.filter((e) => {
      const rec = todayAttendance.find((a) => a.employeeId === e.id);
      return rec && (rec.status === 'present' || rec.status === 'late');
    }).length;
    return { name, total: deptEmps.length, present: deptPresent };
  });
};

export const computeLeaveTypeData = (leaves) => {
  const types = ['annual', 'casual', 'medical'];
  const colors = { annual: '#4338ca', casual: '#0ea5e9', medical: '#ef4444' };
  return types.map((type) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: leaves.filter((l) => l.type === type && l.status === 'approved').reduce((s, l) => s + l.days, 0),
    color: colors[type],
  }));
};

export const computeMonthlyTrend = (attendanceRecords, employeeIds) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const now = new Date();

  return months.map((month, idx) => {
    const monthNum = String(idx + 1).padStart(2, '0');
    const prefix = `${now.getFullYear()}-${monthNum}`;
    const monthRecords = attendanceRecords.filter(
      (r) => r.date.startsWith(prefix) && employeeIds.includes(r.employeeId)
    );
    const present = monthRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
    const total = monthRecords.length;
    const attendance = total > 0 ? Math.round((present / total) * 100) : 0;

    return { month, attendance, leaves: 0 };
  });
};

export const isEmployeeOnLeave = (employeeId, leaves, date = getTodayString()) =>
  leaves.some(
    (l) =>
      l.employeeId === employeeId &&
      l.status === 'approved' &&
      l.startDate <= date &&
      l.endDate >= date
  );
