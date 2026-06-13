import { useState } from 'react';

const BACKEND_URL = 'https://appzmakers-production.up.railway.app/api/auth';

const defaultPages = {
  employee: 'dashboard',
  hr: 'dashboard',
  company: 'dashboard',
  superadmin: 'dashboard',
};

export function useAuthController() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('wf_auth');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('wf_page') || 'dashboard';
  });
  const [mode, setMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('employee');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const persistAuth = (data) => {
    const authPayload = {
      email: data.email,
      name: data.name,
      role: data.role,
      userId: data.userId,
      token: data.token,
    };
    setAuth(authPayload);
    localStorage.setItem('wf_auth', JSON.stringify(authPayload));
    const defaultPage = defaultPages[data.role] || 'dashboard';
    setCurrentPage(defaultPage);
    localStorage.setItem('wf_page', defaultPage);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      persistAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: selectedRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      const loginRes = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setMode('login');
        setError('Account created. Please sign in.');
        return;
      }

      persistAuth(loginData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('wf_auth');
    localStorage.removeItem('wf_page');
    setCurrentPage('dashboard');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    localStorage.setItem('wf_page', page);
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError('');
  };

  return {
    auth,
    currentPage,
    setCurrentPage: navigateTo,
    mode,
    toggleMode,
    selectedRole,
    setSelectedRole: handleRoleChange,
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
    handleLogout,
    error,
    loading,
  };
}
