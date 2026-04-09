import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FiBell, FiLock, FiMonitor, FiSave, FiSettings, FiShield, FiUser } from 'react-icons/fi';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SETTINGS_STORAGE_KEY = 'smartCampusSettings';

const Settings = () => {
  const { user, loadUser, isAdmin, isTechnician } = useAuth();
  const [profileName, setProfileName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    ticketAlerts: true,
    bookingAlerts: true,
    compactMode: false,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    setProfileName(user?.name || '');
  }, [user]);

  // Load preferences from backend on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await authAPI.getPreferences();
        if (res.data.data) {
          setPreferences({
            emailAlerts: res.data.data.emailAlerts ?? true,
            ticketAlerts: res.data.data.ticketAlerts ?? true,
            bookingAlerts: res.data.data.bookingAlerts ?? true,
            compactMode: res.data.data.compactMode ?? false,
          });
        }
      } catch (err) {
        // Fall back to localStorage if API fails
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          setPreferences((prev) => ({ ...prev, ...parsed }));
        } catch {
          // ignore invalid local settings payload
        }
      }
    };
    loadPreferences();
  }, []);

  // Persist preferences to localStorage (backup)
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const roleLabel = useMemo(() => (user?.roles || []).join(', ') || 'USER', [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setSavingProfile(true);
      await authAPI.updateMe({ name: profileName.trim() });
      await loadUser();
      toast.success('Account profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      await authAPI.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = async () => {
    try {
      setSavingPreferences(true);
      await authAPI.updatePreferences(preferences);
      toast.success('Preferences saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiSettings className="text-blue-600" />
          Account Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your profile, security, and personal preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <FiUser className="text-blue-600" />
              Profile
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  value={user?.email || ''}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
              >
                <FiSave />
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <FiLock className="text-orange-600" />
              Security
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 text-white px-4 py-2 hover:bg-orange-700 disabled:opacity-60"
              >
                <FiShield />
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <FiBell className="text-green-600" />
              Notification Preferences
            </h2>
            <div className="space-y-3">
              {[
                { key: 'emailAlerts', label: 'Email alert summaries' },
                { key: 'ticketAlerts', label: 'Ticket status reminders' },
                { key: 'bookingAlerts', label: 'Booking updates' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={preferences[item.key]}
                    onChange={() => togglePreference(item.key)}
                    className="h-4 w-4"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Display Settings</h3>
              <label className="flex items-center justify-between border rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700">Compact dashboard mode</span>
                <input
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={() => togglePreference('compactMode')}
                  className="h-4 w-4"
                />
              </label>
            </div>
            <button
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-60"
            >
              <FiSave />
              {savingPreferences ? 'Saving...' : 'Save Preferences'}
            </button>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold">Account Snapshot</h3>
            <p className="text-sm mt-3 opacity-90">{user?.name}</p>
            <p className="text-xs opacity-80">{user?.email}</p>
            <p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs">{roleLabel}</p>
          </section>

          {(isAdmin() || isTechnician()) && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiMonitor className="text-indigo-600" />
                Admin Panel Shortcuts
              </h3>
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                {isAdmin() && <p>- Manage users, roles, bookings and tickets.</p>}
                {isTechnician() && <p>- Track assigned tickets and update statuses.</p>}
                <p>- Security best practice: rotate passwords regularly.</p>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Settings;
