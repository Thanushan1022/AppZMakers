import express from 'express';
import * as employeeController from '../controllers/employeeController.js';
import * as hrController from '../controllers/hrController.js';
import * as companyController from '../controllers/companyController.js';
import * as adminController from '../controllers/adminController.js';
import * as calendarController from '../controllers/calendarController.js';

const router = express.Router();

// ==========================================
// EMPLOYEE ROUTES
// ==========================================
router.get('/employees/:id', employeeController.getProfile);
router.get('/employees/:id/attendance', employeeController.getAttendance);
router.post('/employees/:id/attendance', employeeController.logAttendance);
router.get('/employees/:id/leaves', employeeController.getLeaves);
router.post('/employees/:id/leaves', employeeController.createLeaveRequest);
router.put('/employees/:id/client', employeeController.updateClient);
router.put('/employees/:id/profile', employeeController.updateProfile);

// ==========================================
// HR / MANAGER ROUTES
// ==========================================
router.get('/hr/dashboard', hrController.getDashboard);
router.get('/hr/reports', hrController.getReports);
router.get('/hr/leaves', hrController.getLeaves);
router.post('/hr/leaves/:id/review', hrController.reviewLeave);
router.get('/hr/employees', hrController.getEmployees);
router.get('/hr/employees/:id', hrController.getEmployeeDetail);
router.post('/hr/employees', hrController.createEmployee);
router.get('/hr/:id/profile', hrController.getProfile);
router.put('/hr/:id/profile', hrController.updateProfile);
router.put('/hr/attendance/:id', hrController.adjustAttendance);
router.post('/hr/attendance', hrController.createManualAttendance);

// ==========================================
// HIRING COMPANY ROUTES
// ==========================================
router.get('/companies/:id/dashboard', companyController.getDashboard);
router.get('/companies/:id/profile', companyController.getProfile);
router.put('/companies/:id/profile', companyController.updateProfile);

// ==========================================
// SUPERADMIN ROUTES
// ==========================================
router.get('/admin/dashboard', adminController.getDashboard);
router.get('/admin/leaves', adminController.getLeaves);
router.post('/admin/leaves/:id/review', adminController.reviewLeave);
router.post('/admin/hr', adminController.createHR);
router.post('/admin/companies', adminController.createCompany);
router.put('/admin/employees/:id', adminController.updateEmployee);
router.put('/admin/hr/:id', adminController.updateHR);
router.put('/admin/companies/:id', adminController.updateCompany);
router.delete('/admin/employees/:id', adminController.deleteEmployee);
router.delete('/admin/hr/:id', adminController.deleteHR);
router.delete('/admin/companies/:id', adminController.deleteCompany);
router.get('/admin/settings', adminController.getSettings);
router.post('/admin/settings', adminController.updateSettings);

// ==========================================
// CALENDAR & GOOGLE CALENDAR ROUTES
// ==========================================
router.get('/calendar', calendarController.getEvents);
router.post('/calendar', calendarController.createEvent);
router.post('/calendar/import-holidays', calendarController.importHolidays);
router.put('/calendar/:id', calendarController.updateEvent);
router.delete('/calendar/:id', calendarController.deleteEvent);

export default router;
