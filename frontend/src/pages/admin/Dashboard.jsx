import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // fetchStats ko component level par define karo
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

  // har 5 seconds mein refresh karo (dashboard me data frequently badal sakta hai)
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { label: 'Total Jobs', key: 'total', color: 'bg-blue-500' },
    { label: 'Pending', key: 'pending', color: 'bg-yellow-500' },
    { label: 'Assigned', key: 'assigned', color: 'bg-purple-500' },
    { label: 'In Progress', key: 'in_progress', color: 'bg-orange-500' },
    { label: 'Completed', key: 'completed', color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="sm:text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/jobs/create')}
              className="bg-blue-600 text-white sm:px-4 sm:py-2 px-2 py-2 rounded sm:text-sm hover:bg-blue-700 cursor-pointer text-[12px]"
            >
              + Create Job
            </button>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="bg-gray-700 text-white sm:px-4 sm:py-2 px-2 py-2 rounded sm:text-sm hover:bg-gray-800 cursor-pointer text-[12px]"
            >
              Manage Jobs
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-purple-600 text-white sm:px-4 sm:py-2 px-2 py-2 rounded sm:text-sm hover:bg-purple-700 cursor-pointer text-[12px]"
            >
              Manage Users
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading stats...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map(card => (
              <div key={card.key} className={`${card.color} text-white rounded-lg p-5 shadow`}>
                <p className="text-3xl font-bold">{stats?.[card.key] ?? 0}</p>
                <p className="text-sm mt-1 opacity-90">{card.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;