import LeaveBalance from '../models/LeaveBalance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import ShiftNotice from '../models/ShiftNotice.js';
import Attendance from '../models/Attendance.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { findEmployee, getEmployeeLegacyId } from '../utils/entityLookup.js';
import { toEmployeeJSON, toAttendanceJSON, toLeaveJSON, toLeaveBalanceJSON } from '../utils/formatters.js';
import { getSettings } from '../services/settingsService.js';
import { syncCompanyEmployeeCounts } from '../services/companyService.js';
import { getSecsFromTime, getTimeStringFromSecs, autoEndOverdueTeaBreaks, finalizeClockOut } from '../utils/attendanceMath.js';
import { syncLeaveBalance } from '../services/leaveService.js';

export const getProfile = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const empId = getEmployeeLegacyId(emp);
    const balance = await syncLeaveBalance(empId, emp.joinDate);
    const settings = await getSettings();

    // Auto end any overdue tea break
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = await Attendance.findOne({ employeeId: empId, date: todayStr });
    if (todayRecord) {
      await autoEndOverdueTeaBreaks(todayRecord, settings);
    }

    res.json({
      employee: toEmployeeJSON(emp),
      leaveBalance: toLeaveBalanceJSON(balance),
      settings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const settings = await getSettings();
    const records = await Attendance.find({ employeeId: getEmployeeLegacyId(emp) }).sort({ date: -1 });
    await autoEndOverdueTeaBreaks(records, settings);
    res.json(records.map(toAttendanceJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logAttendance = async (req, res) => {
  try {
    const { action, time, date } = req.body;
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const empId = getEmployeeLegacyId(emp);
    const settings = await getSettings();

    let todayRecord;
    if (action === 'clock-in') {
      todayRecord = await Attendance.findOne({ employeeId: empId, date });
    } else {
      todayRecord = await Attendance.findOne({ employeeId: empId, checkOut: null });
      if (!todayRecord) {
        todayRecord = await Attendance.findOne({ employeeId: empId, date });
      }
    }

    if (todayRecord) {
      await autoEndOverdueTeaBreaks(todayRecord, settings);
    }

    if (action === 'clock-in') {
      if (todayRecord) return res.status(400).json({ error: 'Already clocked in today' });

      todayRecord = await Attendance.create({
        employeeId: empId,
        date,
        checkIn: time,
        checkOut: null,
        status: 'present',
        totalHours: 0,
        breakMinutes: 0,
        onBreak: false,
        breaks: [],
        extraHours: 0,
        lessHours: 0,
      });
    } else if (action === 'start-break') {
      if (!todayRecord) return res.status(400).json({ error: 'Not clocked in' });
      todayRecord.onBreak = true;
      if (!todayRecord.breaks) todayRecord.breaks = [];
      todayRecord.breaks.push({ start: time, end: null, type: 'meal' });
      await todayRecord.save();
    } else if (action === 'end-break') {
      if (!todayRecord) return res.status(400).json({ error: 'Not clocked in' });
      todayRecord.onBreak = false;
      if (!todayRecord.breaks) todayRecord.breaks = [];
      const activeBreak = todayRecord.breaks.find((b) => b.type !== 'tea' && !b.end);
      if (activeBreak) activeBreak.end = time;

      let totalBreakSecs = 0;
      todayRecord.breaks.forEach((b) => {
        if (b.type !== 'tea') {
          if (b.start && b.end) {
            const bIn = getSecsFromTime(b.start);
            let bOut = getSecsFromTime(b.end);
            if (bOut < bIn) bOut += 86400;
            totalBreakSecs += bOut - bIn;
          }
        }
      });
      todayRecord.breakMinutes = Math.round(totalBreakSecs / 60);
      await todayRecord.save();
    } else if (action === 'start-tea-break') {
      if (!todayRecord) return res.status(400).json({ error: 'Not clocked in' });
      if (settings.teaBreakEnabled === false) {
        return res.status(400).json({ error: 'Tea Break feature is currently disabled' });
      }
      if (todayRecord.onBreak || todayRecord.onTeaBreak) {
        return res.status(400).json({ error: 'Already on a break' });
      }
      const teaCount = todayRecord.breaks?.filter(b => b.type === 'tea').length || 0;
      const maxAllowed = settings.teaBreaksMax !== undefined ? settings.teaBreaksMax : 2;
      if (teaCount >= maxAllowed) {
        return res.status(400).json({ error: 'Tea Break limit reached' });
      }

      // Check gap between tea breaks
      if (teaCount > 0) {
        const lastTeaBreak = [...todayRecord.breaks]
          .reverse()
          .find(b => b.type === 'tea' && b.end);
        if (lastTeaBreak) {
          const gapMin = settings.teaBreakGap !== undefined ? settings.teaBreakGap : 120;
          const lastEndSecs = getSecsFromTime(lastTeaBreak.end);
          let currentStartSecs = getSecsFromTime(time);
          if (currentStartSecs < lastEndSecs) {
            currentStartSecs += 86400;
          }
          const elapsedSecs = currentStartSecs - lastEndSecs;
          if (elapsedSecs < gapMin * 60) {
            const remainingMins = Math.ceil((gapMin * 60 - elapsedSecs) / 60);
            return res.status(400).json({ error: `Please wait ${remainingMins} min before the next Tea Break.` });
          }
        }
      }

      todayRecord.onTeaBreak = true;
      if (!todayRecord.breaks) todayRecord.breaks = [];
      todayRecord.breaks.push({ start: time, end: null, type: 'tea' });
      await todayRecord.save();
    } else if (action === 'end-tea-break') {
      if (!todayRecord) return res.status(400).json({ error: 'Not clocked in' });
      todayRecord.onTeaBreak = false;
      if (!todayRecord.breaks) todayRecord.breaks = [];
      const activeTeaBreak = todayRecord.breaks.find((b) => b.type === 'tea' && !b.end);
      if (activeTeaBreak) activeTeaBreak.end = time;
      await todayRecord.save();
    } else if (action === 'clock-out') {
      if (!todayRecord) return res.status(400).json({ error: 'Not clocked in' });

      if (todayRecord.onBreak) {
        todayRecord.onBreak = false;
        const activeBreak = todayRecord.breaks?.find((b) => b.type !== 'tea' && !b.end);
        if (activeBreak) activeBreak.end = time;
      }
      if (todayRecord.onTeaBreak) {
        todayRecord.onTeaBreak = false;
        const activeTeaBreak = todayRecord.breaks?.find((b) => b.type === 'tea' && !b.end);
        if (activeTeaBreak) activeTeaBreak.end = time;
      }

      finalizeClockOut(todayRecord, time, settings);
      await todayRecord.save();
    } else if (action === 'add-task') {
      if (!todayRecord || todayRecord.checkOut) {
        return res.status(400).json({ error: 'You can only log tasks during active working hours.' });
      }
      const { description, timeContext } = req.body;
      if (!description) {
        return res.status(400).json({ error: 'Task description is required.' });
      }
      const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 50) {
        return res.status(400).json({ error: 'Task description cannot exceed 50 words.' });
      }
      if (!todayRecord.tasks) todayRecord.tasks = [];
      todayRecord.tasks.push({ description, timeContext });
      await todayRecord.save();
    }

    res.json({ message: `Successfully executed ${action}`, record: toAttendanceJSON(todayRecord) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaves = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const leaves = await LeaveRequest.find({ employeeId: getEmployeeLegacyId(emp) }).sort({ createdAt: -1 });
    res.json(leaves.map(toLeaveJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const { type, startDate, endDate, days, reason } = req.body;
    const empId = getEmployeeLegacyId(emp);

    const numericDays = Number(days);
    const balance = await syncLeaveBalance(empId, emp.joinDate);
    const remaining = balance[type] ? (balance[type].total - balance[type].used) : 0;
    if (numericDays > remaining) {
      return res.status(400).json({ error: `Insufficient leave balance. Remaining: ${remaining} days.` });
    }

    const newLeave = await LeaveRequest.create({
      employeeId: empId,
      employeeName: emp.name,
      department: emp.department,
      type,
      startDate,
      endDate,
      days: numericDays,
      reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave: toLeaveJSON(newLeave),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const { clientId } = req.body;
    if (!clientId || clientId === 'unassigned' || clientId === 'Unassigned' || clientId === 'Our Company') {
      emp.companyId = null;
      emp.company = 'Our Company';
    } else {
      let query;
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(clientId);
      if (isValidObjectId) {
        query = { $or: [{ legacyId: clientId }, { _id: clientId }] };
      } else {
        query = { legacyId: clientId };
      }
      const comp = await Company.findOne(query);
      if (!comp) return res.status(404).json({ error: 'Client not found' });
      emp.companyId = comp.legacyId || comp._id.toString();
      emp.company = comp.name;
    }
    await emp.save();
    await syncCompanyEmployeeCounts();

    res.json({ message: 'Employee client updated successfully', employee: toEmployeeJSON(emp) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const { phone, address, password, cvName, cvData } = req.body;

    if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (phone !== undefined) emp.phone = phone;
    if (address !== undefined) emp.address = address;
    if (cvName !== undefined) emp.cvName = cvName;
    if (cvData !== undefined) emp.cvData = cvData;

    await emp.save();

    if (password) {
      if (emp.userId) {
        const user = await User.findById(emp.userId);
        if (user) {
          user.password = await bcrypt.hash(password, 10);
          await user.save();
        }
      } else {
        const user = await User.findOne({ email: emp.email.toLowerCase() });
        if (user) {
          user.password = await bcrypt.hash(password, 10);
          await user.save();
        }
      }
    }

    res.json({
      message: 'Profile updated successfully',
      employee: toEmployeeJSON(emp),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmployeeShiftNotices = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await findEmployee(id);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const eid = emp.legacyId || emp._id.toString();

    // Query notices targeting this employee specifically, or targeting all employees under this client/company
    const query = {
      $or: [
        { employeeId: eid },
        { employeeId: 'all', companyId: emp.companyId }
      ]
    };

    const notices = await ShiftNotice.find(query).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
