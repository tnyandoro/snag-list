import React, { useState, useEffect } from 'react';
import { useITSM } from '@/context/ITSMContext';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Bell,
  Shield,
  Palette,
  Mail,
  Clock,
  Globe,
  Save,
  Check,
  Loader2,
} from 'lucide-react';

export default function Settings() {
  const { currentUser, addNotification } = useITSM();
  const { updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    // Profile
    name: currentUser.name,
    email: currentUser.email,
    department: currentUser.department,
    phone: '',
    timezone: 'America/New_York',

    // Notifications
    emailNotifications: true,
    ticketAssigned: true,
    ticketUpdated: true,
    ticketResolved: true,
    slaWarning: true,
    dailyDigest: false,

    // Appearance
    theme: 'light',
    compactMode: false,
    showAvatars: true,

    // SLA Settings (admin only)
    criticalSLA: 4,
    highSLA: 8,
    mediumSLA: 24,
    lowSLA: 72,
  });

  // Update settings when currentUser changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      name: currentUser.name,
      email: currentUser.email,
      department: currentUser.department,
    }));
  }, [currentUser]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Update profile via auth context
    const result = await updateProfile({
      name: settings.name,
      department: settings.department,
      phone: settings.phone,
      timezone: settings.timezone,
    });

    setIsSaving(false);

    if (result.success) {
      setSaved(true);
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your preferences have been updated successfully.',
      });
      setTimeout(() => setSaved(false), 2000);
    } else {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: result.error || 'Failed to save settings.',
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'sla', label: 'SLA Settings', icon: Clock },
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {currentUser.avatar}
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                        Change Avatar
                      </button>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={settings.department}
                        onChange={(e) => setSettings({ ...settings, department: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">GMT/UTC</option>
                    </select>
                  </div>

                  {/* Account info */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Account Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">User ID</span>
                        <span className="font-mono text-gray-700">{currentUser.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Role</span>
                        <span className="text-gray-700 capitalize">{currentUser.role.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Notify me when:</h3>
                    {[
                      { key: 'ticketAssigned', label: 'A ticket is assigned to me' },
                      { key: 'ticketUpdated', label: 'A ticket I\'m watching is updated' },
                      { key: 'ticketResolved', label: 'My ticket is resolved' },
                      { key: 'slaWarning', label: 'SLA is about to breach' },
                      { key: 'dailyDigest', label: 'Daily digest summary' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key as keyof typeof settings] as boolean}
                          onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                    <div className="flex gap-4">
                      {['light', 'dark', 'system'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setSettings({ ...settings, theme })}
                          className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                            settings.theme === theme
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-full h-12 rounded mb-2 ${
                            theme === 'light' ? 'bg-white border border-gray-200' :
                            theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-white to-gray-800'
                          }`} />
                          <span className="text-sm font-medium capitalize">{theme}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Compact Mode</p>
                      <p className="text-sm text-gray-500">Show more content with less spacing</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, compactMode: !settings.compactMode })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.compactMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.compactMode ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Show Avatars</p>
                      <p className="text-sm text-gray-500">Display user avatars in lists</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, showAvatars: !settings.showAvatars })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.showAvatars ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        settings.showAvatars ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sla' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">SLA Configuration</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Configure response and resolution time targets for each priority level.
                </p>
                <div className="space-y-4">
                  {[
                    { key: 'criticalSLA', label: 'Critical', color: 'bg-red-500' },
                    { key: 'highSLA', label: 'High', color: 'bg-orange-500' },
                    { key: 'mediumSLA', label: 'Medium', color: 'bg-blue-500' },
                    { key: 'lowSLA', label: 'Low', color: 'bg-green-500' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <label className="w-24 text-sm font-medium text-gray-700">{item.label}</label>
                      <input
                        type="number"
                        value={settings[item.key as keyof typeof settings] as number}
                        onChange={(e) => setSettings({ ...settings, [item.key]: parseInt(e.target.value) || 0 })}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-center"
                      />
                      <span className="text-sm text-gray-500">hours</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  saved
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
