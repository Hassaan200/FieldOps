import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const statusConfig = {
  pending:     { label: 'Pending',     classes: 'bg-amber-50 text-amber-600 border-amber-200',   dot: 'bg-amber-400' },
  assigned:    { label: 'Assigned',    classes: 'bg-violet-50 text-violet-600 border-violet-200', dot: 'bg-violet-400' },
  in_progress: { label: 'In Progress', classes: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-400' },
  completed:   { label: 'Completed',   classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled:   { label: 'Cancelled',   classes: 'bg-red-50 text-red-500 border-red-200',          dot: 'bg-red-400' },
};

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [jobsRes, techRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/users/technicians'),
      ]);
      setJobs(jobsRes.data);
      setTechnicians(techRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (jobId, techId) => {
    if (!techId) return;
    setAssigning(prev => ({ ...prev, [jobId]: true }));
    try {
      await api.patch(`/jobs/${jobId}/assign`, { technician_id: techId });
      await fetchData();
    } catch (err) {
      console.error('Assign failed', err);
    } finally {
      setAssigning(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleAdminStatus = async (jobId, status) => {
    if (!status) return;
    try {
      await api.patch(`/jobs/${jobId}/admin-status`, { status });
      await fetchData();
    } catch (err) {
      console.error('Admin status update failed', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1">Admin</p>
            <h2 className="text-[1.6rem] font-bold text-gray-900 tracking-tight leading-tight">All Jobs</h2>
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live · refreshes every 10s
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/jobs/create')}
            className="inline-flex items-center gap-2 bg-[#1a3a2a] hover:bg-[#224d38] active:bg-[#162f22] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 transition-all duration-150 cursor-pointer self-start sm:self-auto"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Job
          </button>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {!loading && `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found`}
          </p>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* States */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-gray-100 rounded-lg" />
                    <div className="h-3 w-72 bg-gray-100 rounded-lg" />
                    <div className="h-3 w-36 bg-gray-100 rounded-lg" />
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="h-px bg-gray-100 mb-4" />
                <div className="flex gap-3">
                  <div className="h-9 w-40 bg-gray-100 rounded-xl" />
                  <div className="h-9 w-40 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-400">No jobs found</p>
            <p className="text-xs text-gray-400">Create your first job to get started</p>
            <button
              onClick={() => navigate('/admin/jobs/create')}
              className="mt-2 inline-flex items-center gap-2 bg-[#1a3a2a] hover:bg-[#224d38] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => {
              const sc = statusConfig[job.status] || { label: job.status, classes: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  {/* Top section */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-base leading-tight">{job.title}</h3>
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.classes}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                        {job.description || <span className="italic text-gray-300">No description provided</span>}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Client: <span className="font-semibold text-gray-600">{job.client_name}</span>
                        </span>
                        {job.scheduled_at && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(job.scheduled_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom action bar */}
                  <div className="border-t border-gray-100 bg-gray-50/60 px-5 sm:px-6 py-3.5 flex flex-wrap items-center gap-3">

                    {/* Technician info */}
                    <div className="flex items-center gap-2 mr-1">
                      <div className="w-6 h-6 rounded-lg bg-[#1a3a2a]/10 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#1a3a2a" strokeWidth={2} className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500">
                        {job.technician_name
                          ? <span className="font-semibold text-gray-700">{job.technician_name}</span>
                          : <span className="italic text-gray-400">Unassigned</span>}
                      </span>
                    </div>

                    {/* Assign technician select */}
                    <div className="relative">
                      <select
                        defaultValue=""
                        onChange={(e) => handleAssign(job.id, e.target.value)}
                        disabled={assigning[job.id]}
                        className="appearance-none border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <option value="">Reassign technician...</option>
                        {technicians.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Change status select */}
                    <div className="relative">
                      <select
                        defaultValue=""
                        onChange={(e) => handleAdminStatus(job.id, e.target.value)}
                        className="appearance-none border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="">Change status...</option>
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Assigning spinner */}
                    {assigning[job.id] && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Assigning...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;