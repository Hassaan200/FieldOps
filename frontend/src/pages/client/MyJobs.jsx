import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels = {
  pending: 'Pending — waiting to be assigned',
  assigned: 'Assigned — technician on the way',
  in_progress: 'In Progress — work has started',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const ClientJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs/client');
        setJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const fetchNotes = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }
    try {
      const res = await api.get(`/jobs/${jobId}/notes`);
      setNotes(prev => ({ ...prev, [jobId]: res.data }));
      setExpandedJob(jobId);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    }
  };

  useEffect(() => {
  const load = async () => {
    try {
      const res = await api.get('/jobs/client');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  load();
  const interval = setInterval(load, 30000);
  return () => clearInterval(interval);
}, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Jobs</h2>

        {loading ? (
          <p className="text-gray-500">Loading your jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">You have no jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.description || 'No description'}
                    </p>
                    {job.scheduled_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Scheduled: {new Date(job.scheduled_at).toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Technician: <span className="font-medium text-gray-600">
                        {job.technician_name || 'Not assigned yet'}
                      </span>
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[job.status]}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-2 italic">
                  {statusLabels[job.status]}
                </p>

                <button
                  onClick={() => fetchNotes(job.id)}
                  className="mt-3 bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs hover:bg-gray-200"
                >
                  {expandedJob === job.id ? 'Hide Updates' : 'View Updates'}
                </button>

                {expandedJob === job.id && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Job Updates</h4>
                    {notes[job.id]?.length === 0 ? (
                      <p className="text-xs text-gray-400">No updates yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {notes[job.id]?.map(note => (
                          <div key={note.id} className="bg-gray-50 rounded px-3 py-2 text-sm">
                            <span className="font-medium text-gray-700">{note.added_by}: </span>
                            <span className="text-gray-600">{note.note}</span>
                            <span className="text-xs text-gray-400 ml-2">
                              {new Date(note.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientJobs;