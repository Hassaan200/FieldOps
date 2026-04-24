import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (role === 'technician') navigate('/technician/jobs', { replace: true });
      else navigate('/client/jobs', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (role === 'technician') navigate('/technician/jobs', { replace: true });
      else navigate('/client/jobs', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center px-4">

      {/* Split card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-gray-200/60 overflow-hidden flex min-h-[520px]">

        {/* Left panel — brand */}
        <div className="hidden md:flex flex-col justify-between bg-[#1a3a2a] w-5/12 p-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth={2.2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 10m0 3V7" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">FieldOps</span>
          </div>

          <div>
            <h1 className="text-white text-3xl font-bold leading-tight mb-3">
              Manage field jobs<br />with ease.
            </h1>
            <p className="text-emerald-300/70 text-sm leading-relaxed">
              Assign technicians, track progress, and communicate — all in one place.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Real-time job tracking' },
                { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', text: 'Built-in messaging' },
                { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', text: 'Instant notifications' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-400/15 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth={2} className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                  </div>
                  <span className="text-emerald-100/80 text-xs font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-emerald-400/40 text-xs">© {new Date().getFullYear()} FieldOps</p>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-[#1a3a2a] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth={2.2} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 10m0 3V7" />
              </svg>
            </div>
            <span className="text-[#1a3a2a] font-bold text-base tracking-tight">FieldOps</span>
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#1a3a2a] transition-colors mb-6 cursor-pointer group"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-400 mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-150"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-150"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1a3a2a] hover:bg-[#224d38] active:bg-[#162f22] text-white text-sm font-semibold py-3 rounded-xl shadow-md shadow-emerald-900/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;