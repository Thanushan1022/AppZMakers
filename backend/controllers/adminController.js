import Company from '../models/Company.js';
import HRUser from '../models/HRUser.js';
import Employee from '../models/Employee.js';
import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { 
  getTodayString, 
  getTodayAttendanceForEmployees, 
  getWeeklyAttendanceData, 
  getDeptAttendanceData, 
  isEmployeeOnLeave, 
  formatDisplayDate 
} from '../utils/helpers.js';
import { findEmployee, findHRUser, findCompany, findLeave } from '../utils/entityLookup.js';
import { toCompanyJSON, toHRJSON, toEmployeeJSON, toLeaveJSON, toAttendanceJSON } from '../utils/formatters.js';
import {
  getSettings as fetchSystemSettings,
  updateSettings as updateSettingsDoc,
} from '../services/settingsService.js';
import { syncCompanyEmployeeCounts } from '../services/companyService.js';
import { syncLeaveBalance } from '../services/leaveService.js';

export const getDashboard = async (req, res) => {
  try {
    await syncCompanyEmployeeCounts();
    let targetDateObj = new Date();
    if (req.query.date) {
      const [year, month, day] = req.query.date.split('-').map(Number);
      targetDateObj = new Date(year, month - 1, day);
    }
    const today = getTodayString(targetDateObj);
    const todayLabel = formatDisplayDate(targetDateObj);

    const companies = (await Company.find()).map(toCompanyJSON);
    const hrUsers = (await HRUser.find()).map(toHRJSON);
    const employees = (await Employee.find()).map(toEmployeeJSON);
    const pendingLeaves = (await LeaveRequest.find({ status: 'pending' })).map(toLeaveJSON);
    const activeEmployees = employees.filter((e) => e.status === 'active');
    
    const attendanceRecords = await Attendance.find();
    const attJson = attendanceRecords.map(toAttendanceJSON);
    const leaveRequests = await LeaveRequest.find();
    const leavesJson = leaveRequests.map(toLeaveJSON);

    const todayAttendance = getTodayAttendanceForEmployees(activeEmployees, attJson, today);
    const present = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    const absent = todayAttendance.filter((a) => a.status === 'absent').length;
    const late = todayAttendance.filter((a) => a.status === 'late').length;
    const onLeaveToday = activeEmployees.filter((e) =>
      isEmployeeOnLeave(e.id, leavesJson, today)
    ).length;

    res.json({
      todayDate: today,
      todayLabel: todayLabel,
      companies,
      hrUsers,
      employees,
      todayAttendance,
      weeklyAttendanceData: getWeeklyAttendanceData(
        attJson,
        activeEmployees.map((e) => e.id),
        targetDateObj
      ),
      deptData: getDeptAttendanceData(activeEmployees, todayAttendance),
      stats: {
        totalCompanies: companies.length,
        activeCompanies: companies.filter((c) => c.status === 'active').length,
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        totalHR: hrUsers.length,
        activeHR: hrUsers.filter((h) => h.status === 'active').length,
        pendingLeaveApprovals: pendingLeaves.length,
        todayAttendanceRecords: todayAttendance.length,
        presentToday: present,
        absentToday: absent,
        lateToday: late,
        onLeaveToday,
      },
      pendingLeaves,
      leaveCounts: {
        pending: pendingLeaves.length,
        approved: await LeaveRequest.countDocuments({ status: 'approved' }),
        rejected: await LeaveRequest.countDocuments({ status: 'rejected' }),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({ createdAt: -1 });
    res.json(leaves.map(toLeaveJSON));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reviewLeave = async (req, res) => {
  try {
    const { status, note, rejectionReason } = req.body;
    const leave = await findLeave(req.params.id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request has already been reviewed' });
    }

    leave.status = status;
    if (note) leave.hrNote = note;
    if (rejectionReason) leave.rejectionReason = rejectionReason;
    await leave.save();

    if (status === 'approved') {
      const emp = await Employee.findOne({ $or: [{ legacyId: leave.employeeId }, { _id: leave.employeeId }] });
      if (emp) {
        await syncLeaveBalance(leave.employeeId, emp.joinDate);
      }
    }

    res.json({ message: `Leave request ${status} successfully`, leave: toLeaveJSON(leave) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createHR = async (req, res) => {
  try {
    const { name, email, department, joinDate } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const count = await HRUser.countDocuments();
    const legacyId = `hr${String(count + 1).padStart(3, '0')}`;

    // 1. Generate 10-digit password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let plainPassword = '';
    for (let i = 0; i < 10; i++) {
      plainPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 2. Hash password and create User
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'hr',
      profileId: legacyId,
    });

    // 3. Create HRUser linked to User
    const newHr = await HRUser.create({
      legacyId,
      name,
      email: email.toLowerCase(),
      department: department || 'HR',
      status: 'active',
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      userId: newUser._id,
    });

    // 4. Send email via EmailJS REST API
    let emailStatus = 'sent';
    let emailError = null;

    try {
      const emailjsData = {
        service_id: process.env.EMAILJS_SERVICE_ID || 'service_6vky48h',
        template_id: process.env.EMAILJS_TEMPLATE_ID || 'template_agg5vl8',
        user_id: process.env.EMAILJS_PUBLIC_KEY || 'D_XrZ-PgCv74QQSkm',
        accessToken: process.env.EMAILJS_PRIVATE_KEY || 'Edi5W8xjfc_J4Q4CDgHJ0',
        template_params: {
          to_name: name,
          to_email: email.toLowerCase(),
          user_email: email.toLowerCase(),
          user_password: plainPassword,
          email: email.toLowerCase(),
          password: plainPassword,
          PASSWORD: plainPassword,
          Password: plainPassword,
          message: `Hello ${name},\n\nYour WorkForge HR Manager account has been created successfully.\n\nLogin Email: ${email.toLowerCase()}\nLogin Password: ${plainPassword}\n\nPlease log in and change your password.`,
        },
      };

      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailjsData),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('EmailJS failed to send email:', errorText);
        emailStatus = 'failed';
        emailError = errorText;
      }
    } catch (emailErr) {
      console.error('Error occurred while sending email via EmailJS:', emailErr.message);
      emailStatus = 'error';
      emailError = emailErr.message;
    }

    res.status(201).json({
      message: emailStatus === 'sent'
        ? 'HR Manager created successfully and credentials emailed.'
        : `HR Manager created successfully, but email failed: ${emailError}`,
      hrUser: toHRJSON(newHr),
      password: plainPassword,
      emailStatus,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { name, industry, contact, email, phone, joinedDate, joinDate, address, country } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const count = await Company.countDocuments();
    const legacyId = `co${String(count + 1).padStart(3, '0')}`;

    // 1. Generate 10-digit password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let plainPassword = '';
    for (let i = 0; i < 10; i++) {
      plainPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 2. Hash password and create User with role: 'company'
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'company',
      profileId: legacyId,
    });

    // 3. Create Company
    const newComp = await Company.create({
      legacyId,
      name,
      industry: industry || 'General',
      contact: contact || name,
      email: email.toLowerCase(),
      phone: phone || '',
      employeeCount: 0,
      status: 'active',
      joinedDate: joinedDate || joinDate || getTodayString(),
      address: address || '',
      country: country || 'Sri Lanka',
    });

    // 4. Send email via EmailJS REST API
    let emailStatus = 'sent';
    let emailError = null;

    try {
      const emailjsData = {
        service_id: process.env.EMAILJS_SERVICE_ID || 'service_6vky48h',
        template_id: process.env.EMAILJS_TEMPLATE_ID || 'template_agg5vl8',
        user_id: process.env.EMAILJS_PUBLIC_KEY || 'D_XrZ-PgCv74QQSkm',
        accessToken: process.env.EMAILJS_PRIVATE_KEY || 'Edi5W8xjfc_J4Q4CDgHJ0',
        template_params: {
          to_name: contact || name,
          to_email: email.toLowerCase(),
          user_email: email.toLowerCase(),
          user_password: plainPassword,
          email: email.toLowerCase(),
          password: plainPassword,
          PASSWORD: plainPassword,
          Password: plainPassword,
          message: `Hello ${contact || name},\n\nYour WorkForge Client Company account has been created successfully.\n\nLogin Email: ${email.toLowerCase()}\nLogin Password: ${plainPassword}\n\nPlease log in and change your password.`,
        },
      };

      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailjsData),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('EmailJS failed to send email:', errorText);
        emailStatus = 'failed';
        emailError = errorText;
      }
    } catch (emailErr) {
      console.error('Error occurred while sending email via EmailJS:', emailErr.message);
      emailStatus = 'error';
      emailError = emailErr.message;
    }

    res.status(201).json({
      message: emailStatus === 'sent'
        ? 'Client created successfully and credentials emailed.'
        : `Client created successfully, but email failed: ${emailError}`,
      company: toCompanyJSON(newComp),
      password: plainPassword,
      emailStatus,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const empId = emp.legacyId || emp._id.toString();

    // Delete linked login User credentials
    if (emp.userId) {
      await User.deleteOne({ _id: emp.userId });
    } else {
      await User.deleteOne({ email: emp.email.toLowerCase() });
    }

    await Employee.deleteOne({ _id: emp._id });
    await LeaveBalance.deleteOne({ employeeId: empId });
    await LeaveRequest.deleteMany({ employeeId: empId });
    await Attendance.deleteMany({ employeeId: empId });
    await syncCompanyEmployeeCounts();

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteHR = async (req, res) => {
  try {
    const hr = await findHRUser(req.params.id);
    if (!hr) return res.status(404).json({ error: 'HR user not found' });

    // Delete linked login User credentials
    if (hr.userId) {
      await User.deleteOne({ _id: hr.userId });
    } else {
      await User.deleteOne({ email: hr.email.toLowerCase() });
    }

    await HRUser.deleteOne({ _id: hr._id });
    res.json({ message: 'HR user deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const comp = await findCompany(req.params.id);
    if (!comp) return res.status(404).json({ error: 'Company not found' });

    const cid = comp.legacyId || comp._id.toString();
    await Employee.updateMany({ companyId: cid }, { companyId: null, company: 'Our Company' });
    await Company.deleteOne({ _id: comp._id });
    await syncCompanyEmployeeCounts();

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    res.json(await fetchSystemSettings());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const newSettings = req.body;
    const current = await fetchSystemSettings();
    const merged = { ...current };

    Object.keys(newSettings).forEach((key) => {
      if (key !== 'leaveAllocations') {
        merged[key] = newSettings[key];
      }
    });

    if (newSettings.leaveAllocations) {
      merged.leaveAllocations = {
        ...merged.leaveAllocations,
        ...newSettings.leaveAllocations,
      };

      const medicalTotal = Number(merged.leaveAllocations.medical);

      const balances = await LeaveBalance.find();
      for (const balance of balances) {
        balance.medical = balance.medical || { total: 0, used: 0 };
        balance.medical.total = medicalTotal;
        await balance.save();
      }
    }

    const settings = await updateSettingsDoc(merged);
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const emp = await findEmployee(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const { name, email, position, department, joinDate, address, country } = req.body;

    if (name !== undefined) {
      emp.name = name;
      if (emp.userId) {
        await User.updateOne({ _id: emp.userId }, { name });
      }
    }
    if (email !== undefined) {
      const emailLower = email.toLowerCase();
      const existingUser = await User.findOne({ email: emailLower, _id: { $ne: emp.userId } });
      if (existingUser) return res.status(400).json({ error: 'Email already in use' });

      emp.email = emailLower;
      if (emp.userId) {
        await User.updateOne({ _id: emp.userId }, { email: emailLower });
      }
    }
    if (position !== undefined) emp.position = position;
    if (department !== undefined) emp.department = department;
    if (joinDate !== undefined) emp.joinDate = joinDate;
    if (address !== undefined) emp.address = address;
    if (country !== undefined) emp.country = country;

    await emp.save();
    res.json({ message: 'Employee updated successfully', employee: toEmployeeJSON(emp) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHR = async (req, res) => {
  try {
    const hr = await findHRUser(req.params.id);
    if (!hr) return res.status(404).json({ error: 'HR User not found' });

    const { name, email, department, joinDate } = req.body;

    if (name !== undefined) {
      hr.name = name;
      if (hr.userId) {
        await User.updateOne({ _id: hr.userId }, { name });
      }
    }
    if (email !== undefined) {
      const emailLower = email.toLowerCase();
      const existingUser = await User.findOne({ email: emailLower, _id: { $ne: hr.userId } });
      if (existingUser) return res.status(400).json({ error: 'Email already in use' });

      hr.email = emailLower;
      if (hr.userId) {
        await User.updateOne({ _id: hr.userId }, { email: emailLower });
      }
    }
    if (department !== undefined) hr.department = department;
    if (joinDate !== undefined) hr.joinDate = joinDate;

    await hr.save();
    res.json({ message: 'HR User updated successfully', hrUser: toHRJSON(hr) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const comp = await findCompany(req.params.id);
    if (!comp) return res.status(404).json({ error: 'Company not found' });

    const { name, industry, contact, email, phone, joinedDate, joinDate, address, country } = req.body;

    if (name !== undefined) comp.name = name;
    if (industry !== undefined) comp.industry = industry;
    if (contact !== undefined) comp.contact = contact;
    if (phone !== undefined) comp.phone = phone;
    if (joinedDate !== undefined) comp.joinedDate = joinedDate;
    else if (joinDate !== undefined) comp.joinedDate = joinDate;
    if (address !== undefined) comp.address = address;
    if (country !== undefined) comp.country = country;

    if (email !== undefined) {
      const emailLower = email.toLowerCase();
      const linkedUser = await User.findOne({ email: comp.email.toLowerCase() });
      if (linkedUser) {
        const existingUser = await User.findOne({ email: emailLower, _id: { $ne: linkedUser._id } });
        if (existingUser) return res.status(400).json({ error: 'Email already in use' });

        linkedUser.name = name || linkedUser.name;
        linkedUser.email = emailLower;
        await linkedUser.save();
      }
      comp.email = emailLower;
    }

    await comp.save();
    res.json({ message: 'Company updated successfully', company: toCompanyJSON(comp) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
