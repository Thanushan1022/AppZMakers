import React, { useState } from 'react';
import { Mail, ShieldCheck, Edit2, X, Lock, Save, Loader2, AlertCircle, CheckCircle2, User, UploadCloud } from 'lucide-react';

export function AdminProfileView({
  adminProfile,
  handleUpdateProfile,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length < 2 || name.trim().length > 30) {
      showToast('error', 'Name must be between 2 and 30 characters long.');
      return;
    }
    if (!/^[a-zA-Z\s.\-]+$/.test(name)) {
      showToast('error', 'Name contains invalid characters.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showToast('error', 'Please enter a valid email address.');
      return;
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
    const updateData = { name, email };
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

  if (!adminProfile) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const avatarText = adminProfile.name
    ? adminProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

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
          <p className="text-slate-500 text-sm mt-0.5">Your personal information and system administrator settings</p>
        </div>
      </div>

      {/* Unique Bento Box Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main ID Card */}
        <div className="lg:col-span-1 relative rounded-[2rem] overflow-hidden shadow-sm group border border-slate-200 bg-white">
           <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 bg-[length:200%_200%] animate-gradient opacity-10"></div>
           <div className="relative p-8 flex flex-col items-center text-center bg-white/40 backdrop-blur-xl h-full">
              
              <div className="relative w-32 h-32 mb-6 group/avatar">
                 <div className="absolute inset-0 bg-gradient-to-tr from-violet-400 to-indigo-500 rounded-3xl rotate-6 group-hover/avatar:rotate-12 transition-transform duration-500 blur-md opacity-60"></div>
                 <div className="relative w-full h-full bg-white rounded-3xl p-1 shadow-xl">
                    <div className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center text-violet-700 font-bold text-3xl">
                      {adminProfile.avatar && adminProfile.avatar.startsWith('data:image/') ? (
                        <img src={adminProfile.avatar} alt={adminProfile.name} className="w-full h-full object-cover" />
                      ) : (
                        avatarText
                      )}
                    </div>
                 </div>
                 <label className="absolute -bottom-3 -right-3 bg-white p-2.5 rounded-2xl shadow-xl border border-slate-100 cursor-pointer hover:scale-110 hover:-rotate-6 transition-transform text-violet-600">
                    <UploadCloud className="w-5 h-5" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                 </label>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{adminProfile.name}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-sm font-medium border border-violet-100 mb-8">
                 <ShieldCheck className="w-4 h-4" />
                 Super Admin
              </div>

              <button
                onClick={() => {
                  setName(adminProfile.name || '');
                  setEmail(adminProfile.email || '');
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
           <div className="bg-gradient-to-br from-violet-50 to-white border border-violet-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <ShieldCheck className="w-32 h-32 text-violet-600" />
              </div>
              <div className="w-12 h-12 bg-white text-violet-600 rounded-2xl flex items-center justify-center mb-6 border border-violet-100 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Permissions</p>
              <p className="text-slate-800 font-bold text-lg">All System Controls</p>
           </div>

           <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <Mail className="w-32 h-32 text-indigo-600" />
              </div>
              <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 shadow-sm">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Email Address</p>
              <p className="text-slate-800 font-bold text-lg truncate">{adminProfile.email}</p>
           </div>

           <div className="bg-gradient-to-br from-fuchsia-50 to-white border border-fuchsia-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <User className="w-32 h-32 text-fuchsia-600" />
              </div>
              <div className="w-12 h-12 bg-white text-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 border border-fuchsia-100 shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Account Type</p>
              <p className="text-slate-800 font-bold text-lg">Super Admin</p>
           </div>

           <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-center items-center group">
              <div className="text-center transform transition-transform group-hover:scale-105 duration-300">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border border-emerald-100 mb-4 relative shadow-sm">
                    <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping opacity-20"></div>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                 </div>
                 <p className="text-slate-500 text-sm font-medium mb-1">Account Status</p>
                 <p className="text-emerald-600 font-bold text-xl capitalize">Active</p>
              </div>
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
                      placeholder="Admin User"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
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
                      placeholder="admin@system.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-violet-500" />
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
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
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
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium shadow-md shadow-violet-600/10 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
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
