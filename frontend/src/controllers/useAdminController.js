import { useState, useEffect } from 'react';

const BACKEND_URL = 'https://appzmakers-production.up.railway.app/api';

export function useAdminController() {
  const [employees, setEmployees] = useState([]);
  const [hrUsers, setHRUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [pendingLeaves, setPendingLeaves] = useState([]);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState([]);

  const [activeTab, setActiveTab] = useState('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState([]);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [adminName, setAdminName] = useState('Administrator');

  const [empForm, setEmpForm] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    company: 'General',
    joinDate: '',
    address: '',
    country: 'Sri Lanka',
  });

  const [hrForm, setHrForm] = useState({
    name: '',
    email: '',
    department: 'HR',
    joinDate: '',
  });

  const [coForm, setCoForm] = useState({
    name: '',
    industry: '',
    contact: '',
    email: '',
    phone: '',
    joinedDate: '',
    address: '',
    country: 'Sri Lanka',
  });

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [hrNote, setHrNote] = useState('');
  const [leaveAction, setLeaveAction] = useState(null);

  const [settings, setSettings] = useState({
    workHours: '8 hours',
    breakTime: '45 minutes',
    lateThreshold: '15 minutes',
    overtimeRate: '1.5x',
    sessionTimeout: '30 minutes',
    backupSchedule: 'Daily at 2 AM',
    leaveAllocations: { annual: 15, casual: 10, personal: 10 },
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
        setHRUsers(data.hrUsers || []);
        setCompanies(data.companies || []);
        setDashboardStats(data.stats || {});
        setPendingLeaves((data.pendingLeaves || []).filter((l) => l.status === 'pending'));
      }

      const leavesRes = await fetch(`${BACKEND_URL}/admin/leaves`);
      if (leavesRes.ok) {
        setLeavesList(await leavesRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/settings`);
      if (res.ok) setSettings(await res.json());
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
        setTodayAttendance(reportsData.todayAttendance || []);
        setWeeklyAttendanceData(reportsData.weeklyAttendanceData || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

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
    const savedAuth = localStorage.getItem('wf_auth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      if (parsed.name) {
        setAdminName(parsed.name);
      }
    }
  }, []);

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

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchEmployeeDetail(selectedEmployeeId);
    } else {
      setSelectedAttendance([]);
      setSelectedBalance(null);
    }
  }, [selectedEmployeeId]);

  const handleAdjustAttendance = async (attendanceId, adjustmentData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/hr/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adjustmentData,
          adjustedBy: adminName || 'Administrator',
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
          adjustedBy: adminName || 'Administrator',
          isAdmin: true,
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

  const getEmployeeStats = (empId) =>
    employeeStatsMap[empId] || { present: 0, total: 0, pct: 0, hours: 0, extraHours: 0, lessHours: 0, late: 0, absent: 0, mealBreakMinutes: 0, teaBreakMinutes: 0 };

  const filteredEmployees = employees.filter(
    (e) =>
      searchQuery === '' ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHR = hrUsers.filter(
    (h) =>
      searchQuery === '' ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(
    (c) => searchQuery === '' || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteEmployee = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this employee? This will permanently delete their account, attendance records, and leave request logs.");
    if (!confirmed) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/employees/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHR = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this HR manager?");
    if (!confirmed) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/hr/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCompany = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this client? Associated employees will be unassigned.");
    if (!confirmed) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/companies/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEdit = !!editingItem;
      const url = isEdit ? `${BACKEND_URL}/admin/employees/${editingItem.id}` : `${BACKEND_URL}/hr/employees`;
      const method = isEdit ? 'PUT' : 'POST';
      const bodyPayload = {
        name: empForm.name,
        email: empForm.email,
        position: empForm.position,
        department: empForm.department,
        joinDate: empForm.joinDate || new Date().toISOString().split('T')[0],
        address: empForm.address,
        country: empForm.country,
      };
      if (!isEdit) {
        bodyPayload.companyId = null;
        bodyPayload.phone = null;
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || (isEdit ? 'Employee updated successfully.' : 'Employee created successfully.'));
        setEmpForm({ name: '', email: '', position: '', department: '', company: 'General', joinDate: '', address: '', country: 'Sri Lanka' });
        setEditingItem(null);
        setShowModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save employee');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving the employee.');
    }
  };

  const handleAddHR = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEdit = !!editingItem;
      const url = isEdit ? `${BACKEND_URL}/admin/hr/${editingItem.id}` : `${BACKEND_URL}/admin/hr`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: hrForm.name,
          email: hrForm.email,
          department: hrForm.department || 'HR',
          joinDate: hrForm.joinDate || new Date().toISOString().split('T')[0],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || (isEdit ? 'HR Manager updated successfully.' : 'HR Manager created successfully.'));
        setHrForm({ name: '', email: '', department: 'HR' });
        setEditingItem(null);
        setShowModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save HR Manager');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving the HR Manager.');
    }
  };

  const handleAddCompany = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEdit = !!editingItem;
      const url = isEdit ? `${BACKEND_URL}/admin/companies/${editingItem.id}` : `${BACKEND_URL}/admin/companies`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: coForm.name,
          industry: coForm.industry,
          contact: coForm.contact,
          email: coForm.email,
          phone: coForm.phone,
          joinedDate: coForm.joinedDate || new Date().toISOString().split('T')[0],
          address: coForm.address,
          country: coForm.country,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || (isEdit ? 'Client updated successfully.' : 'Client created successfully.'));
        setCoForm({ name: '', industry: '', contact: '', email: '', phone: '' });
        setEditingItem(null);
        setShowModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save Client');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving the Client.');
    }
  };

  const handleEditClick = (item, type) => {
    setEditingItem({ id: item.id, type });
    if (type === 'employee') {
      setEmpForm({
        name: item.name || '',
        email: item.email || '',
        position: item.position || '',
        department: item.department || '',
        company: item.company || 'General',
        joinDate: item.joinDate ? item.joinDate.split('T')[0] : '',
        address: item.address || '',
        country: item.country || 'Sri Lanka',
      });
    } else if (type === 'hr') {
      setHrForm({
        name: item.name || '',
        email: item.email || '',
        department: item.department || 'HR',
        joinDate: item.joinDate ? item.joinDate.split('T')[0] : '',
      });
    } else if (type === 'company') {
      setCoForm({
        name: item.name || '',
        industry: item.industry || '',
        contact: item.contact || '',
        email: item.email || '',
        phone: item.phone || '',
        joinedDate: item.joinedDate ? item.joinedDate.split('T')[0] : '',
        address: item.address || '',
        country: item.country || 'Sri Lanka',
      });
    }
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setEmpForm({ name: '', email: '', position: '', department: '', company: 'General', joinDate: '', address: '', country: 'Sri Lanka' });
    setHrForm({ name: '', email: '', department: 'HR', joinDate: '' });
    setCoForm({ name: '', industry: '', contact: '', email: '', phone: '', joinedDate: '', address: '', country: 'Sri Lanka' });
    setShowModal(true);
  };

  const handleConfirmLeaveAction = async () => {
    if (!selectedLeave) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/leaves/${selectedLeave.id}/review`, {
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

  const handleUpdateSetting = async (key, value) => {
    try {
      let updatedPayload = {};
      if (key.startsWith('leaveAllocations.')) {
        const subKey = key.split('.')[1];
        updatedPayload = { leaveAllocations: { [subKey]: value } };
      } else {
        updatedPayload = { [key]: value };
      }

      const res = await fetch(`${BACKEND_URL}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const leaveCounts = {
    pending: leavesList.filter((l) => l.status === 'pending').length,
    approved: leavesList.filter((l) => l.status === 'approved').length,
    rejected: leavesList.filter((l) => l.status === 'rejected').length,
  };

  return {
    employees,
    hrUsers,
    companies,
    leavesList,
    dashboardStats,
    pendingLeaves,
    leaveCounts,

    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showModal,
    setShowModal,
    empForm,
    setEmpForm,
    settings,

    selectedLeave,
    setSelectedLeave,
    rejectReason,
    setRejectReason,
    hrNote,
    setHrNote,
    leaveAction,
    setLeaveAction,
    handleConfirmLeaveAction,

    filteredEmployees,
    filteredHR,
    filteredCompanies,

    handleDeleteEmployee,
    handleDeleteHR,
    handleDeleteCompany,
    handleAddEmployee,
    handleAddHR,
    handleAddCompany,
    handleUpdateSetting,
    handleAssignClient,
    
    hrForm,
    setHrForm,
    coForm,
    setCoForm,

    editingItem,
    handleEditClick,
    handleAddClick,

    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedAttendance,
    selectedBalance,
    handleAdjustAttendance,
    handleCreateManualAttendance,

    employeesList: employees,
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
    reportsSummary,
    leaveTypeData,
    monthlyTrend,
    todayAttendance,
    weeklyAttendanceData,
    getEmployeeStats,
  };
}
