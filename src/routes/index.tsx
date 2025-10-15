import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import InitialIcons from "@/components/template/InitialIcons";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MessageSquare,
  Shield,
  Grid3x3,
  User,
  Users,
  Settings,
  LogOut,
  UserCircle,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Menu,
  X,
  Activity,
  BarChart3,
  Folder,
  Calendar,
  Bell,
  Search,
  Wifi,
  Battery,
  Volume2,
  Monitor,
  Clock,
  Download,
  Image,
  Video,
  Heart,
  Bookmark,
  Archive,
  Globe,
  Star,
  Terminal,
  FileText,
  Zap,
  Trash2,
  FolderOpen,
  Cloud,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Power,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  History
} from 'lucide-react';

const menuItems = [
  { to: "/", label: "dashboard", icon: <Home size={24} />, color: "from-blue-500 to-blue-600" },
  { to: "/chaturbate", label: "chaturbate rooms", icon: <Video size={24} />, color: "from-pink-500 to-pink-600" },
  { to: "/wallheaven", label: "wallheaven", icon: <Image size={24} />, color: "from-purple-500 to-purple-600" },
  { to: "/coomerKemono", label: "coomerKemono", icon: <Users size={24} />, color: "from-green-500 to-green-600" },
  { to: "/nsfwer", label: "nsfwer", icon: <Shield size={24} />, color: "from-red-500 to-red-600" },
  { to: "/myfreecams", label: "myfreecams", icon: <Video size={24} />, color: "from-orange-500 to-orange-600" },
  { to: "/pornhub", label: "pornhub", icon: <Video size={24} />, color: "from-orange-600 to-orange-700" },
  { to: "/pixiv", label: "pixiv", icon: <Image size={24} />, color: "from-indigo-500 to-indigo-600" },
  { to: "/downloads", label: "downloads", icon: <Download size={24} />, color: "from-cyan-500 to-cyan-600" },
  { to: "/favorites", label: "favorites", icon: <Heart size={24} />, color: "from-red-500 to-pink-500" },
  { to: "/bookmarks", label: "bookmarks", icon: <Bookmark size={24} />, color: "from-yellow-500 to-yellow-600" },
  { to: "/activity", label: "activity", icon: <Activity size={24} />, color: "from-teal-500 to-teal-600" },
];

const accountMenuItems = [
  { to: "/profile", label: "profile", icon: <UserCircle size={16} /> },
  { to: "/settings", label: "settings", icon: <Settings size={16} /> },
  { to: "/billing", label: "billing", icon: <CreditCard size={16} /> },
  { to: "/help", label: "help", icon: <HelpCircle size={16} /> },
];

