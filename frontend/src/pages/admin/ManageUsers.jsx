import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const roleConfig = {
  admin:      { classes: 'bg-violet-50 text-violet-600 border-violet-200',  dot: 'bg-violet-400' },
  technician: { classes: 'bg-blue-50 text-blue-600 border-blue-200',        dot: 'bg-blue-400'   },
  client:     { classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

const emptyForm = { name: '', email: '', password: '', role: 'client' };

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-150";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.email.trim()) { setError('Email is required'); return; }
    if (!editingUser && !form.password.trim()) { setError('Password is required for new user'); return; }
    if (form.email && !form.email.includes('@')) { setError('Valid email required'); return; }

    setSubmitting(true);
    try {
      if (editingUser) {
        const updateData = { name: form.name, email: form.email, role: form.role };
        if (form.password) updateData.password = form.password;
        await api.put(`/users/${editingUser.id}`, updateData);
        setSuccess('User updated!');
      } else {
        await api.post('/auth/register', form);
        setSuccess('User created!');
      }
      await fetchUsers();
      setTimeout(() => { setShowModal(false); setSuccess(''); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => { setDeleteConfirm(id); };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${deleteConfirm}`);
      setUsers(prev => prev.filter(u => u.id !== deleteConfirm));
      setSuccess('User deleted successfully!');
      setTimeout(() => { setDeleteConfirm(null); setSuccess(''); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setTimeout(() => { setDeleteConfirm(null); setError(''); }, 2000);
    } finally {
      setDeleteConfirm(false);
    }
  };

  const RoleBadge = ({ role }) => {
    const cfg = roleConfig[role] || { classes: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' };
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${cfg.classes}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {role}
      </span>
    );
  };

  const AvatarInitials = ({ name, role }) => {
    const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'U';
    const bg = role === 'admin' ? 'bg-violet-100 text-violet-600' : role === 'technician' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-700';
    return (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${bg}`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1">Admin</p>
            <h2 className="text-[1.6rem] font-bold text-gray-900 tracking-tight leading-tight">Manage Users</h2>
            <p className="text-sm text-gray-400 mt-0.5">Create, edit and manage all system users</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-[#1a3a2a] hover:bg-[#224d38] active:bg-[#162f22] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 transition-all duration-150 cursor-pointer self-start sm:self-auto"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {!loading && `${users.length} user${users.length !== 1 ? 's' : ''}`}
          </p>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Table Card */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#1a3a2a] via-emerald-500 to-emerald-300" />
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-gray-100 rounded-lg" />
                    <div className="h-3 w-48 bg-gray-100 rounded-lg" />
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                  <div className="h-3 w-20 bg-gray-100 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="h-7 w-12 bg-gray-100 rounded-lg" />
                    <div className="h-7 w-12 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#1a3a2a] via-emerald-500 to-emerald-300" />

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map(user => (
                <div key={user.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <AvatarInitials name={user.name} role={user.role} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-gray-400">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a3a2a] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">User</th>
                    <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Email</th>
                    <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Role</th>
                    <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Joined</th>
                    <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AvatarInitials name={user.name} role={user.role} />
                          <span className="font-semibold text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
                      <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(user)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a3a2a] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-300/40 w-full max-w-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#1a3a2a] via-emerald-500 to-emerald-300" />

            <div className="p-6">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingUser ? 'Edit User' : 'Create New User'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editingUser ? 'Update user details below' : 'Fill in details to add a new user'}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. John Smith" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Password
                    {editingUser && <span className="ml-2 text-[10px] font-medium normal-case text-gray-400 tracking-normal">(leave blank to keep same)</span>}
                    {!editingUser && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                  <div className="relative">
                    <select name="role" value={form.role} onChange={handleChange} className={`${inputClass} appearance-none pr-8 cursor-pointer`}>
                      <option value="client">Client</option>
                      <option value="technician">Technician</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-[#1a3a2a] hover:bg-[#224d38] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving...
                    </>
                  ) : editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all duration-150 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-300/40 w-full max-w-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-red-400 to-red-500" />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Delete User?</h3>
                  <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {success}
                </div>
              )}

              {!error && !success && (
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all duration-150 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-red-200 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {submitting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;