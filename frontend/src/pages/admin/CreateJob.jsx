import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const CreateJob = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    client_id: '',
    scheduled_at: '',
  });
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/users/clients');
        setClients(res.data);
      } catch (err) {
        console.error('Could not load clients', err);
      }
    };
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/jobs', form);
      setSuccess('Job created successfully!');
      setTimeout(() => navigate('/admin/jobs'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Page Header */}
        <div className="mb-7">
          <button
            onClick={() => navigate('/admin/jobs')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#1a3a2a] transition-colors mb-3 cursor-pointer group"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </button>
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1">Admin</p>
          <h2 className="text-[1.6rem] font-bold text-gray-900 tracking-tight leading-tight">Create New Job</h2>
          <p className="text-sm text-gray-400 mt-0.5">Fill in the details below to dispatch a new field job</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 mt-0.5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 mt-0.5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Card Header accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#1a3a2a] via-emerald-500 to-emerald-300" />

          <div className="p-6 sm:p-8 space-y-6">

            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Job Title <span className="text-red-400">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-150 bg-gray-50/50"
                placeholder="e.g. AC Repair at Site B"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Description
                <span className="ml-2 text-[10px] font-medium normal-case text-gray-400 tracking-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-150 bg-gray-50/50 resize-none"
                placeholder="Optional details about the job..."
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Client */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Client <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="client_id"
                  value={form.client_id}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-150 bg-gray-50/50 appearance-none cursor-pointer"
                  required
                >
                  <option value="">— Select a client —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Scheduled Date & Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Scheduled Date & Time
                <span className="ml-2 text-[10px] font-medium normal-case text-gray-400 tracking-normal">(optional)</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="datetime-local"
                  name="scheduled_at"
                  value={form.scheduled_at}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-150 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-[#1a3a2a] hover:bg-[#224d38] active:bg-[#162f22] text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Job
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/admin/jobs')}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-600 text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all duration-150 cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;