import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

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
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setShowMobileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = async () => {
        setShowDropdown(prev => !prev);
        if (!showDropdown) {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    /* Avatar initials helper */
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : 'U';

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-8 py-0 flex justify-between items-center h-16 sticky top-0 z-40">

            {/* ── Logo ── */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                <div className="w-8 h-8 rounded-lg bg-[#1a3a2a] flex items-center justify-center shadow-md shadow-emerald-900/20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth={2.2} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 10m0 3V7" />
                    </svg>
                </div>
                <span className="text-[1.05rem] font-bold text-[#1a3a2a] tracking-tight">FieldOps</span>
            </div>

            {/* ── Right side ── */}
            <div className="flex items-center gap-1 sm:gap-2">

                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={handleBellClick}
                        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 text-gray-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 sm:w-80 w-66 bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-800">Notifications</p>
                                {unreadCount === 0 && (
                                    <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">All read</span>
                                )}
                                {unreadCount > 0 && (
                                    <span className="text-[10px] font-semibold bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5 text-gray-300">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`px-4 py-3 flex gap-3 items-start transition-colors ${!n.is_read ? 'bg-emerald-50/60' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

                {/* Desktop User Info */}
                <div className="hidden sm:flex items-center gap-2.5">
                    <div className="text-right hidden md:block">
                        <p
                            onClick={() => navigate('/profile')}
                            className="text-sm font-semibold text-gray-800 cursor-pointer hover:text-[#1a3a2a] transition-colors leading-tight"
                        >
                            {user?.name}
                        </p>
                        <p className="text-[11px] text-gray-400 capitalize leading-tight">{user?.role}</p>
                    </div>

                    {/* Avatar */}
                    <div
                        onClick={() => navigate('/profile')}
                        className="w-8 h-8 rounded-xl bg-[#1a3a2a] text-emerald-200 text-xs font-bold flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity select-none"
                    >
                        {initials}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-all duration-150 cursor-pointer"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>

                {/* Mobile Hamburger */}
                <div className="sm:hidden relative" ref={mobileMenuRef}>
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        {showMobileMenu ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>

                    {showMobileMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 z-50 overflow-hidden">
                            {/* User info header */}
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#1a3a2a] text-emerald-200 text-xs font-bold flex items-center justify-center select-none flex-shrink-0">
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                                    <span className="text-[10px] font-semibold capitalize bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                        {user?.role}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                View Profile
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 border-t border-gray-100 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;