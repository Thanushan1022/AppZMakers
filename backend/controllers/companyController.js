import Company from '../models/Company.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import {
  getTodayString,
  getTodayAttendanceForEmployees,
  getWeeklyAttendanceData,
  isEmployeeOnLeave,
} from '../utils/helpers.js';
import { findCompany } from '../utils/entityLookup.js';
import { toCompanyJSON, toEmployeeJSON, toAttendanceJSON } from '../utils/formatters.js';
import { syncCompanyEmployeeCounts } from '../services/companyService.js';

export const getDashboard = async (req, res) => {
  try {
    const comp = await findCompany(req.params.id);
    if (!comp) return res.status(404).json({ error: 'Company not found' });

    await syncCompanyEmployeeCounts();

    const cid = comp.legacyId || comp._id.toString();
    const compEmployees = await Employee.find({ companyId: cid });
    const employeesJson = compEmployees.map(toEmployeeJSON);
    const employeeIds = employeesJson.map((e) => e.id);
    const today = getTodayString();

    const attendanceRecords = await Attendance.find({ employeeId: { $in: employeeIds } });
    const attJson = attendanceRecords.map(toAttendanceJSON);
    const todayRecs = getTodayAttendanceForEmployees(employeesJson, attJson, today);

    const presentCount = todayRecs.filter((r) => r.status === 'present' || r.status === 'late').length;
    const absentCount = todayRecs.filter((r) => r.status === 'absent').length;
    const leaves = await LeaveRequest.find({ employeeId: { $in: employeeIds }, status: 'pending' });
    const pendingLeaves = leaves.length;
    const totalHours = attJson.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const allLeaves = await LeaveRequest.find();
    const onLeaveCount = employeesJson.filter((e) =>
      isEmployeeOnLeave(e.id, allLeaves.map((l) => l.toObject()), today)
    ).length;

    res.json({
      company: { ...toCompanyJSON(comp), employeeCount: employeesJson.length },
      employees: employeesJson,
      todayRecs,
      attendanceHistory: attJson,
      weeklyData: getWeeklyAttendanceData(attJson, employeeIds),
      stats: {
        presentCount,
        absentCount,
        pendingLeaves,
        totalHours,
        onLeaveCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const comp = await findCompany(req.params.id);
    if (!comp) return res.status(404).json({ error: 'Company not found' });
    res.json({
      company: toCompanyJSON(comp),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const comp = await findCompany(req.params.id);
    if (!comp) return res.status(404).json({ error: 'Company not found' });

    const { name, industry, contact, email, phone, password } = req.body;

    if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (name !== undefined) comp.name = name;
    if (industry !== undefined) comp.industry = industry;
    if (contact !== undefined) comp.contact = contact;
    if (email !== undefined) comp.email = email;
    if (phone !== undefined) comp.phone = phone;

    await comp.save();

    const legacyId = comp.legacyId || comp._id.toString();
    const user = await User.findOne({
      $or: [{ profileId: legacyId }, { email: comp.email.toLowerCase() }],
    });
    if (user) {
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email.toLowerCase();
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }
      await user.save();
    }

    res.json({
      message: 'Profile updated successfully',
      company: toCompanyJSON(comp),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