const dockItems = [
  { id: "dashboard", icon: <Home size={24} />, label: "Dashboard", active: true },
  { id: "chaturbate", icon: <Video size={24} />, label: "Chaturbate" },
  { id: "wallheaven", icon: <Image size={24} />, label: "Wallheaven" },
  { id: "downloads", icon: <Download size={24} />, label: "Downloads" },
  { id: "folder", icon: <FolderOpen size={24} />, label: "Files" },
  { id: "terminal", icon: <Terminal size={24} />, label: "Terminal" },
  { id: "browser", icon: <Globe size={24} />, label: "Browser" },
  { id: "music", icon: <Music size={24} />, label: "Music" },
  { id: "settings", icon: <Settings size={24} />, label: "Settings" },
  { id: "trash", icon: <Trash2 size={24} />, label: "Trash" },
];

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedApp, setSelectedApp] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [wifiConnected, setWifiConnected] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [navigationHistory, setNavigationHistory] = useState(['/']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const accountDropdownRef = useRef(null);
  const startMenuRef = useRef(null);
  const historyMenuRef = useRef(null);

  // Get current route name
  const getCurrentRouteName = () => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(item => item.to === currentPath);
    return currentItem ? t(currentItem.label) : "desktop";
  };

  // Update navigation history
  useEffect(() => {
    const currentPath = location.pathname;
    if (navigationHistory[historyIndex] !== currentPath) {
      const newHistory = [...navigationHistory.slice(0, historyIndex + 1), currentPath];
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [location.pathname]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Alt + Left Arrow: Go back
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        handleGoBack();
      }
      // Alt + Right Arrow: Go forward
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        handleGoForward();
      }
      // Alt + Home: Go to dashboard
      if (event.altKey && event.key === 'Home') {
        event.preventDefault();
        navigate({ to: '/' });
      }
      // Ctrl + R: Refresh current page
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        window.location.reload();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, navigationHistory]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
      if (startMenuRef.current && !startMenuRef.current.contains(event.target)) {
        setIsStartMenuOpen(false);
      }
      if (historyMenuRef.current && !historyMenuRef.current.contains(event.target)) {
        setIsHistoryMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigation functions
  const handleGoBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      navigate({ to: navigationHistory[newIndex] });
    }
  };

  const handleGoForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      navigate({ to: navigationHistory[newIndex] });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleHistoryItemClick = (path, index) => {
    setHistoryIndex(index);
    navigate({ to: path });
    setIsHistoryMenuOpen(false);
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get dock item by route
  const getDockItemByRoute = () => {
    const currentPath = location.pathname;
    return dockItems.find(item => item.id === currentPath.substring(1)) || dockItems[0];
  };

  // Update dock items with active state
  const updatedDockItems = dockItems.map(item => ({
    ...item,
    active: item.id === location.pathname.substring(1) || (item.id === "dashboard" && location.pathname === "/")
  }));

  // Get unique history items for display
  const getUniqueHistory = () => {
    const seen = new Set();
    return navigationHistory.filter((path, index) => {
      if (seen.has(path)) return false;
      seen.add(path);
      return true;
    }).reverse().slice(0, 10);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* Desktop Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-black/30 backdrop-blur-md border-b border-white/10 z-20">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-4">
              {/* Navigation Controls */}
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoBack}
                  disabled={historyIndex <= 0}
                  className={`p-1.5 rounded transition-all ${
                    historyIndex > 0 
                      ? "text-white hover:bg-white/10" 
                      : "text-gray-600 cursor-not-allowed"
                  }`}
                  title="Go Back (Alt + Left Arrow)"
                >
                  <ArrowLeft size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoForward}
                  disabled={historyIndex >= navigationHistory.length - 1}
                  className={`p-1.5 rounded transition-all ${
                    historyIndex < navigationHistory.length - 1 
                      ? "text-white hover:bg-white/10" 
                      : "text-gray-600 cursor-not-allowed"
                  }`}
                  title="Go Forward (Alt + Right Arrow)"
                >
                  <ArrowRight size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  className="p-1.5 rounded text-white hover:bg-white/10 transition-all"
                  title="Refresh (Ctrl + R)"
                >
                  <RotateCcw size={18} />
                </motion.button>
                <div className="w-px h-6 bg-white/20 mx-1"></div>
              </div>

              {/* Start Menu Button */}
              <div ref={startMenuRef} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                >
                  <Grid3x3 size={18} />
                  <span className="text-sm font-medium">Start</span>
                </motion.button>

                {/* Start Menu */}
                <AnimatePresence>
                  {isStartMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-96 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden"
                      onMouseEnter={() => setIsStartMenuOpen(true)}
                      onMouseLeave={() => setIsStartMenuOpen(false)}
                    >
                      <div className="p-4">
                        <div className="mb-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <InitialIcons />
                            <div>
                              <h3 className="text-lg font-medium">CoomerLabs</h3>
                              <p className="text-xs text-gray-400">Content Management System</p>
                            </div>
                          </div>
                          <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center space-x-2">
                            <Search size={16} className="text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search apps, files, and settings..."
                              className="bg-transparent text-sm text-white placeholder-gray-400 outline-none w-full"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {menuItems.slice(0, 9).map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setIsStartMenuOpen(false)}
                              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-all"
                            >
                              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-2`}>
                                {item.icon}
                              </div>
                              <span className="text-xs text-center truncate w-full">{t(item.label)}</span>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="grid grid-cols-2 gap-2">
                            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all text-left">
                              <Power size={16} />
                              <span className="text-sm">Shut Down</span>
                            </button>
                            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all text-left">
                              <LogOut size={16} />
                              <span className="text-sm">Log Out</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* History Menu */}
              <div ref={historyMenuRef} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsHistoryMenuOpen(!isHistoryMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all"
                  title="Navigation History"
                >
                  <History size={18} />
                </motion.button>

                {/* History Dropdown */}
                <AnimatePresence>
                  {isHistoryMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden"
                      onMouseEnter={() => setIsHistoryMenuOpen(true)}
                      onMouseLeave={() => setIsHistoryMenuOpen(false)}
                    >
                      <div className="p-3">
                        <h3 className="text-sm font-medium mb-3">Recent History</h3>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {getUniqueHistory().map((path, reverseIndex) => {
                            const actualIndex = navigationHistory.length - 1 - reverseIndex;
                            const isActive = actualIndex === historyIndex;
                            const menuItem = menuItems.find(item => item.to === path);
                            const label = menuItem ? t(menuItem.label) : path === '/' ? 'dashboard' : path;
                            
                            return (
                              <button
                                key={path}
                                onClick={() => handleHistoryItemClick(path, actualIndex)}
                                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-sm transition-all ${
                                  isActive 
                                    ? "bg-purple-600/20 text-purple-400" 
                                    : "text-gray-300 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                <History size={14} />
                                <span className="text-xs font-medium capitalize truncate">{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Window Title */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                  {getDockItemByRoute().icon}
                </div>
                <h2 className="text-sm font-medium capitalize">{getCurrentRouteName()}</h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:flex items-center bg-white/10 rounded-lg px-3 py-1.5 w-64">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm text-white placeholder-gray-400 outline-none w-full"
                />
              </div>

              {/* System Tray */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setWifiConnected(!wifiConnected)}
                  className={`p-1.5 rounded ${wifiConnected ? 'text-white' : 'text-gray-500'} hover:bg-white/10 transition-all`}
                >
                  <Wifi size={16} />
                </button>
                <div className="flex items-center space-x-1">
                  <Battery size={16} />
                  <span className="text-xs">{batteryLevel}%</span>
                </div>
                <button className="p-1.5 rounded text-white hover:bg-white/10 transition-all">
                  <Volume2 size={16} />
                </button>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span className="text-sm">{formatTime(currentTime)}</span>
                </div>
              </div>

              {/* Account Dropdown */}
              <div
                ref={accountDropdownRef}
                className="relative"
                onMouseEnter={() => setIsAccountDropdownOpen(true)}
                onMouseLeave={() => setIsAccountDropdownOpen(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <User size={18} />
                </motion.button>

                <AnimatePresence>
                  {isAccountDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1 w-48"
                      onMouseEnter={() => setIsAccountDropdownOpen(true)}
                      onMouseLeave={() => setIsAccountDropdownOpen(false)}
                    >
                      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden">
                        <div className="p-2">
                          {accountMenuItems.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setIsAccountDropdownOpen(false)}
                              className="group flex items-center justify-between px-2 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <div className="flex items-center space-x-2">
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-gradient-to-br from-purple-600/20 to-pink-600/20 group-hover:from-purple-600/30 group-hover:to-pink-600/30 transition-all">
                                  {item.icon}
                                </div>
                                <span className="text-xs font-medium capitalize">{t(item.label)}</span>
                              </div>
                              <ChevronRight size={14} className="text-gray-500" />
                            </Link>
                          ))}
                          <div className="my-1 border-t border-white/10"></div>
                          <button
                            className="group flex items-center space-x-2 w-full px-2 py-1.5 rounded text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                          >
                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-red-500/20 group-hover:bg-red-500/30 transition-all">
                              <LogOut size={16} />
                            </div>
                            <span className="text-xs font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Area */}
        <main className="flex-1 relative overflow-hidden">
          {location.pathname === "/" ? (
            <div className="absolute inset-0 p-6">
              {/* Desktop Shortcuts */}
              <div className="grid grid-cols-8 gap-4 max-w-6xl">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-all group"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-all`}
                    >
                      {item.icon}
                    </motion.div>
                    <span className="text-xs text-center truncate w-full">{t(item.label)}</span>
                  </Link>
                ))}
              </div>

              {/* Desktop Widgets */}
              <div className="absolute bottom-24 left-6 right-6 flex justify-between">
                {/* Clock Widget */}
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4 w-48">
                  <div className="text-center">
                    <div className="text-3xl font-light mb-1">{formatTime(currentTime)}</div>
                    <div className="text-sm text-gray-400">{formatDate(currentTime)}</div>
                  </div>
                </div>

                {/* System Stats Widget */}
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4 w-64">
                  <h3 className="text-sm font-medium mb-3">System Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">CPU Usage</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full w-3/5 bg-gradient-to-r from-green-500 to-green-400"></div>
                        </div>
                        <span className="text-xs">60%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Memory</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full w-2/5 bg-gradient-to-r from-blue-500 to-blue-400"></div>
                        </div>
                        <span className="text-xs">40%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Storage</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full w-4/5 bg-gradient-to-r from-purple-500 to-purple-400"></div>
                        </div>
                        <span className="text-xs">80%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation History Widget */}
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4 w-64">
                  <h3 className="text-sm font-medium mb-3">Navigation History</h3>
                  <div className="space-y-2 max-h-20 overflow-y-auto">
                    {getUniqueHistory().slice(0, 3).map((path) => {
                      const menuItem = menuItems.find(item => item.to === path);
                      const label = menuItem ? t(menuItem.label) : path === '/' ? 'dashboard' : path;
                      
                      return (
                        <div key={path} className="flex items-center space-x-2 text-xs">
                          <History size={12} className="text-gray-400" />
                          <span className="text-gray-300 truncate">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>

        {/* Dock */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2 flex items-center space-x-1 shadow-2xl">
            {updatedDockItems.map((item) => (
              <Link
                key={item.id}
                to={item.id === "dashboard" ? "/" : `/${item.id}`}
                className="relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.2, y: -5 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    item.active 
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" 
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {item.icon}
                </motion.div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </div>
                {item.active && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
            
            {/* Separator */}
            <div className="w-px h-8 bg-white/20 mx-1"></div>
            
            {/* Music Player */}
            <div className="flex items-center space-x-1 px-2">
              <button className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                <SkipBack size={16} />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                <SkipForward size={16} />
              </button>
            </div>
            
            {/* Volume Control */}
            <div className="flex items-center space-x-1 px-2">
              <Volume2 size={16} className="text-gray-300" />
              <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${volume}%` }}
                ></div>
              </div>
            </div>
            
            {/* Trash */}
            <motion.div
              whileHover={{ scale: 1.1, y: -3 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
            >
              <Trash2 size={20} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}