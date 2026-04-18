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

const TechnicianJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [newNote, setNewNote] = useState({});
  const [updating, setUpdating] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/my');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const fetchNotes = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }
    try {
      const res = await api.get(`/jobs/${jobId}/notes`);
      setNotes(prev => ({ ...prev, [jobId]: res.data }));
      setExpandedJob(jobId);
      // open hone pr unread clear karo
      setUnreadMessages(prev => ({ ...prev, [jobId]: 0 }));
    } catch (err) {
      console.error('Failed to fetch notes', err);
    }
  };

  const handleStatusUpdate = async (jobId, status) => {
    setUpdating(prev => ({ ...prev, [jobId]: true }));
    try {
      await api.patch(`/jobs/${jobId}/status`, { status });
      await fetchJobs();
    } catch (err) {
      console.error('Status update failed', err);
    } finally {
      setUpdating(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleAddNote = async (jobId) => {
    const note = newNote[jobId];
    if (!note?.trim()) return;
    try {
      await api.post(`/jobs/${jobId}/notes`, { note });
      setNewNote(prev => ({ ...prev, [jobId]: '' }));
      const res = await api.get(`/jobs/${jobId}/notes`);
      setNotes(prev => ({ ...prev, [jobId]: res.data }));
    } catch (err) {
      console.error('Failed to add note', err);
    }
  };
  // refresh data after 10 seconds.
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(async () => {
      fetchJobs();
      // har job ke messages check karo silently
      for (const job of jobs) {
        try {
          const res = await api.get(`/jobs/${job.id}/notes`);
          const newCount = res.data.length;
          const oldCount = notes[job.id]?.length || 0;
          if (newCount > oldCount && expandedJob !== job.id) {
            setUnreadMessages(prev => ({
              ...prev,
              [job.id]: (prev[job.id] || 0) + (newCount - oldCount)
            }));
          }
        } catch (err) { }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [jobs]);

  // message ke lye useeffect

  // useEffect mein messages ko har 2 seconds check karo (sirf jo expanded ho)
  useEffect(() => {
    if (expandedJob) {
      // expanded job ke messages ko frequently fetch karo
      const fetchLatestNotes = async () => {
        try {
          const res = await api.get(`/jobs/${expandedJob}/notes`);
          setNotes(prev => ({ ...prev, [expandedJob]: res.data }));
        } catch (err) {
          console.error('Failed to fetch notes', err);
        }
      };

      // har 2 second mein refresh
      const interval = setInterval(fetchLatestNotes, 2000);
      return () => clearInterval(interval);
    }
  }, [expandedJob]);

  // har 5 seconds mein unread messages check karo (jo expanded nahi ho)
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(async () => {
      try {
        const jobsRes = await api.get('/jobs/my');
        setJobs(jobsRes.data);

        jobsRes.data.forEach(async (job) => {
          if (expandedJob !== job.id) {
            try {
              const res = await api.get(`/jobs/${job.id}/notes`);
              const unread = res.data.filter(note => !note.is_read).length;
              setUnreadMessages(prev => ({ ...prev, [job.id]: unread }));
            } catch (err) { }
          }
        });
      } catch (err) { }
    }, 5000);

    return () => clearInterval(interval);
  }, [expandedJob]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Assigned Jobs</h2>

        {loading ? (
          <p className="text-gray-500">Loading your jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">No jobs assigned to you yet.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.description || 'No description provided'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Client: <span className="font-medium text-gray-600">{job.client_name}</span>
                      {job.scheduled_at && (
                        <> &middot; {new Date(job.scheduled_at).toLocaleString()}</>
                      )}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[job.status]}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>

                {/* status update buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.status !== 'completed' && job.status !== 'cancelled' && (
                    <>
                      {job.status !== 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate(job.id, 'in_progress')}
                          disabled={updating[job.id]}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600 disabled:opacity-60 cursor-pointer"
                        >
                          Mark In Progress
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(job.id, 'completed')}
                        disabled={updating[job.id]}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-60 cursor-pointer"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(job.id, 'cancelled')}
                        disabled={updating[job.id]}
                        className="bg-red-400 text-white px-3 py-1 rounded text-xs hover:bg-red-500 disabled:opacity-60 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => fetchNotes(job.id)}
                    className="relative bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs hover:bg-gray-200"
                  >
                    {expandedJob === job.id ? 'Hide Messages' : '💬 Messages'}
                    {/* {unreadMessages[job.id] > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
      rounded-full h-4 w-4 flex items-center justify-center font-bold">
      {unreadMessages[job.id]}
    </span>
  )} */}
                  </button>
                </div>

                {/* notes section */}
                {expandedJob === job.id && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      💬 Messages
                    </h4>
                    {notes[job.id]?.length === 0 ? (
                      <p className="text-xs text-gray-400 mb-3">No messages yet.</p>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {notes[job.id]?.map(msg => (
                          <div
                            key={msg.id}
                            className={`rounded px-3 py-2 text-sm max-w-xs ${msg.added_by === job.client_name
                              ? 'bg-gray-100 text-gray-700 self-start'
                              : 'bg-blue-100 text-blue-800 ml-auto'
                              }`}
                          >
                            <span className="font-medium">{msg.added_by}: </span>
                            <span>{msg.note}</span>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(msg.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      <input
                        value={newNote[job.id] || ''}
                        onChange={(e) =>
                          setNewNote(prev => ({ ...prev, [job.id]: e.target.value }))
                        }
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        onClick={() => handleAddNote(job.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Send
                      </button>
                    </div>
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

export default TechnicianJobs;