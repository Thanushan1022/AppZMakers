// Authentication Controller
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import HRUser from '../models/HRUser.js';
import crypto from 'crypto';
import Company from '../models/Company.js';
import LeaveBalance from '../models/LeaveBalance.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { resolveProfileId, normalizeRole } from '../utils/resolveProfile.js';
import { getSettings } from '../services/settingsService.js';
import { getEmployeeLegacyId, getNextEmployeeLegacyId, getNextHRLegacyId, getNextCompanyLegacyId } from '../utils/entityLookup.js';

const VALID_ROLES = ['employee', 'hr', 'company', 'superadmin'];

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: normalizeRole(user.role) },
    process.env.SECRET_KEY || 'dev_secret_change_me',
    { expiresIn: '7d' }
  );

const buildAuthResponse = async (user) => {
  const role = normalizeRole(user.role);
  const profileId = await resolveProfileId(user);

  const payload = {
    email: user.email,
    name: user.name,
    role,
    token: signToken(user),
    avatar: user.avatar || '',
  };

  if (role === 'company' && profileId) {
    payload.userId = profileId;
  } else if (role !== 'superadmin' && profileId) {
    payload.userId = profileId;
  } else if (role === 'superadmin') {
    payload.userId = user._id.toString();
  }

  return payload;
};

const linkProfileOnRegister = async (user, role) => {
  const email = user.email.toLowerCase();
  const settings = await getSettings();

  if (role === 'employee') {
    let emp = await Employee.findOne({ email }).select('_id legacyId');
    if (!emp) {
      const legacyId = await getNextEmployeeLegacyId();
      emp = await Employee.create({
        legacyId,
        name: user.name,
        email,
        position: 'Staff',
        department: 'General',
        company: 'General',
        avatar: user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
        userId: user._id,
      });
      await LeaveBalance.create({
        employeeId: getEmployeeLegacyId(emp),
        annual: { total: settings.leaveAllocations?.annual || 15, used: 0 },
        casual: { total: settings.leaveAllocations?.casual || 10, used: 0 },
        medical: { total: settings.leaveAllocations?.medical || 10, used: 0 },
      });
    }
    user.profileId = getEmployeeLegacyId(emp);
    await user.save();
    return user.profileId;
  }

  if (role === 'hr') {
    let hr = await HRUser.findOne({ email }).select('_id legacyId');
    if (!hr) {
      const legacyId = await getNextHRLegacyId();
      hr = await HRUser.create({
        legacyId,
        name: user.name,
        email,
        userId: user._id,
      });
    }
    user.profileId = hr.legacyId || hr._id.toString();
    await user.save();
    return user.profileId;
  }

  if (role === 'company') {
    let co = await Company.findOne({ email }).select('_id legacyId');
    if (!co) {
      const legacyId = await getNextCompanyLegacyId();
      co = await Company.create({
        legacyId,
        name: `${user.name} Company`,
        email,
        contact: user.name,
        industry: 'General',
      });
    }
    user.profileId = co.legacyId || co._id.toString();
    await user.save();
    return user.profileId;
  }

  return null;
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [employee, hr, company, superadmin] }
 *               profileId: { type: string, description: "Optional emp001 / hr001 / co001" }
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Validation error
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, profileId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const normalizedRole = normalizeRole(role);
    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: normalizedRole,
      profileId: profileId || null,
    });

    await linkProfileOnRegister(user, normalizedRole);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toSafeJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, description: "Optional — must match account role if provided" }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req, res) => {
  try {
    const { email, password, role: selectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accountRole = normalizeRole(user.role);

    if (selectedRole && normalizeRole(selectedRole) !== accountRole) {
      return res.status(403).json({
        error: `This account is registered as ${accountRole}. Please select the correct role.`,
      });
    }

    if (accountRole === 'employee') {
      const emp = await Employee.findOne({ email: user.email.toLowerCase() }).select('status');
      if (emp && emp.status === 'inactive') {
        return res.status(403).json({
          error: 'Your account has been deactivated. Please contact HR.',
        });
      }
    }

    res.json(await buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // To prevent account enumeration attacks, always say reset link sent
    if (!user) {
      return res.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate secure random token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save();

    // Send email via EmailJS REST API
    const frontendUrl = process.env.FRONTEND_URL || 'https://app-z-makers.vercel.app';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const emailjsData = {
      service_id: process.env.EMAILJS_SERVICE_ID || 'service_6vky48h',
      template_id: process.env.EMAILJS_FORGOT_TEMPLATE_ID || 'template_phjzjeh',
      user_id: process.env.EMAILJS_PUBLIC_KEY || 'D_XrZ-PgCv74QQSkm',
      accessToken: process.env.EMAILJS_PRIVATE_KEY || 'Edi5W8xjfc_J4Q4CDgHJ0',
      template_params: {
        to_name: user.name,
        to_email: user.email.toLowerCase(),
        user_email: user.email.toLowerCase(),
        email: user.email.toLowerCase(),
        reset_link: resetLink,
        link: resetLink,
        resetLink: resetLink,
        reset_url: resetLink,
        url: resetLink,
        message: `Please use the following link to reset your password: ${resetLink}`,
      },
    };

    try {
      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailjsData),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('EmailJS failed to send forgot password email:', errorText);
      }
    } catch (emailErr) {
      console.error('Error occurred while sending forgot password email via EmailJS:', emailErr.message);
    }

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    res.json({ valid: true, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
