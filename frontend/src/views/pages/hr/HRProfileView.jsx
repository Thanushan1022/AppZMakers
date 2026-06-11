import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Briefcase, Building2, Edit2, X, Lock, Save, Loader2, AlertCircle, CheckCircle2, User } from 'lucide-react';

export function HRProfileView({
  hrProfile,
  handleUpdateHRProfile,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
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
    const updateData = { name, email, department };
    if (password) {
      updateData.password = password;
    }

    const result = await handleUpdateHRProfile(updateData);
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

  if (!hrProfile) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const avatarText = hrProfile.name
    ? hrProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HR';

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
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>My HR Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your personal information and account details</p>
        </div>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-sky-600 to-indigo-700" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-5 pt-3">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 -mt-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg flex-shrink-0" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
                {avatarText}
              </div>
              <div>
                <h2 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{hrProfile.name}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="text-slate-500 text-sm">HR Manager</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-sky-600 text-sm font-medium">{hrProfile.department}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${hrProfile.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {hrProfile.status}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setName(hrProfile.name || '');
                setEmail(hrProfile.email || '');
                setDepartment(hrProfile.department || '');
                setPassword('');
                setConfirmPassword('');
                setIsEditing(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-sm font-medium transition-colors border border-sky-100 sm:mb-1"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Mail, label: 'Email', value: hrProfile.email },
              { icon: Building2, label: 'Department', value: hrProfile.department || 'Human Resources' },
              { icon: Briefcase, label: 'Role', value: 'HR Admin' },
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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-border shadow-2xl overflow-hidden transform scale-100 transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50">
              <div>
                <h3 className="text-slate-800 font-semibold text-lg">Update Profile Information</h3>
                <p className="text-slate-400 text-xs mt-0.5">Edit your contact details or change your password</p>
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
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personal Info</h4>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="name">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Amanda Foster"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
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
                      placeholder="amanda@company.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="department">Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="department"
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Human Resources"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-500" />
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
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
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
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium shadow-md shadow-sky-600/10 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
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
