import React, { useState } from "react";
import Footer from "@/components/template/Footer";
import { useTranslation } from "react-i18next";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  Eye,
  Lock,
  Smartphone,
  Mail,
  Save,
  X
} from 'lucide-react';

function Settings() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('profile');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    marketing: false
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true
  });

  const settingsSections = [
    { id: 'profile', icon: <User size={20} />, label: 'Profile Settings' },
    { id: 'appearance', icon: <Palette size={20} />, label: 'Appearance' },
    { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { id: 'privacy', icon: <Shield size={20} />, label: 'Privacy & Security' },
    { id: 'language', icon: <Globe size={20} />, label: 'Language & Region' },
    { id: 'billing', icon: <CreditCard size={20} />, label: 'Billing' },
    { id: 'devices', icon: <Smartphone size={20} />, label: 'Connected Devices' },
    { id: 'help', icon: <HelpCircle size={20} />, label: 'Help & Support' },
  ];

  const renderSectionContent = () => {
    switch(activeSection) {
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="Enter your display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                  <textarea 
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                    rows={3}
                    placeholder="Tell us about yourself"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'appearance':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Theme Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    {darkMode ? <Moon size={20} className="text-purple-400" /> : <Sun size={20} className="text-yellow-400" />}
                    <div>
                      <p className="text-white font-medium">Dark Mode</p>
                      <p className="text-gray-400 text-sm">Use dark theme across the application</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Volume2 size={20} className="text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Sound Effects</p>
                      <p className="text-gray-400 text-sm">Play sounds for interactions</p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries({
                  email: { icon: <Mail size={20} />, title: 'Email Notifications', desc: 'Receive updates via email' },
                  push: { icon: <Bell size={20} />, title: 'Push Notifications', desc: 'Get instant browser notifications' },
                  sms: { icon: <Smartphone size={20} />, title: 'SMS Alerts', desc: 'Receive text messages for important updates' },
                  marketing: { icon: <Eye size={20} />, title: 'Marketing Communications', desc: 'Receive promotional content and offers' }
                }).map(([key, { icon, title, desc }]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="text-purple-400">{icon}</div>
                      <div>
                        <p className="text-white font-medium">{title}</p>
                        <p className="text-gray-400 text-sm">{desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({...notifications, [key]: !notifications[key as keyof typeof notifications]})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[key as keyof typeof notifications] ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'privacy':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Profile Visibility</label>
                  <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Eye size={20} className="text-green-400" />
                    <div>
                      <p className="text-white font-medium">Show Online Status</p>
                      <p className="text-gray-400 text-sm">Let others see when you're online</p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Lock size={20} className="text-red-400" />
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center"
          >
            <div className="text-gray-400">
              <p className="text-lg">Settings for {activeSection}</p>
              <p className="text-sm mt-2">This section is coming soon</p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex h-full flex-col min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account preferences and settings</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <nav className="space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={activeSection === section.id ? 'text-purple-400' : ''}>
                          {section.icon}
                        </span>
                        <span className="text-sm font-medium">{section.label}</span>
                      </div>
                      <ChevronRight size={16} className={activeSection === section.id ? 'text-purple-400' : ''} />
                    </button>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200">
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              {renderSectionContent()}

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 flex items-center space-x-2">
                  <X size={18} />
                  <span>Cancel</span>
                </button>
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2">
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute("/settings")({
  component: Settings,
});