import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';


const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Could not fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // har 30 second mein check hogi notification
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // bahar click karo tou dropdown band ho
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = async () => {
        setShowDropdown(prev => !prev);
        if (!showDropdown) {
            await api.patch('/notifications/read-all');
            // local state bhi update
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">FieldOps</h1>

            <div className="flex items-center gap-4">
                {/* notification bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={handleBellClick}
                        className="relative p-1 hover:bg-blue-500 rounded-full transition cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute sm:right-0 right--50 mt-2 sm:w-80 w-50 bg-white text-gray-800 
              rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="px-4 py-2 border-b bg-gray-50">
                                <p className="text-sm font-semibold text-gray-700">Notifications</p>
                            </div>

                            {notifications.length === 0 ? (
                                <p className="text-sm text-gray-500 px-4 py-4 text-center">
                                    No notifications yet
                                </p>
                            ) : (
                                <div className="max-h-72 overflow-y-auto divide-y">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`px-4 py-3 text-sm ${!n.is_read ? 'bg-blue-50' : 'bg-white'}`}
                                        >
                                            <p className="text-gray-700">{n.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(n.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <span className="sm:text-sm text-[10px] capitalize bg-blue-500 px-3 py-1 rounded-full">
                    {user?.role}
                </span>
                <span
                    onClick={() => navigate('/profile')}
                    className="text-[10px] sm:text-sm cursor-pointer hover:underline"
                >
                    {user?.name}
                </span>
                <button
                    onClick={handleLogout}
                    className="bg-white text-blue-600 sm:px-3 sm:py-1 px-1.5 py-1 rounded text-[10px] hover:bg-gray-100 cursor-pointer sm:text-sm"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;