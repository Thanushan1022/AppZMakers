import { useRef, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Download, BarChart3, Users, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatHrMin = (valDec) => {
  if (valDec === null || valDec === undefined || valDec === '' || isNaN(valDec)) return '—';
  const val = Number(valDec);
  if (val <= 0) return '—';
  const totalMinutes = Math.round(val * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}min`;
  } else if (hrs > 0) {
    return `${hrs}h`;
  } else {
    return `${mins}min`;
  }
};

const formatMin = (minsVal) => {
  if (minsVal === null || minsVal === undefined || minsVal === '' || isNaN(minsVal)) return '—';
  const val = Number(minsVal);
  if (val <= 0) return '—';
  const hrs = Math.floor(val / 60);
  const mins = val % 60;
  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}min`;
  } else if (hrs > 0) {
    return `${hrs}h`;
  } else {
    return `${mins}min`;
  }
};

const FormatMultilineName = ({ name }) => {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  return (
    <div className="flex flex-col">
      {parts.map((p, i) => (
        <span key={i} className="leading-tight capitalize">{p}</span>
      ))}
    </div>
  );
};

export function HRReportsView({
  reportType,
  setReportType,
  employeesList,
  leavesList,
  getEmployeeStats,
  weeklyAttendanceData,
  leaveTypeData,
  monthlyTrend,
  reportsSummary,
  reportsAttendanceData,
  todayAttendance,
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
  role,
}) {
  const totalHours = todayAttendance?.reduce((s, r) => s + (r.totalHours || 0), 0) || 0;

  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('all');

  const filteredEmployeesList = useMemo(() => {
    if (selectedEmployeeFilter === 'all') return employeesList || [];
    return (employeesList || []).filter(e => String(e.id) === String(selectedEmployeeFilter));
  }, [employeesList, selectedEmployeeFilter]);

  const filteredLeavesList = useMemo(() => {
    if (selectedEmployeeFilter === 'all') return leavesList || [];
    return (leavesList || []).filter(l => String(l.employeeId) === String(selectedEmployeeFilter));
  }, [leavesList, selectedEmployeeFilter]);

  const filteredEmployeeAttendanceData = useMemo(() => {
    if (selectedEmployeeFilter === 'all' || !reportsAttendanceData) return [];
    return [...reportsAttendanceData].filter(a => String(a.employeeId) === String(selectedEmployeeFilter)).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [reportsAttendanceData, selectedEmployeeFilter]);

  const dynamicSummary = useMemo(() => {
    if (selectedEmployeeFilter === 'all') {
      return reportsSummary || {};
    }
    const emp = filteredEmployeesList[0];
    if (!emp) return {};
    const stats = getEmployeeStats ? getEmployeeStats(emp.id) : null;
    return {
      totalEmployees: 1,
      activeEmployees: emp.status === 'active' ? 1 : 0,
      avgAttendance: stats ? stats.pct : 0,
      totalHours: stats ? stats.hours : 0,
      leaveDaysUsed: filteredLeavesList.filter((l) => l.status === 'approved').reduce((s, l) => s + l.days, 0)
    };
  }, [reportsSummary, selectedEmployeeFilter, filteredEmployeesList, filteredLeavesList, getEmployeeStats]);

  const containerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    if (e.target.closest('button, input, select, a')) return;
    isDown.current = true;
    containerRef.current.classList.add('cursor-grabbing');
    containerRef.current.classList.remove('cursor-grab');
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.classList.remove('cursor-grabbing');
      containerRef.current.classList.add('cursor-grab');
    }
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.classList.remove('cursor-grabbing');
      containerRef.current.classList.add('cursor-grab');
    }
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const leaveContainerRef = useRef(null);
  const isLeaveDown = useRef(false);
  const leaveStartX = useRef(0);
  const leaveScrollLeft = useRef(0);

  const handleLeaveMouseDown = (e) => {
    if (e.target.closest('button, input, select, a')) return;
    isLeaveDown.current = true;
    leaveContainerRef.current.classList.add('cursor-grabbing');
    leaveContainerRef.current.classList.remove('cursor-grab');
    leaveStartX.current = e.pageX - leaveContainerRef.current.offsetLeft;
    leaveScrollLeft.current = leaveContainerRef.current.scrollLeft;
  };

  const handleLeaveMouseLeave = () => {
    isLeaveDown.current = false;
    if (leaveContainerRef.current) {
      leaveContainerRef.current.classList.remove('cursor-grabbing');
      leaveContainerRef.current.classList.add('cursor-grab');
    }
  };

  const handleLeaveMouseUp = () => {
    isLeaveDown.current = false;
    if (leaveContainerRef.current) {
      leaveContainerRef.current.classList.remove('cursor-grabbing');
      leaveContainerRef.current.classList.add('cursor-grab');
    }
  };

  const handleLeaveMouseMove = (e) => {
    if (!isLeaveDown.current) return;
    e.preventDefault();
    const x = e.pageX - leaveContainerRef.current.offsetLeft;
    const walk = (x - leaveStartX.current) * 1.5;
    leaveContainerRef.current.scrollLeft = leaveScrollLeft.current - walk;
  };

  const availableYears = [];
  for (let y = 2030; y >= 2024; y--) {
    availableYears.push(y);
  }

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const handlePrevWeek = () => {
    if (!reportsSelectedWeekDate) return;
    const [y, m, d] = reportsSelectedWeekDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 7);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    setReportsSelectedWeekDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextWeek = () => {
    if (!reportsSelectedWeekDate) return;
    const [y, m, d] = reportsSelectedWeekDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 7);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    setReportsSelectedWeekDate(`${newY}-${newM}-${newD}`);
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = [67, 56, 202]; // indigo-600
      const lightBgColor = [248, 250, 252]; // slate-50

      // Title & Header details
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('AppzMaker Portal', 14, 20);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Workforce Analytics & Reporting', 14, 25);

      const todayStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.setFontSize(9);
      doc.text(`Generated: ${todayStr}`, 196, 20, { align: 'right' });
      doc.text(`Role: ${role === 'superadmin' ? 'Administrator' : 'HR Manager'}`, 196, 25, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 28, 196, 28);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      let reportTitle = (reportType || 'Attendance').charAt(0).toUpperCase() + (reportType || 'Attendance').slice(1) + ' Report';
      doc.text(reportTitle, 14, 38);

      let periodText = 'Period: All Time';
      if (reportsFilterType === 'monthly') {
        const { startStr, endStr } = getReportsCompanyMonthRange(reportsSelectedYear, reportsSelectedMonthNum);
        periodText = `Period: Monthly (${startStr} to ${endStr})`;
      } else if (reportsFilterType === 'weekly') {
        const { mondayStr, sundayStr } = getReportsWeekRange(reportsSelectedWeekDate);
        periodText = `Period: Weekly (${mondayStr} to ${sundayStr})`;
      } else if (reportsFilterType === 'custom') {
        periodText = `Period: Custom Range (${reportsCustomStartDate} to ${reportsCustomEndDate})`;
      }
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(periodText, 14, 44);

      let currentY = 48;

      if (selectedEmployeeFilter !== 'all' && filteredEmployeesList.length > 0) {
        const emp = filteredEmployeesList[0];
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`Employee: ${emp.name}`, 14, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(`Department: ${emp.department || '—'}`, 14, currentY + 5);
        currentY += 12;
      }

      // Summary Cards block
      doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
      doc.rect(14, currentY, 182, 22, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, currentY, 182, 22, 'S');

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('TOTAL EMPLOYEES', 20, currentY + 6);
      doc.text('AVG ATTENDANCE', 65, currentY + 6);
      doc.text('TOTAL HOURS', 110, currentY + 6);
      doc.text('LEAVE DAYS USED', 155, currentY + 6);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      const sumVal1 = String(dynamicSummary?.totalEmployees ?? filteredEmployeesList.length ?? 0);
      const sumVal2 = `${dynamicSummary?.avgAttendance ?? 0}%`;
      const sumVal3 = `${(dynamicSummary?.totalHours ?? totalHours ?? 0).toFixed(0)}h`;
      const sumVal4 = String(dynamicSummary?.leaveDaysUsed ?? filteredLeavesList.filter((l) => l.status === 'approved').reduce((s, l) => s + l.days, 0) ?? 0);

      doc.text(sumVal1, 20, currentY + 14);
      doc.text(sumVal2, 65, currentY + 14);
      doc.text(sumVal3, 110, currentY + 14);
      doc.text(sumVal4, 155, currentY + 14);

      currentY += 30;

      let tableHeaders = [];
      let tableRows = [];

      if (reportType === 'attendance') {
        if (selectedEmployeeFilter !== 'all') {
          tableHeaders = [['Date', 'Check In', 'Check Out', 'Break', 'Total Hours', 'Extra Hours', 'Less Hours', 'Status']];
          tableRows = filteredEmployeeAttendanceData.map((a) => [
            a.date,
            a.checkIn || '—',
            a.checkOut || '—',
            formatMin(a.breakMinutes || 0),
            formatHrMin(a.totalHours || 0),
            a.extraHours > 0 ? `+${formatHrMin(a.extraHours)}` : '—',
            a.lessHours > 0 ? `${formatHrMin(a.lessHours)}` : '—',
            a.status
          ]);
        } else {
          tableHeaders = [['Employee', 'Department', 'Present', 'Meal Break', 'Tea Break', 'Total Hours', 'Extra Hours', 'Less Hours', 'Att. Rate']];
          tableRows = filteredEmployeesList.map((emp) => {
            const stats = getEmployeeStats ? getEmployeeStats(emp.id) : { present: 0, total: 0, pct: 0, hours: 0, extraHours: 0, lessHours: 0, late: 0, mealBreakMinutes: 0, teaBreakMinutes: 0 };
            return [
              emp.name,
              emp.department || '—',
              String(stats.present),
              formatMin(stats.mealBreakMinutes),
              formatMin(stats.teaBreakMinutes),
              formatHrMin(stats.hours),
              stats.extraHours > 0 ? `+${formatHrMin(stats.extraHours)}` : '—',
              stats.lessHours > 0 ? `${formatHrMin(stats.lessHours)}` : '—',
              `${stats.pct || 0}%`
            ];
          });
        }
      } else if (reportType === 'leave') {
        tableHeaders = [['Employee', 'Dept', 'Type', 'From', 'To', 'Days', 'Status', 'Applied']];
        tableRows = filteredLeavesList.map((l) => [
          l.employeeName,
          l.department || '—',
          l.type,
          l.startDate,
          l.endDate,
          String(l.days),
          l.status,
          l.appliedOn
        ]);
      } else {
        tableHeaders = [['Employee', 'Company', 'Department', 'Position', 'Join Date', 'Status']];
        tableRows = filteredEmployeesList.map((emp) => [
          emp.name,
          emp.company || '—',
          emp.department || '—',
          emp.position || '—',
          emp.joinDate,
          emp.status
        ]);
      }

      autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        startY: currentY,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      let suffix = 'Report';
      if (reportsFilterType === 'monthly') {
        suffix = `${reportsSelectedYear}_${reportsSelectedMonthNum}`;
      } else if (reportsFilterType === 'weekly') {
        suffix = `Week_${reportsSelectedWeekDate}`;
      } else if (reportsFilterType === 'custom') {
        suffix = `${reportsCustomStartDate}_to_${reportsCustomEndDate}`;
      }

      let empNameSuffix = '';
      if (selectedEmployeeFilter !== 'all' && filteredEmployeesList.length > 0) {
        empNameSuffix = `_${filteredEmployeesList[0].name.replace(/\s+/g, '_')}`;
      }

      const filename = `AppzMaker_${reportType}_Report_${suffix}${empNameSuffix}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Error generating PDF report. Please try again.');
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Generate and export workforce analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-sm shadow-rose-600/10"
          >
            <Download className="w-4 h-4" />PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {[
              { id: 'attendance', label: 'Attendance', icon: BarChart3 },
              { id: 'leave', label: 'Leave', icon: Calendar },
              { id: 'summary', label: 'Summary', icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setReportType(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${reportType === id ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {[
                { id: 'monthly', label: 'Monthly' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'custom', label: 'Custom Range' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setReportsFilterType(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${reportsFilterType === id ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {reportsFilterType === 'monthly' && (
              <div className="flex flex-wrap items-center gap-3.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Year</label>
                  <select
                    value={reportsSelectedYear}
                    onChange={e => setReportsSelectedYear(e.target.value)}
                    className="text-xs border border-border rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                  >
                    {availableYears.map(y => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Month</label>
                  <select
                    value={reportsSelectedMonthNum}
                    onChange={e => setReportsSelectedMonthNum(e.target.value)}
                    className="text-xs border border-border rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                  >
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const { startStr, endStr } = getReportsCompanyMonthRange(reportsSelectedYear, reportsSelectedMonthNum);
                  const format = (s) => {
                    const [y, m, d] = s.split('-');
                    const date = new Date(y, m - 1, d);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  };
                  return (
                    <div className="text-xs text-slate-500 font-semibold bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/30">
                      🗓️ Period: <strong className="text-indigo-700">{format(startStr)} - {format(endStr)}</strong>
                    </div>
                  );
                })()}
              </div>
            )}

            {reportsFilterType === 'weekly' && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">Select Day</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevWeek}
                      className="px-2 py-1 border border-border rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center cursor-pointer shadow-sm text-xs"
                    >
                      ←
                    </button>
                    <input
                      type="date"
                      value={reportsSelectedWeekDate}
                      onChange={e => setReportsSelectedWeekDate(e.target.value)}
                      className="text-xs border border-border rounded-xl px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={handleNextWeek}
                      className="px-2 py-1 border border-border rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center cursor-pointer shadow-sm text-xs"
                    >
                      →
                    </button>
                  </div>
                </div>
                {(() => {
                  const { mondayStr, sundayStr } = getReportsWeekRange(reportsSelectedWeekDate);
                  const format = (s) => {
                    const [y, m, d] = s.split('-');
                    const date = new Date(y, m - 1, d);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  };
                  return (
                    <div className="text-xs text-slate-500 font-semibold bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/30">
                      🗓️ Period: <strong className="text-indigo-700">{format(mondayStr)} - {format(sundayStr)}</strong>
                    </div>
                  );
                })()}
              </div>
            )}

            {reportsFilterType === 'custom' && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">From</label>
                  <input
                    type="date"
                    value={reportsCustomStartDate}
                    onChange={e => setReportsCustomStartDate(e.target.value)}
                    className="text-xs border border-border rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                  />
                </div>
                <span className="text-slate-300">-</span>
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-500 font-semibold">To</label>
                  <input
                    type="date"
                    value={reportsCustomEndDate}
                    onChange={e => setReportsCustomEndDate(e.target.value)}
                    className="text-xs border border-border rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Individual Employee Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto md:pl-3 md:border-l border-slate-200 min-w-0 pt-2 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0">
              <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">Employee</label>
              <select
                value={selectedEmployeeFilter}
                onChange={e => setSelectedEmployeeFilter(e.target.value)}
                className="text-xs border border-border rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer flex-1 md:flex-none min-w-0 md:max-w-[300px] truncate"
              >
                <option value="all">All Employees</option>
                {(employeesList || []).map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {(emp.name || '').split(' ')[0]} - {emp.department || 'No Dept'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: dynamicSummary.totalEmployees || filteredEmployeesList.length, sub: `${dynamicSummary.activeEmployees || filteredEmployeesList.filter((e) => e.status === 'active').length} active` },
          { label: 'Avg Attendance', value: `${dynamicSummary.avgAttendance || 0}%`, sub: 'This period' },
          { label: 'Total Hours', value: `${(dynamicSummary.totalHours || totalHours).toFixed(0)}h`, sub: selectedEmployeeFilter === 'all' ? 'All employees' : 'Selected employee' },
          { label: 'Leave Days Used', value: dynamicSummary.leaveDaysUsed || filteredLeavesList.filter((l) => l.status === 'approved').reduce((s, l) => s + l.days, 0), sub: 'Approved leaves' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
            <div className="text-slate-800 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.5rem' }}>{s.value}</div>
            <div className="text-slate-700 text-sm font-medium">{s.label}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {reportType === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Weekly Attendance Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyAttendanceData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="present" name="Present" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Monthly Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#4338ca" strokeWidth={2} dot={{ fill: '#4338ca', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Employee Attendance Report</h3>
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="overflow-auto max-h-[600px] border border-slate-100 rounded-xl relative cursor-grab select-none"
            >
              <table className="w-full text-sm border-collapse">
                <thead className="z-10">
                  <tr className="border-b border-border bg-white">
                    {selectedEmployeeFilter !== 'all' ? (
                      ['Date', 'Check In', 'Check Out', 'Break', 'Total Hours', 'Extra Hours', 'Less Hours', 'Status'].map((h, i) => (
                        <th key={h} className={`sticky top-0 text-left text-slate-400 font-medium py-3 px-4 whitespace-nowrap bg-white z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] ${i === 0 ? 'min-w-[200px]' : ''}`}>{h}</th>
                      ))
                    ) : (
                      ['Employee', 'Department', 'Present', 'Meal Break', 'Tea Break', 'Total Hours', 'Extra Hours', 'Less Hours', 'Att. Rate'].map((h, i) => (
                        <th key={h} className={`sticky top-0 text-left text-slate-400 font-medium py-3 px-4 whitespace-nowrap bg-white z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] ${i === 0 ? 'min-w-[200px]' : ''}`}>{h}</th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedEmployeeFilter !== 'all' ? (
                    filteredEmployeeAttendanceData.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-slate-500">No attendance records found for this period.</td>
                      </tr>
                    ) : (
                      filteredEmployeeAttendanceData.map((a) => (
                        <tr key={a._id || a.id} className="group hover:bg-slate-50/50">
                          <td className="py-3 px-4 bg-white group-hover:bg-slate-50/50 text-slate-700 font-medium whitespace-nowrap min-w-[200px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{a.date}</td>
                          <td className="py-3 px-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{a.checkIn || '—'}</td>
                          <td className="py-3 px-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{a.checkOut || '—'}</td>
                          <td className="py-3 px-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatMin(a.breakMinutes || 0)}</td>
                          <td className="py-3 px-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatHrMin(a.totalHours || 0)}</td>
                          <td className="py-3 px-4 text-emerald-600 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{a.extraHours > 0 ? `+${formatHrMin(a.extraHours)}` : '—'}</td>
                          <td className="py-3 px-4 text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{a.lessHours > 0 ? `${formatHrMin(a.lessHours)}` : '—'}</td>
                          <td className="py-3 px-4 capitalize">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${a.status === 'present' ? 'bg-emerald-50 text-emerald-700' :
                                a.status === 'absent' ? 'bg-red-50 text-red-700' :
                                  a.status === 'late' ? 'bg-amber-50 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                              }`}>{a.status}</span>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    filteredEmployeesList.map((emp) => {
                      const stats = getEmployeeStats(emp.id);
                      return (
                        <tr key={emp.id} className="group hover:bg-slate-50/50">
                          <td className="py-3 px-4 bg-white group-hover:bg-slate-50/50 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0 overflow-hidden">
                                {emp.avatar && emp.avatar.startsWith('data:image/') ? (
                                  <img src={emp.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  emp.avatar
                                )}
                              </div>
                              <FormatMultilineName name={emp.name} />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{emp.department}</td>
                          <td className="py-3 px-4 text-emerald-600 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.present}</td>
                          <td className="py-3 px-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatMin(stats.mealBreakMinutes)}</td>
                          <td className="py-3 px-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatMin(stats.teaBreakMinutes)}</td>
                          <td className="py-3 px-4 text-slate-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatHrMin(stats.hours)}</td>
                          <td className="py-3 px-4 text-emerald-600 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.extraHours > 0 ? `+${formatHrMin(stats.extraHours)}` : '—'}</td>
                          <td className="py-3 px-4 text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.lessHours > 0 ? `${formatHrMin(stats.lessHours)}` : '—'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-16">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.pct}%` }} />
                              </div>
                              <span className="text-slate-600 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Leave by Type</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={leaveTypeData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {leaveTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {leaveTypeData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Leave Requests Overview</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Requests', value: leavesList.length, color: 'text-slate-700' },
                { label: 'Approved', value: leavesList.filter((l) => l.status === 'approved').length, color: 'text-emerald-600' },
                { label: 'Rejected', value: leavesList.filter((l) => l.status === 'rejected').length, color: 'text-red-500' },
                { label: 'Pending', value: leavesList.filter((l) => l.status === 'pending').length, color: 'text-amber-600' },
                { label: 'Total Days Off', value: leavesList.filter((l) => l.status === 'approved').reduce((s, l) => s + l.days, 0), color: 'text-indigo-600' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-slate-500 text-sm">{s.label}</span>
                  <span className={`font-semibold ${s.color}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
            <h3 className="text-slate-800 font-semibold mb-4">Leave Request Details</h3>
            <div
              ref={leaveContainerRef}
              onMouseDown={handleLeaveMouseDown}
              onMouseLeave={handleLeaveMouseLeave}
              onMouseUp={handleLeaveMouseUp}
              onMouseMove={handleLeaveMouseMove}
              className="overflow-auto max-h-[600px] border border-slate-100 rounded-xl relative cursor-grab select-none"
            >
              <table className="w-full text-sm border-collapse">
                <thead className="z-30">
                  <tr className="border-b border-border bg-white">
                    {['Employee', 'Dept', 'Type', 'From', 'To', 'Days', 'Status', 'Applied'].map((h, i) => (
                      <th key={h} className={`sticky top-0 text-left text-slate-400 font-medium py-3 px-4 whitespace-nowrap bg-white z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] ${i === 0 ? 'min-w-[200px]' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeavesList.map((l) => {
                    const sc = { approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-600', pending: 'bg-amber-50 text-amber-700' };
                    return (
                      <tr key={l.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-4 text-slate-700 font-medium whitespace-nowrap bg-white group-hover:bg-slate-50/50 min-w-[200px]">
                          <FormatMultilineName name={l.employeeName} />
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{l.department}</td>
                        <td className="py-2.5 px-4 capitalize text-slate-500 whitespace-nowrap">{l.type}</td>
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.startDate}</td>
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.endDate}</td>
                        <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.days}</td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc[l.status] || 'bg-slate-50'}`}>{l.status}</span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.appliedOn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'summary' && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-4">Employee Work Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Employee', 'Company', 'Department', 'Position', 'Join Date', 'Status'].map((h) => (
                    <th key={h} className="text-left text-slate-400 font-medium pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEmployeesList.map((emp) => (
                  <tr key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold overflow-hidden">
                          {emp.avatar && emp.avatar.startsWith('data:image/') ? (
                            <img src={emp.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            emp.avatar
                          )}
                        </div>
                        <div className="text-slate-700 font-medium whitespace-nowrap">
                          <FormatMultilineName name={emp.name} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{emp.company}</td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{emp.department}</td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{emp.position}</td>
                    <td className="py-3 pr-4 text-slate-400 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{emp.joinDate}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{emp.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
