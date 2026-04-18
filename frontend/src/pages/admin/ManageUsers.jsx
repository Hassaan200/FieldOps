import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  technician: 'bg-blue-100 text-blue-700',
  client: 'bg-green-100 text-green-700',
};

const emptyForm = { name: '', email: '', password: '', role: 'client' };

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
    
    // VALIDATION 
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!editingUser && !form.password.trim()) {
      setError('Password is required for new user');
      return;
    }
    if (form.email && !form.email.includes('@')) {
      setError('Valid email required');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editingUser) {
        // Password optional for edit here
        const updateData = { name: form.name, email: form.email, role: form.role };
        if (form.password) updateData.password = form.password;
        await api.put(`/users/${editingUser.id}`, updateData);
        setSuccess('User updated!');
      } else {
        // If Create new user - password is required
        await api.post('/auth/register', form);
        setSuccess('User created!');
      }
      await fetchUsers();
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

    const handleDelete = async (id) => {
    setDeleteConfirm(id); // delete modal opens
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${deleteConfirm}`);
      setUsers(prev => prev.filter(u => u.id !== deleteConfirm));
      setSuccess('User deleted succesfully!');
      setTimeout(() => {
        setDeleteConfirm(null);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
       setTimeout(() => {
        setDeleteConfirm(null);
        setError('');
      }, 2000);
    } finally {
      setDeleteConfirm(false); // delete modal close
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 cursor-pointer"
          >
            + Add User
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading users...</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Mobile View - Card Layout */}
            <div className="md:hidden space-y-3 p-4">
              {users.map(user => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="flex-1 text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded text-xs font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded text-xs font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Name</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Email</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Role</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Joined</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{user.name}</td>
                      <td className="px-5 py-3 text-gray-600">{user.email}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 flex gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="text-blue-600 hover:underline text-xs cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 hover:underline text-xs cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0  bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>

            {error && (
              <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-3 text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-3 text-sm">{success}</div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && <span className="text-gray-400">(leave blank to keep same)</span>}
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="client">Client</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded text-sm hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Delete Confirmation Modal */}
           {deleteConfirm && (
        <div className="fixed inset-0 bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Delete User?</h3>
            
            {error ? (
              <div className="bg-red-100 text-red-600 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : success ? (
              <div className="bg-green-100 text-green-600 px-4 py-3 rounded mb-4 text-center">
                ✓ {success}
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                Are you sure? This action cannot be undone.
              </p>
            )}
            
            <div className="flex gap-3 justify-end">
              {!error && !success && (
                <>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 cursor-pointer text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={submitting}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer text-sm font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;