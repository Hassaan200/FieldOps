import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-150";

const roleConfig = {
  admin:      { classes: 'bg-violet-50 text-violet-600 border-violet-200', dot: 'bg-violet-400' },
  technician: { classes: 'bg-blue-50 text-blue-600 border-blue-200',       dot: 'bg-blue-400'   },
  client:     { classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

const demoEmails = ['admin@demo.com', 'tech@demo.com', 'client@demo.com'];

const Profile = () => {
  const { user } = useAuth();
  const isDemoAccount = demoEmails.includes(user?.email);

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isDemoAccount) {
      return setError('This is a demo account. Credentials cannot be changed.');
    }

    if (form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match');
    }
    if (form.newPassword.length < 6) {
      return setError('New password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await api.put('/users/profile/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const rc = roleConfig[user?.role] || { classes: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' };

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-7">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1">Account</p>
          <h2 className="text-[1.6rem] font-bold text-gray-900 tracking-tight leading-tight">My Profile</h2>
          <p className="text-sm text-gray-400 mt-0.5">View your info and manage account security</p>
        </div>

        {/* demo banner */}
        {isDemoAccount && (
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl mb-5 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            This is a demo account — credentials cannot be changed.
          </div>
        )}

        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="h-1 w-full bg-gradient-to-r from-[#1a3a2a] via-emerald-500 to-emerald-300" />
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#1a3a2a] text-emerald-200 text-lg font-bold flex items-center justify-center select-none flex-shrink-0 shadow-md shadow-emerald-900/20">
                {initials}
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 leading-tight">{user?.name}</p>
                <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize mt-1.5 ${rc.classes}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {[
                {
                  label: 'Full Name', value: user?.name,
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                },
                {
                  label: 'Email Address', value: user?.email,
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
                },
                {
                  label: 'Role', value: <span className="capitalize">{user?.role}</span>,
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 bg-gray-50/40">
                  <div className="flex items-center gap-2.5 text-gray-400">
                    {icon}
                    <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#1a3a2a] via-emerald-500 to-emerald-300" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#1a3a2a]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1a3a2a" strokeWidth={1.8} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">Change Password</h3>
                <p className="text-xs text-gray-400 mt-0.5">Keep your account secure</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
              </div>
            )}

            {isDemoAccount ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={1.8} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">Password change disabled</p>
                <p className="text-xs text-gray-400 mt-1">Demo accounts cannot modify credentials.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Current Password <span className="text-red-400">*</span>
                  </label>
                  <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
                </div>

                <div className="h-px bg-gray-100" />

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    New Password <span className="text-red-400">*</span>
                  </label>
                  <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} className={inputClass} placeholder="Min. 6 characters" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Confirm New Password <span className="text-red-400">*</span>
                  </label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1a3a2a] hover:bg-[#224d38] active:bg-[#162f22] text-white text-sm font-semibold py-2.5 rounded-xl shadow-md shadow-emerald-900/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Update Password
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;