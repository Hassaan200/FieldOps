import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Jobs</h2>
          <button
            onClick={() => navigate('/admin/jobs/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            + Create Job
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">No jobs found. Create one first.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{job.description || 'No description'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Client: <span className="font-medium text-gray-600">{job.client_name}</span>
                      {job.scheduled_at && (
                        <> &middot; Scheduled: {new Date(job.scheduled_at).toLocaleString()}</>
                      )}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[job.status]}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600">
                    Technician: <span className="font-medium">{job.technician_name || 'Unassigned'}</span>
                  </span>
                  <select
                    defaultValue=""
                    onChange={(e) => handleAssign(job.id, e.target.value)}
                    disabled={assigning[job.id]}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Reassign technician...</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                 
                  <select
                    defaultValue=""
                    onChange={(e) => handleAdminStatus(job.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Change status...</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {assigning[job.id] && (
                    <span className="text-xs text-gray-400">Assigning...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;