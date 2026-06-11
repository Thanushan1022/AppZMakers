import { useState } from 'react';
import {
  User, IdCard, Briefcase, Shield, Users, Building2,
  Activity, CalendarDays, Mail, Lock, Eye, EyeOff, LogIn
} from 'lucide-react';
import logoImg from '../../assets/APPZ New Logo.png';
import bgVideo from '../../assets/Employee_Enters_Office_Lobby_GIF.mp4';

const roles = [
  { id: 'employee', label: 'Employee', icon: User },
  { id: 'hr', label: 'HR Manager', icon: IdCard },
  { id: 'company', label: 'Client', icon: Briefcase },
  { id: 'superadmin', label: 'Super Admin', icon: Shield },
];

export function Login({
  mode,
  toggleMode,
  selectedRole,
  setSelectedRole,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  showPass,
  setShowPass,
  handleLogin,
  handleSignup,
  error,
  loading,
}) {
  const isSignup = mode === 'signup';

  return (
    <div className="h-screen w-full flex flex-col-reverse lg:flex-row bg-[#090d16] overflow-hidden relative" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* Full Page Video Background Element */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Navy color overlay filter */}
        <div className="absolute inset-0 bg-[#0f0c2e]/80 z-10" />

        {/* SVG Dot Grid Pattern Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] z-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotPattern" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#5b4cf5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>

        {/* Soft Blurred Circles (depth shadows) */}
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-[#5b4cf5]/20 rounded-full blur-[100px] z-20" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-purple-900/25 rounded-full blur-[100px] z-20" />
      </div>

      {/* LEFT PANEL (44% width on desktop) — Dark branded side, transparent layout overlaying background video */}
      <div className="hidden lg:flex lg:w-[44%] p-8 sm:p-12 lg:p-16 flex-col justify-between relative overflow-hidden flex-shrink-0 h-screen z-10 bg-transparent">

        {/* Top Section: Logo Block & Trust Badges */}
        <div className="relative z-30 space-y-8">
          <div className="flex flex-col items-start gap-4">
            <img src={logoImg} alt="AppzMaker Logo" className="w-50 h-40 object-contain" />
            <div className="text-[#a59bfb] text-sm uppercase font-extrabold tracking-widest mt-1 pl-1">Workforce Solutions</div>
          </div>

          <div className="flex gap-3 pt-2">
            <span className="px-4 py-2 border border-[#2e2880] rounded-full text-xs font-extrabold text-[#a59bfb] bg-[#1a1550]/60 uppercase tracking-wider">SOC 2 Certified</span>
            <span className="px-4 py-2 border border-[#2e2880] rounded-full text-xs font-extrabold text-[#a59bfb] bg-[#1a1550]/60 uppercase tracking-wider">Real-time Sync</span>
          </div>
        </div>

        {/* Middle Section: Hero Text & Stat Cards */}
        <div className="relative z-30 my-8 lg:my-0 space-y-10">
          <div className="space-y-5 max-w-xl">
            <h1 className="text-white text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Unified workforce<br /> operations in a single platform.
            </h1>
            <p className="text-[#40d6a2] text-base sm:text-lg leading-relaxed">
              Track attendance, manage leaves, configure client accounts, and synchronize shifts seamlessly across your entire organization.
            </p>
          </div>

        </div>

        {/* Bottom Section: Footer Copyright */}
        <div className="relative z-30 text-slate-300/90 text-sm pt-4 border-t border-[#2e2880]/50">
          © 2026 Appzmaker. All rights reserved.
        </div>

      </div>

      {/* RIGHT PANEL (56% width on desktop) — Glassmorphic box form side */}
      <div className="flex-1 p-6 sm:p-12 lg:p-16 flex items-center justify-center h-screen z-10 bg-transparent overflow-y-auto">

        {/* Blurred Login Box Container */}
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-[24px] p-8 sm:p-10 space-y-8 my-auto">

          {/* Logo on Mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-24 h-24 bg-[#0f0c2e] rounded-[16px] flex items-center justify-center shadow-md border border-[#2e2880]">
              <img src={logoImg} alt="AppzMaker Logo" className="w-20 h-20 object-contain" />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <span className="text-[#5b4cf5] text-[0px] font-extrabold uppercase tracking-widest block">Welcome back</span>
            <h2 className="text-slate-900 text-[20px] sm:text-3xl font-extrabold tracking-tight whitespace-nowrap">Sign in to your AppZ Makers</h2>
            <p className="text-slate-500 text-sm">Select your role and sign in to continue</p>
          </div>

          {/* Role selector */}
          <div className="space-y-2.5">
            <label className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Choose Portal Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-200/50 rounded-[14px] p-1 gap-1 border border-slate-200/30">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-[11px] text-[11px] font-extrabold transition-all duration-150 ${isSelected
                      ? 'bg-[#5b4cf5] text-white shadow-sm'
                      : 'bg-[#5b4cf5]/5 hover:bg-[#5b4cf5]/10 text-indigo-950/70 hover:text-[#5b4cf5]'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{role.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <div className="space-y-1.5">
                <label className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#fafafa]/90 border border-[#e8e8f0] rounded-[11px] px-4 py-3.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#5b4cf5] focus:ring-2 focus:ring-[#5b4cf5]/15 transition-all font-medium"
                  placeholder="Your full name"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#fafafa]/90 border border-[#e8e8f0] rounded-[11px] pl-11 pr-4 py-3.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#5b4cf5] focus:ring-2 focus:ring-[#5b4cf5]/15 transition-all font-medium"
                  placeholder="you@domain.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-[#fafafa]/90 border border-[#e8e8f0] rounded-[11px] pl-11 pr-12 py-3.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#5b4cf5] focus:ring-2 focus:ring-[#5b4cf5]/15 transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Utility Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-[#5b4cf5] focus:ring-[#5b4cf5]"
                />
                <span>Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5b4cf5] hover:bg-[#4a3de0] disabled:opacity-60 text-white py-3.5 rounded-[12px] flex items-center justify-center gap-2 transition-all font-bold text-sm shadow-sm"
            >
              {loading ? 'Please wait...' : isSignup ? 'Register Portal' : 'Sign In to Workspace'}
              <LogIn className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
