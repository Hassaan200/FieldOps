import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const statusConfig = {
  pending:     { label: 'Pending',     classes: 'bg-amber-50 text-amber-600 border-amber-200',       dot: 'bg-amber-400'   },
  assigned:    { label: 'Assigned',    classes: 'bg-violet-50 text-violet-600 border-violet-200',    dot: 'bg-violet-400'  },
  in_progress: { label: 'In Progress', classes: 'bg-orange-50 text-orange-600 border-orange-200',    dot: 'bg-orange-400'  },
  completed:   { label: 'Completed',   classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled:   { label: 'Cancelled',   classes: 'bg-red-50 text-red-500 border-red-200',             dot: 'bg-red-400'     },
};

const TechnicianJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [newNote, setNewNote] = useState({});
  const [updating, setUpdating] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});

  const messagesEndRef = useRef(null);

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
    if (expandedJob === jobId) { setExpandedJob(null); return; }
    try {
      const res = await api.get(`/jobs/${jobId}/notes`);
      setNotes(prev => ({ ...prev, [jobId]: res.data }));
      setExpandedJob(jobId);
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

  useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
}, [notes]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(async () => {
      fetchJobs();
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
        } catch (err) {}
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [jobs]);

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
            } catch (err) {}
          }
        });
      } catch (err) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [expandedJob]);

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1">Technician Portal</p>
          <h2 className="text-[1.6rem] font-bold text-gray-900 tracking-tight leading-tight">My Assigned Jobs</h2>
          <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live · auto-refreshes every 5s
          </p>
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
                  <div className="h-6 w-24 bg-gray-100 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-32 bg-gray-100 rounded-xl" />
                  <div className="h-8 w-28 bg-gray-100 rounded-xl" />
                  <div className="h-8 w-20 bg-gray-100 rounded-xl" />
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
            <p className="text-sm font-semibold text-gray-400">No jobs assigned yet</p>
            <p className="text-xs text-gray-400">Jobs assigned to you will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => {
              const sc = statusConfig[job.status] || { label: job.status, classes: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' };
              const isExpanded = expandedJob === job.id;
              const jobNotes = notes[job.id] || [];
              const canAct = job.status !== 'completed' && job.status !== 'cancelled';

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Card top */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
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

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {canAct && (
                        <>
                          {job.status !== 'in_progress' && (
                            <button
                              onClick={() => handleStatusUpdate(job.id, 'in_progress')}
                              disabled={updating[job.id]}
                              className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold px-3.5 py-2 rounded-xl border border-orange-200 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Mark In Progress
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusUpdate(job.id, 'completed')}
                            disabled={updating[job.id]}
                            className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-emerald-200 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(job.id, 'cancelled')}
                            disabled={updating[job.id]}
                            className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold px-3.5 py-2 rounded-xl border border-red-200 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        </>
                      )}

                      {/* Updating spinner */}
                      {updating[job.id] && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Updating...
                        </span>
                      )}

                      {/* Messages toggle */}
                      <button
                        onClick={() => fetchNotes(job.id)}
                        className={`relative inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-150 cursor-pointer ml-auto ${
                          isExpanded
                            ? 'bg-[#1a3a2a] text-white shadow-md shadow-emerald-900/20'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {isExpanded ? 'Hide Messages' : 'Messages'}
                        {/* {!isExpanded && unreadMessages[job.id] > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                            {unreadMessages[job.id]}
                          </span>
                        )} */}
                      </button>
                    </div>
                  </div>

                  {/* Expandable messages panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-5 sm:px-6 py-5">
                      <div className="flex items-center gap-2 mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Conversation</h4>
                        <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live · every 2s
                        </span>
                      </div>

                      {/* Messages */}
                      <div className="space-y-2.5 mb-4 max-h-64 overflow-y-auto pr-1">
                        {jobNotes.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4 text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </div>
                            <p className="text-xs text-gray-400 font-medium">No messages yet</p>
                          </div>
                        ) : (
                          jobNotes.map(msg => {
                            const isClient = msg.added_by === job.client_name;
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col max-w-[80%] ${isClient ? 'items-start' : 'items-end ml-auto'}`}
                              >
                                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  isClient
                                    ? 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
                                    : 'bg-[#1a3a2a] text-emerald-50 rounded-tr-sm'
                                }`}>
                                  <span className={`text-[11px] font-semibold block mb-0.5 ${isClient ? 'text-gray-400' : 'text-emerald-300'}`}>
                                    {msg.added_by}
                                  </span>
                                  {msg.note}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 px-1">
                                  {new Date(msg.created_at).toLocaleString()}
                                </p>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Reply input */}
                      <div className="flex gap-2 mt-2">
                        <input
                          value={newNote[job.id] || ''}
                          onChange={(e) => setNewNote(prev => ({ ...prev, [job.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNote(job.id)}
                          placeholder="Type a message to client..."
                          className="flex-1 border border-gray-200 rounded-xl px-2 py-2 text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                        />
                        <button
                          onClick={() => handleAddNote(job.id)}
                          className="inline-flex items-center gap-1.5 bg-[#1a3a2a] hover:bg-[#224d38] text-white text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianJobs;