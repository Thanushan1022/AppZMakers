import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Briefcase, Building2, DollarSign, TrendingUp, Edit2, X, Lock, Save, Loader2, AlertCircle, CheckCircle2, FileText, UploadCloud, Trash2 } from 'lucide-react';

export function EmployeeProfileView({
  employee,
  mySalary,
  balance,
  attendancePct,
  presentDays,
  absentDays,
  myAttendance,
  yearsTenure,
  monthsTenure,
  handleUpdateProfile,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      const result = await handleUpdateProfile({ avatar: base64Data });
      if (result && result.success) {
        showToast('success', 'Profile photo updated successfully');
      } else {
        showToast('error', result?.error || 'Failed to update profile photo');
      }
    };
    reader.onerror = () => {
      showToast('error', 'Error reading image file');
    };
    reader.readAsDataURL(file);
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      showToast('error', 'File size exceeds 2.5MB limit');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      const result = await handleUpdateProfile({
        cvName: file.name,
        cvData: base64Data
      });
      setIsUploading(false);
      if (result && result.success) {
        showToast('success', 'CV uploaded successfully');
      } else {
        showToast('error', result?.error || 'Failed to upload CV');
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      showToast('error', 'Error reading file');
    };
    reader.readAsDataURL(file);
  };

  const handleCvDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your CV?')) return;
    setIsUploading(true);
    const result = await handleUpdateProfile({
      cvName: '',
      cvData: ''
    });
    setIsUploading(false);
    if (result && result.success) {
      showToast('success', 'CV deleted successfully');
    } else {
      showToast('error', result?.error || 'Failed to delete CV');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        showToast('error', 'Phone number must be between 7 and 15 digits');
        return;
      }
    }
    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        showToast('error', 'Please fill in both password fields to change your password');
        return;
      }
      if (password !== confirmPassword) {
        showToast('error', 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        showToast('error', 'Password must be at least 6 characters long');
        return;
      }
    }

    setIsSaving(true);
    const updateData = { phone, address };
    if (password) {
      updateData.password = password;
    }

    const result = await handleUpdateProfile(updateData);
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
          <h1 className="text-slate-800" style={{ fontWeight: 700, fontSize: '1.375rem' }}>My Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your personal information and employment details</p>
        </div>
      </div>

      {/* Unique Bento Box Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main ID Card */}
        <div className="lg:col-span-1 relative rounded-[2rem] overflow-hidden shadow-sm group border border-slate-200 bg-white">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 bg-[length:200%_200%] animate-gradient opacity-10"></div>
           <div className="relative p-8 flex flex-col items-center text-center bg-white/40 backdrop-blur-xl h-full">
              
              <div className="relative w-32 h-32 mb-6 group/avatar">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400 to-blue-500 rounded-3xl rotate-6 group-hover/avatar:rotate-12 transition-transform duration-500 blur-md opacity-60"></div>
                 <div className="relative w-full h-full bg-white rounded-3xl p-1 shadow-xl">
                    <div className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center text-indigo-700 font-bold text-3xl">
                      {employee.avatar && employee.avatar.startsWith('data:image/') ? (
                        <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                      ) : (
                        employee.avatar || employee.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                      )}
                    </div>
                 </div>
                 <label className="absolute -bottom-3 -right-3 bg-white p-2.5 rounded-2xl shadow-xl border border-slate-100 cursor-pointer hover:scale-110 hover:-rotate-6 transition-transform text-indigo-600">
                    <UploadCloud className="w-5 h-5" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                 </label>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{employee.name}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium border border-indigo-100 mb-8">
                 <Briefcase className="w-4 h-4" />
                 {employee.position}
              </div>

              <button
                onClick={() => {
                  setPhone(employee.phone || '');
                  setAddress(employee.address || '');
                  setPassword('');
                  setConfirmPassword('');
                  setIsEditing(true);
                }}
                className="w-full mt-auto flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-medium shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-1"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
           </div>
        </div>

        {/* Info Tiles Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <Building2 className="w-32 h-32 text-indigo-600" />
              </div>
              <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 shadow-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Company</p>
              <p className="text-slate-800 font-bold text-lg">{employee.company}</p>
           </div>

           <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <Mail className="w-32 h-32 text-blue-600" />
              </div>
              <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 shadow-sm">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Email Address</p>
              <p className="text-slate-800 font-bold text-lg truncate">{employee.email}</p>
           </div>

           <div className="bg-gradient-to-br from-sky-50 to-white border border-sky-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <Phone className="w-32 h-32 text-sky-600" />
              </div>
              <div className="w-12 h-12 bg-white text-sky-600 rounded-2xl flex items-center justify-center mb-6 border border-sky-100 shadow-sm">
                <Phone className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Phone</p>
              <p className="text-slate-800 font-bold text-lg">{employee.phone || 'Not set'}</p>
           </div>

           <div className="bg-gradient-to-br from-fuchsia-50 to-white border border-fuchsia-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <MapPin className="w-32 h-32 text-fuchsia-600" />
              </div>
              <div className="w-12 h-12 bg-white text-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 border border-fuchsia-100 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Address</p>
              <p className="text-slate-800 font-bold text-lg truncate">{employee.address || 'Not set'}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employment details */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-5 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />Employment Details
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Employee ID', value: employee.id ? employee.id.toUpperCase() : 'N/A' },
              { label: 'Position', value: employee.position },
              { label: 'Department', value: employee.department },
              { label: 'Join Date', value: new Date(employee.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
              { label: 'Tenure', value: `${yearsTenure} yr${yearsTenure !== 1 ? 's' : ''} ${monthsTenure} mo${monthsTenure !== 1 ? 's' : ''}` },
              { label: 'Working Country', value: employee.country || 'N/A' },
              { label: 'Employment Status', value: employee.status ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1) : 'Active' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-slate-400 text-sm">{label}</span>
                <span className="text-slate-700 text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance stats */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />Attendance Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Attendance Rate', value: `${attendancePct}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Present Days', value: `${presentDays}`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Absent Days', value: `${absentDays}`, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Late Days', value: `${myAttendance ? myAttendance.filter(a => a.status === 'late').length : 0}`, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <div className={`${s.color} mb-0.5`} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.5rem' }}>{s.value}</div>
                <div className="text-slate-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave summary */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-slate-800 font-semibold mb-5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />Leave Summary
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Annual Leave', data: balance.annual, color: 'bg-indigo-500' },
              { label: 'Casual Leave', data: balance.casual, color: 'bg-sky-500' },
              { label: 'Personal Leave', data: balance.personal, color: 'bg-rose-500' },
            ].map(({ label, data, color }) => {
              if (!data) return null;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600">{label}</span>
                    <span className="text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>{data.total - data.used} / {data.total}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${((data.total - data.used) / data.total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CV / Resume Card */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-800 font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />CV / Resume
            </h3>
            <p className="text-slate-400 text-xs mb-5">Upload your CV to let HR view your professional background</p>
          </div>

          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
              <span className="text-xs text-slate-500 font-medium">Processing CV...</span>
            </div>
          ) : employee.cvName && employee.cvData ? (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-400 font-medium">Uploaded CV</div>
                  <div className="text-slate-700 font-semibold text-sm truncate mt-0.5" title={employee.cvName}>
                    {employee.cvName}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={employee.cvData}
                  download={employee.cvName}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Download CV
                </a>
                <button
                  onClick={handleCvDelete}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-6 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-dashed border-slate-200 hover:border-slate-300 transition-all cursor-pointer group">
              <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-slate-600 mb-2 transition-colors" />
              <span className="text-xs text-slate-500 group-hover:text-slate-700 font-medium transition-colors">Click to upload CV</span>
              <span className="text-[10px] text-slate-400 mt-1">PDF or DOCX (Max 2.5MB)</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleCvUpload}
                className="hidden"
              />
            </label>
          )}
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
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Info</h4>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="phone">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\s\-()]/g, ''))}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="address">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <textarea
                      id="address"
                      rows="2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, City, Country"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-500" />
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
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/10 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
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
