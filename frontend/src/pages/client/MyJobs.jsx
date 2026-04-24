import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const statusConfig = {
  pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-400', hint: 'Waiting to be assigned to a technician' },
  assigned: { label: 'Assigned', classes: 'bg-violet-50 text-violet-600 border-violet-200', dot: 'bg-violet-400', hint: 'Technician assigned — on the way' },
  in_progress: { label: 'In Progress', classes: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-400', hint: 'Work has started on your job' },
  completed: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', hint: 'Job completed successfully' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-50 text-red-500 border-red-200', dot: 'bg-red-400', hint: 'This job has been cancelled' },
};

const ClientJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [notes, setNotes] = useState({});
  const [newMessage, setNewMessage] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevCountRef = useRef({});

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
    if (expandedJob) {
      const currentCount = notes[expandedJob]?.length || 0;
      const prevCount = prevCountRef.current[expandedJob] || 0;
      
      // Scroll only if messages increased (new message arrived)
      if (currentCount > prevCount) {
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 50);
      }
      
      prevCountRef.current[expandedJob] = currentCount;
    }
  }, [notes, expandedJob]);

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1">Client Portal</p>
          <h2 className="text-[1.6rem] font-bold text-gray-900 tracking-tight leading-tight">My Jobs</h2>
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
                <div className="flex justify-between mb-3">
                  <div className="space-y-2">
                    <div className="h-4 w-44 bg-gray-100 rounded-lg" />
                    <div className="h-3 w-64 bg-gray-100 rounded-lg" />
                    <div className="h-3 w-32 bg-gray-100 rounded-lg" />
                  </div>
                  <div className="h-6 w-24 bg-gray-100 rounded-full" />
                </div>
                <div className="h-8 w-28 bg-gray-100 rounded-xl mt-4" />
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
            <p className="text-sm font-semibold text-gray-400">No jobs yet</p>
            <p className="text-xs text-gray-400">Your assigned jobs will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => {
              const sc = statusConfig[job.status] || { label: job.status, classes: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400', hint: '' };
              const isExpanded = expandedJob === job.id;
              const jobNotes = notes[job.id] || [];

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
                          {job.scheduled_at && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(job.scheduled_at).toLocaleString()}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.technician_name
                              ? <span className="font-semibold text-gray-600">{job.technician_name}</span>
                              : <span className="italic text-gray-400">Not assigned yet</span>}
                          </span>
                        </div>

                        {/* Status hint */}
                        <p className="text-[11px] text-gray-400 italic mt-2">{sc.hint}</p>
                      </div>
                    </div>

                    {/* Messages toggle button */}
                    <button
                      onClick={() => fetchNotes(job.id)}
                      className={`relative inline-flex items-center gap-2 mt-4 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer ${isExpanded
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

                  {/* Expandable messages panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-5 sm:px-6 py-5">
                      <div className="flex items-center gap-2 mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Conversation
                        </h4>
                        <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live · every 2s
                        </span>
                      </div>

                      {/* Messages */}
                      <div ref={messagesContainerRef} className="space-y-2.5 mb-4 max-h-64 overflow-y-auto pr-1">
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
                            const isTech = msg.added_by === job.technician_name;
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col max-w-[80%] ${isTech ? 'items-start' : 'items-end ml-auto'}`}
                              >
                                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isTech
                                    ? 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
                                    : 'bg-[#1a3a2a] text-emerald-50 rounded-tr-sm'
                                  }`}>
                                  <span className={`text-[11px] font-semibold block mb-0.5 ${isTech ? 'text-gray-400' : 'text-emerald-300'}`}>
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
                      {job.technician_name ? (
                        <div className="flex gap-2 mt-2">
                          <input
                            value={newMessage[job.id] || ''}
                            onChange={(e) => setNewMessage(prev => ({ ...prev, [job.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(job.id)}
                            placeholder="Reply to technician..."
                            className="flex-1 border border-gray-200 rounded-xl px-2 py-2 text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                          />
                          <button
                            onClick={() => handleSendMessage(job.id)}
                            className="inline-flex items-center gap-1.5 bg-[#1a3a2a] hover:bg-[#224d38] text-white text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Send
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-amber-400 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-amber-600 font-medium">
                            Messaging available once a technician is assigned
                          </p>
                        </div>
                      )}
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

export default ClientJobs;