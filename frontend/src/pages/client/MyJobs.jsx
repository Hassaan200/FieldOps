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
  const [newMessage, setNewMessage] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});

  // Bilkul component ke andar define karo (global taur par)
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

  useEffect(() => {
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
      setUnreadMessages(prev => ({ ...prev, [jobId]: 0 }));
    } catch (err) {
      console.error('Failed to fetch notes', err);
    }
  };

  const handleSendMessage = async (jobId) => {
    const msg = newMessage[jobId];
    if (!msg?.trim()) return;
    try {
      await api.post(`/jobs/${jobId}/notes`, { note: msg });
      setNewMessage(prev => ({ ...prev, [jobId]: '' }));
      const res = await api.get(`/jobs/${jobId}/notes`);
      setNotes(prev => ({ ...prev, [jobId]: res.data }));
    } catch (err) {
      console.error('Message send failed', err);
    }
  };

  // har 5 seconds mein unread check karo
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(async () => {
      try {
        const jobsRes = await api.get('/jobs/client');
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

  // real-time messages - har 2 seconds check karo (sirf expanded job ke)
  useEffect(() => {
    if (expandedJob) {
      const fetchLatestNotes = async () => {
        try {
          const res = await api.get(`/jobs/${expandedJob}/notes`);
          setNotes(prev => ({ ...prev, [expandedJob]: res.data }));
        } catch (err) {
          console.error('Failed to fetch notes', err);
        }
      };

      const interval = setInterval(fetchLatestNotes, 2000);
      return () => clearInterval(interval);
    }
  }, [expandedJob]);


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
                  className="relative mt-3 bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs hover:bg-gray-200"
                >
                  {expandedJob === job.id ? 'Hide Messages' : '💬 Messages'}
                  {/* {unreadMessages[job.id] > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
      rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {unreadMessages[job.id]}
                    </span>
                  )} */}
                </button>

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
                            className={`rounded px-3 py-2 text-sm max-w-xs ${msg.added_by === job.technician_name
                              ? 'bg-blue-100 text-blue-800 self-start'
                              : 'bg-gray-100 text-gray-700 ml-auto'
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

                    {/* client reply box — sirf tab dikhao jab technician assigned ho */}
                    {job.technician_name ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          value={newMessage[job.id] || ''}
                          onChange={(e) =>
                            setNewMessage(prev => ({ ...prev, [job.id]: e.target.value }))
                          }
                          placeholder="Reply to technician..."
                          className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                          onClick={() => handleSendMessage(job.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Send
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        Messaging available once a technician is assigned.
                      </p>
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