import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiBell, FiMenu, FiX, FiLogOut, FiHome, FiGrid, FiCalendar, FiAlertCircle, FiUsers, FiChevronDown, FiTrash2, FiSettings } from 'react-icons/fi';

const NOTIFICATION_CHANGE_EVENT = 'notifications:changed';

const Navbar = () => {
  const { user, logout, deleteAccount, isAdmin, isTechnician } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationAPI.getUnreadCount();
        setUnreadCount(res.data.data?.count ?? 0);
      } catch (err) {
        // ignore
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    const handleNotificationChange = () => {
      fetchUnread();
    };

    window.addEventListener(NOTIFICATION_CHANGE_EVENT, handleNotificationChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener(NOTIFICATION_CHANGE_EVENT, handleNotificationChange);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteAccount();
      setProfileMenuOpen(false);
      toast.success('Account deleted successfully');
      navigate('/register');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: <FiHome /> },
    { to: '/resources', label: 'Resources', icon: <FiGrid /> },
    { to: '/bookings', label: 'Bookings', icon: <FiCalendar /> },
    { to: '/tickets', label: 'Tickets', icon: <FiAlertCircle /> },
  ];

  const adminLinks = [
    { to: '/bookings/manage', label: 'Manage Bookings' },
    { to: '/tickets/manage', label: 'Manage Tickets' },
    { to: '/admin/users', label: 'Manage Users' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="text-lg font-bold text-gray-800 hidden sm:block">Smart Campus</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(link.to) ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            {(isAdmin() || isTechnician()) && (
              <div className="relative group">
                <button className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
                  <span>Admin</span>
                  <FiChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 bg-white rounded-md shadow-lg py-1 w-48 hidden group-hover:block">
                  {isAdmin() && adminLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-4 py-2 text-sm ${isActive(link.to) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isTechnician() && !isAdmin() && (
                    <Link
                      to="/tickets/manage"
                      className={`block px-4 py-2 text-sm ${isActive('/tickets/manage') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Assigned Tickets
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg py-1 w-56">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600 mt-1">{user?.roles?.join(', ')}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiSettings />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <FiTrash2 />
                    <span>Delete My Account</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                  ${isActive(link.to) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            {isAdmin() && adminLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                  ${isActive(link.to) ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              >
                <FiUsers />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
