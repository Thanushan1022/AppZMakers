import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5001/api';

export function useHRController(hrId) {
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [hrProfile, setHrProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [employeesList, setEmployeesList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [clients, setClients] = useState([]);
  const [shiftNotices, setShiftNotices] = useState([]);

  const [todayAttendance, setTodayAttendance] = useState([]);
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [todayDate, setTodayDate] = useState('');
  const [todayLabel, setTodayLabel] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
  });
  const [employeeStatsMap, setEmployeeStatsMap] = useState({});
  const [reportsSummary, setReportsSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    avgAttendance: 0,
    totalHours: 0,
    leaveDaysUsed: 0,
  });
  const [leaveTypeData, setLeaveTypeData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState([]);
  const [selectedBalance, setSelectedBalance] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [empForm, setEmpForm] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    joinDate: '',
    address: '',
    country: 'Sri Lanka',
  });

  const [leaveTabFilter, setLeaveTabFilter] = useState('pending');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [hrNote, setHrNote] = useState('');
  const [leaveAction, setLeaveAction] = useState(null);

  const [reportType, setReportType] = useState('attendance');
  const [reportsFilterType, setReportsFilterType] = useState('monthly'); // 'monthly', 'weekly', 'custom'
  const [reportsSelectedYear, setReportsSelectedYear] = useState(() => String(new Date().getFullYear()));
  const [reportsSelectedMonthNum, setReportsSelectedMonthNum] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [reportsSelectedWeekDate, setReportsSelectedWeekDate] = useState(getLocalDateString());
  const [reportsCustomStartDate, setReportsCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [reportsCustomEndDate, setReportsCustomEndDate] = useState(getLocalDateString());

  const fetchData = async () => {
    try {
      const [dashRes, dbRes, leavesRes, noticesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/hr/dashboard?date=${selectedDate}`),
        fetch(`${BACKEND_URL}/admin/dashboard`),
        fetch(`${BACKEND_URL}/hr/leaves`),
        fetch(`${BACKEND_URL}/hr/shift-notices`),
      ]);

      if (leavesRes.ok) {
        setLeavesList(await leavesRes.json());
      }

      if (noticesRes.ok) {
        setShiftNotices(await noticesRes.json());
      }

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setEmployeesList(dashData.employees || []);
        setTodayAttendance(dashData.todayAttendance || []);
        setWeeklyAttendanceData(dashData.weeklyAttendanceData || []);
        setDeptData(dashData.deptData || []);
        setTodayDate(dashData.todayDate || '');
        setTodayLabel(dashData.todayLabel || '');
        setDashboardStats(dashData.stats || {});
      }

      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setClients(dbData.companies || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getReportsWeekRange = (dateString) => {
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

  const getReportsCompanyMonthRange = (yearStr, monthNumStr) => {
    const yr = Number(yearStr);
    const mo = Number(monthNumStr);
    let prevYr = yr;
    let prevMo = mo - 1;
    if (prevMo === 0) {
      prevMo = 12;
      prevYr -= 1;
    }
    const startStr = `${prevYr}-${String(prevMo).padStart(2, '0')}-28`;
    const endStr = `${yr}-${String(mo).padStart(2, '0')}-27`;
    return { startStr, endStr };
  };

  const fetchReports = async () => {
    try {
      let url = `${BACKEND_URL}/hr/reports`;
      const queryParams = [];
      if (reportsFilterType === 'monthly') {
        const { startStr, endStr } = getReportsCompanyMonthRange(reportsSelectedYear, reportsSelectedMonthNum);
        queryParams.push(`startDate=${startStr}`);
        queryParams.push(`endDate=${endStr}`);
      } else if (reportsFilterType === 'weekly') {
        const { mondayStr, sundayStr } = getReportsWeekRange(reportsSelectedWeekDate);
        queryParams.push(`startDate=${mondayStr}`);
        queryParams.push(`endDate=${sundayStr}`);
      } else if (reportsFilterType === 'custom') {
        queryParams.push(`startDate=${reportsCustomStartDate}`);
        queryParams.push(`endDate=${reportsCustomEndDate}`);
      }
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const reportsData = await res.json();
        setEmployeeStatsMap(reportsData.employeeStats || {});
        setReportsSummary(reportsData.summary || {});
        setLeaveTypeData(reportsData.leaveTypeData || []);
        setMonthlyTrend(reportsData.monthlyTrend || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployeeDetail = async (empId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/hr/employees/${empId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAttendance(data.attendance || []);
        setSelectedBalance(data.leaveBalance);
        if (data.stats) {
          setEmployeeStatsMap((prev) => ({ ...prev, [empId]: data.stats }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHRProfile = async () => {
    let resolvedId = hrId;
    if (!resolvedId) {
      const savedAuth = localStorage.getItem('wf_auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        resolvedId = parsed.userId || parsed.email;
      }
    }
    if (!resolvedId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/hr/${resolvedId}/profile`);
      if (res.ok) {
        const data = await res.json();
        setHrProfile(data.hr);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateHRProfile = async (updateData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/hr/${hrId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (res.ok) {
        setHrProfile(data.hr);
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleAdjustAttendance = async (attendanceId, adjustmentData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/hr/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adjustmentData,
          adjustedBy: hrProfile?.name || 'HR Manager',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (selectedEmployeeId) {
          fetchEmployeeDetail(selectedEmployeeId);
        }
        fetchData();
        return { success: true, message: data.message };
      } else {
        const data = await res.json();
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleCreateManualAttendance = async (employeeId, attendanceData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/hr/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          ...attendanceData,
          adjustedBy: hrProfile?.name || 'HR Manager',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (selectedEmployeeId) {
          fetchEmployeeDetail(selectedEmployeeId);
        }
        fetchData();
        return { success: true, message: data.message };
      } else {
        const data = await res.json();
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchHRProfile();
  }, [hrId]);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    fetchReports();
  }, [
    reportsFilterType,
    reportsSelectedYear,
    reportsSelectedMonthNum,
    reportsSelectedWeekDate,
    reportsCustomStartDate,
    reportsCustomEndDate
  ]);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchEmployeeDetail(selectedEmployeeId);
    } else {
      setSelectedAttendance([]);
      setSelectedBalance(null);
    }
  }, [selectedEmployeeId]);

  const departments = ['All', ...new Set(employeesList.map((e) => e.department))];

  const filteredEmployees = employeesList.filter((e) => {
    const matchSearch =
      search === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const selectedEmployee = selectedEmployeeId
    ? employeesList.find((e) => e.id === selectedEmployeeId)
    : null;

  const getEmployeeStats = (empId) =>
    employeeStatsMap[empId] || { present: 0, total: 0, pct: 0, hours: 0, extraHours: 0, lessHours: 0, late: 0, absent: 0, mealBreakMinutes: 0, teaBreakMinutes: 0 };

  const handleConfirmLeaveAction = async () => {
    if (!selectedLeave) return;

    try {
      const res = await fetch(`${BACKEND_URL}/hr/leaves/${selectedLeave.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: leaveAction === 'approve' ? 'approved' : 'rejected',
          note: hrNote,
          rejectionReason: rejectReason,
        }),
      });

      if (res.ok) {
        setSelectedLeave(null);
        setRejectReason('');
        setHrNote('');
        setLeaveAction(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeaves = leavesList
    .filter((l) => leaveTabFilter === 'all' || l.status === leaveTabFilter)
    .filter(
      (l) =>
        leaveSearch === '' ||
        l.employeeName.toLowerCase().includes(leaveSearch.toLowerCase()) ||
        l.department.toLowerCase().includes(leaveSearch.toLowerCase())
    );

  const leaveCounts = {
    all: leavesList.length,
    pending: leavesList.filter((l) => l.status === 'pending').length,
    approved: leavesList.filter((l) => l.status === 'approved').length,
    rejected: leavesList.filter((l) => l.status === 'rejected').length,
  };

  const totalEmployees = dashboardStats.totalEmployees || employeesList.length;
  const activeEmployees = dashboardStats.activeEmployees || employeesList.filter((e) => e.status === 'active').length;
  const presentToday = dashboardStats.presentToday || 0;
  const onLeaveToday = dashboardStats.onLeaveToday || 0;

  const handleAssignClient = async (employeeId, clientId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/employees/${employeeId}/client`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Client assignment updated successfully.');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update client assignment.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating client assignment.');
    }
  };

  const handleUpdateEmployeeStatus = async (employeeId, status) => {
    try {
      const res = await fetch(`${BACKEND_URL}/hr/employees/${employeeId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Employee status updated successfully.');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update employee status.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating employee status.');
    }
  };

  const handleAddEmployee = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/hr/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: empForm.name,
          email: empForm.email,
          position: empForm.position,
          department: empForm.department,
          joinDate: empForm.joinDate || new Date().toISOString().split('T')[0],
          companyId: null,
          phone: null,
          address: empForm.address,
          country: empForm.country,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Employee created successfully.');
        setEmpForm({ name: '', email: '', position: '', department: '', joinDate: '', address: '', country: 'Sri Lanka' });
        setShowModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add employee');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while adding the employee.');
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    employeesList,
    leavesList,
    todayAttendance,
    weeklyAttendanceData,
    deptData,
    todayDate,
    todayLabel,
    dashboardStats,
    reportsSummary,
    leaveTypeData,
    monthlyTrend,

    search,
    setSearch,
    deptFilter,
    setDeptFilter,
    statusFilter,
    setStatusFilter,
    selectedEmployeeId,
    setSelectedEmployeeId,
    departments,
    filteredEmployees,
    selectedEmployee,
    selectedAttendance,
    selectedBalance,
    getEmployeeStats,

    leaveTabFilter,
    setLeaveTabFilter,
    leaveSearch,
    setLeaveSearch,
    selectedLeave,
    setSelectedLeave,
    rejectReason,
    setRejectReason,
    hrNote,
    setHrNote,
    leaveAction,
    setLeaveAction,
    handleConfirmLeaveAction,
    filteredLeaves,
    leaveCounts,

    reportType,
    setReportType,
    reportsFilterType,
    setReportsFilterType,
    reportsSelectedYear,
    setReportsSelectedYear,
    reportsSelectedMonthNum,
    setReportsSelectedMonthNum,
    reportsSelectedWeekDate,
    setReportsSelectedWeekDate,
    reportsCustomStartDate,
    setReportsCustomStartDate,
    reportsCustomEndDate,
    setReportsCustomEndDate,
    getReportsWeekRange,
    getReportsCompanyMonthRange,

    totalEmployees,
    activeEmployees,
    presentToday,
    onLeaveToday,

    clients,
    handleAssignClient,
    handleUpdateEmployeeStatus,

    showModal,
    setShowModal,
    empForm,
    setEmpForm,
    handleAddEmployee,

    hrProfile,
    handleUpdateHRProfile,
    handleAdjustAttendance,
    handleCreateManualAttendance,
    shiftNotices,
  };
}
