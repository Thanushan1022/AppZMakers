import mongoose from 'mongoose';

const shiftNoticeSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, index: true },
    companyName: { type: String, required: true },
    employeeId: { type: String, default: 'all', index: true }, // 'all' or specific employee ID
    employeeName: { type: String, default: 'All Employees' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    informHR: { type: Boolean, default: false }, // true if sent < 6 hours before work start time
  },
  { timestamps: true }
);

export default mongoose.model('ShiftNotice', shiftNoticeSchema);
