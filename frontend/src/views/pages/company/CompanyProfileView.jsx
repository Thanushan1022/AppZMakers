import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Briefcase, Building2, Edit2, X, Lock, Save, Loader2, AlertCircle, CheckCircle2, User, Landmark } from 'lucide-react';

export function CompanyProfileView({
  company,
  handleUpdateCompanyProfile,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    if (password && password.length < 6) {
      showToast('error', 'Password must be at least 6 characters long');
      return;
    }

    setIsSaving(true);
    const updateData = { name, email, industry, contact, phone };
    if (password) {
      updateData.password = password;
    }

    const result = await handleUpdateCompanyProfile(updateData);
    setIsSaving(false);

    if (result && result.success) {
      showToast('success', result.message || 'Profile updated successfully');
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
    } else {
      showToast('error', result?.error || 'Failed to update profile');
    }
  };

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const avatarText = company.name
    ? company.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CP';

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium transition-all transform translate-y-0 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>My Client Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your business details and partner account settings</p>
        </div>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-emerald-600 to-teal-700" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-5 pt-3">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 -mt-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg flex-shrink-0" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
                {avatarText}
              </div>
              <div>
                <h2 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{company.name}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="text-slate-500 text-sm">Client Partner</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-600 text-sm font-medium">{company.industry || 'General Industry'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${company.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {company.status}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setName(company.name || '');
                setEmail(company.email || '');
                setIndustry(company.industry || '');
                setContact(company.contact || '');
                setPhone(company.phone || '');
                setPassword('');
                setConfirmPassword('');
                setIsEditing(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium transition-colors border border-emerald-100 sm:mb-1"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Mail, label: 'Email', value: company.email },
              { icon: Phone, label: 'Phone', value: company.phone || 'Not set' },
              { icon: Landmark, label: 'Industry', value: company.industry || 'Not set' },
              { icon: User, label: 'Contact Person', value: company.contact || 'Not set' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <div className="text-slate-400 text-xs">{label}</div>
                  <div className="text-slate-700 text-sm mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business details */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-5 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" />Business Details
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Client ID', value: company.id ? company.id.toUpperCase() : 'N/A' },
              { label: 'Industry Sector', value: company.industry || 'General' },
              { label: 'Primary Contact', value: company.contact || 'N/A' },
              { label: 'Joined Date', value: company.joinedDate ? new Date(company.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
              { label: 'Assigned Employees Count', value: `${company.employeeCount || 0} active employees` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-slate-400 text-sm">{label}</span>
                <span className="text-slate-700 text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-border shadow-2xl overflow-hidden transform scale-100 transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50">
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">Update Profile Information</h3>
                <p className="text-slate-400 text-xs mt-0.5">Edit your business details or change your password</p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {toast && toast.type === 'error' && (
                <div className="flex items-center gap-2.5 p-3.5 text-sm font-medium text-rose-800 bg-rose-50 border border-rose-100 rounded-xl animate-in slide-in-from-top-2 duration-200">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <span>{toast.text}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Info</h4>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="name">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My Company LLC"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="partner@company.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700" htmlFor="industry">Industry Sector</label>
                    <input
                      id="industry"
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Technology"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700" htmlFor="contact">Contact Person</label>
                    <input
                      id="contact"
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="phone">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Change Password (Optional)</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700" htmlFor="password">New Password</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <p className="text-slate-400 text-xs">Leave password fields blank if you do not want to change your password.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-md shadow-emerald-600/10 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
