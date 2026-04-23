import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await api.get('/jobs');
      const jobs = res.data;
      setStats({
        total: jobs.length,
        pending: jobs.filter(j => j.status === 'pending').length,
        assigned: jobs.filter(j => j.status === 'assigned').length,
        in_progress: jobs.filter(j => j.status === 'in_progress').length,
        completed: jobs.filter(j => j.status === 'completed').length,
      });
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      label: 'Total Jobs',
      key: 'total',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bg: 'bg-[#1a3a2a]',
      iconBg: 'bg-[#2d5a3d]',
      iconColor: 'text-emerald-300',
      valColor: 'text-white',
      labelColor: 'text-emerald-200/70',
      subColor: 'text-emerald-300/50',
      barBg: 'bg-emerald-900/40',
      bar: 'bg-emerald-400',
    },
    {
      label: 'Pending',
      key: 'pending',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-white',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      valColor: 'text-gray-900',
      labelColor: 'text-gray-500',
      subColor: 'text-gray-300',
      barBg: 'bg-gray-100',
      bar: 'bg-amber-400',
    },
    {
      label: 'Assigned',
      key: 'assigned',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bg: 'bg-white',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-500',
      valColor: 'text-gray-900',
      labelColor: 'text-gray-500',
      subColor: 'text-gray-300',
      barBg: 'bg-gray-100',
      bar: 'bg-violet-400',
    },
    {
      label: 'In Progress',
      key: 'in_progress',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bg: 'bg-white',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      valColor: 'text-gray-900',
      labelColor: 'text-gray-500',
      subColor: 'text-gray-300',
      barBg: 'bg-gray-100',
      bar: 'bg-orange-400',
    },
    {
      label: 'Completed',
      key: 'completed',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-white',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valColor: 'text-gray-900',
      labelColor: 'text-gray-500',
      subColor: 'text-gray-300',
      barBg: 'bg-gray-100',
      bar: 'bg-emerald-500',
    },
  ];

  const total = stats?.total || 1;

  return (
    <div className="min-h-screen bg-[#f5f6f7] font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1">
              Field Operations
            </p>
            <h2 className="text-[1.6rem] font-bold text-gray-900 tracking-tight leading-tight">
              Admin Dashboard
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Monitor and manage all your field jobs
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/admin/jobs/create')}
              className="inline-flex items-center gap-2 bg-[#1a3a2a] hover:bg-[#224d38] active:bg-[#16302200] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Job
            </button>

            <button
              onClick={() => navigate('/admin/jobs')}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Manage Jobs
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Users
            </button>
          </div>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Job Overview</p>
          <div className="flex-1 h-px bg-gray-200" />
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live · refreshes every 5s
          </span>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-gray-100 mb-5" />
                <div className="h-7 w-10 bg-gray-100 rounded-lg mb-2" />
                <div className="h-3 w-16 bg-gray-100 rounded-lg mb-4" />
                <div className="h-1.5 w-full bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card, idx) => {
              const value = stats?.[card.key] ?? 0;
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div
                  key={card.key}
                  className={`${card.bg} rounded-2xl p-5 border border-gray-100/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                    {card.icon}
                  </div>

                  {/* Value + Label */}
                  <div>
                    <p className={`text-[1.75rem] font-bold leading-none tracking-tight ${card.valColor}`}>
                      {value}
                    </p>
                    <p className={`text-[12px] font-medium mt-1 ${card.labelColor}`}>
                      {card.label}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-auto">
                    <div className={`h-1.5 w-full ${card.barBg} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full ${card.bar} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className={`text-[10px] mt-1.5 font-medium ${card.subColor}`}>
                      {pct}% of total
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary strip */}
        {!loading && stats && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-wrap gap-4 items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-2">Breakdown</p>
            {cards.map(card => {
              const value = stats?.[card.key] ?? 0;
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={card.key} className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${card.bar}`} />
                  <span className="text-xs text-gray-500 font-medium">{card.label}</span>
                  <span className="text-xs font-bold text-gray-800">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;