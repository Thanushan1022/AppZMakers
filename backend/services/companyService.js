import Company from '../models/Company.js';
import Employee from '../models/Employee.js';

export const syncCompanyEmployeeCounts = async () => {
  const companies = await Company.find();
  for (const company of companies) {
    const cid = company.legacyId || company._id.toString();
    const count = await Employee.countDocuments({ companyId: cid });
    company.employeeCount = count;
    await company.save();
  }
};
