import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ToggleTheme from "../ToggleTheme";
import LangToggle from "../LangToggle";
import InitialIcons from "@/components/template/InitialIcons";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MessageSquare,
  Shield,
  Grid3x3,
  User,
  Settings,
  LogOut,
  UserCircle,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  Download,
  Image,
  Video,
  Users,
  Heart,
  Bookmark,
  Activity,
  Zap,
  Globe,
  Star,
  FileText,
  Archive,
  Cloud,
  Database
} from 'lucide-react';

const menuItems = [
  { to: "/home", label: "home", icon: <Home size={16} /> },
  { to: "/chaturbate", label: "chaturbate rooms", icon: <Video size={16} /> },
  { to: "/wallheaven", label: "wallheaven", icon: <Image size={16} /> },
  { to: "/coomerKemono", label: "coomerKemono", icon: <Users size={16} /> },
  { to: "/nsfwer", label: "nsfwer", icon: <Shield size={16} /> },
  { to: "/myfreecams", label: "myfreecams", icon: <Video size={16} /> },
  { to: "/pornhub", label: "pornhub", icon: <Video size={16} /> },
  { to: "/pixiv", label: "pixiv", icon: <Image size={16} /> },
  { to: "/downloads", label: "downloads", icon: <Download size={16} /> },
  { to: "/favorites", label: "favorites", icon: <Heart size={16} /> },
  { to: "/bookmarks", label: "bookmarks", icon: <Bookmark size={16} /> },
  { to: "/activity", label: "activity", icon: <Activity size={16} /> },
];

const accountMenuItems = [
  { to: "/profile", label: "profile", icon: <UserCircle size={16} /> },
  { to: "/settings", label: "settings", icon: <Settings size={16} /> },
  { to: "/billing", label: "billing", icon: <CreditCard size={16} /> },
  { to: "/help", label: "help", icon: <HelpCircle size={16} /> },
];

const categoryItems = [
  { name: "content", icon: <FileText size={14} />, items: ["chaturbate", "wallheaven", "coomerKemono", "nsfwer", "myfreecams", "pornhub", "pixiv"] },
  { name: "personal", icon: <User size={14} />, items: ["downloads", "favorites", "bookmarks", "activity"] },
  { name: "tools", icon: <Zap size={14} />, items: ["converter", "scheduler", "automation"] },
  { name: "resources", icon: <Database size={14} />, items: ["database", "cloud storage", "archives"] },
];

export default function NavigationMenu() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);
  const dropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Get current route name
  const getCurrentRouteName = () => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(item => item.to === currentPath);
    return currentItem ? t(currentItem.label) : "dashboard";
  };

  // Check if a menu item is active
  const isMenuItemActive = (path) => {
    return location.pathname === path;
  };

  // Filter menu items based on search query
  const filteredMenuItems = menuItems.filter(item =>
    t(item.label).toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="relative z-50">
      <div className="backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <InitialIcons />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-light tracking-wide text-white">
                    <Link to="/" className="font-medium">Coomer</Link><span className="font-medium">Labs</span>
                    <Link to={getCurrentRouteName()} className="text-xs text-gray-400 ml-2">/ {getCurrentRouteName()}</Link>
                  </h1>
                </div>
              </motion.div>
            </div>

            {/* Center Section - Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full p-2 pl-10 text-sm text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Search for content, tools, or settings..."
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1">
              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors relative"
                >
                  <Bell size={18} />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </motion.button>
              </div>

              {/* Products Menu */}
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <Grid3x3 size={18} />
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1 w-80"
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden">
                        <div className="p-3">
                          {searchQuery ? (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-400 mb-2">Search Results</p>
                              {filteredMenuItems.length > 0 ? (
                                filteredMenuItems.map((item) => (
                                  <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className={`group flex items-center space-x-2 px-2 py-1.5 rounded text-sm transition-all ${isMenuItemActive(item.to)
                                        ? "text-white bg-purple-600/20"
                                        : "text-gray-300 hover:text-white hover:bg-white/5"
                                      }`}
                                  >
                                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-gradient-to-br from-purple-600/20 to-pink-600/20 group-hover:from-purple-600/30 group-hover:to-pink-600/30 transition-all">
                                      {item.icon}
                                    </div>
                                    <span className="text-xs font-medium capitalize">{t(item.label)}</span>
                                  </Link>
                                ))
                              ) : (
                                <p className="text-xs text-gray-400 p-2">No results found</p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {categoryItems.map((category) => (
                                <div key={category.name}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    {category.icon}
                                    <p className="text-xs text-gray-400 capitalize">{category.name}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1">
                                    {menuItems
                                      .filter(item => category.items.includes(item.label))
                                      .map((item) => (
                                        <Link
                                          key={item.to}
                                          to={item.to}
                                          onClick={() => setIsDropdownOpen(false)}
                                          className={`group flex items-center space-x-2 px-2 py-1.5 rounded text-sm transition-all ${isMenuItemActive(item.to)
                                              ? "text-white bg-purple-600/20"
                                              : "text-gray-300 hover:text-white hover:bg-white/5"
                                            }`}
                                        >
                                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-gradient-to-br from-purple-600/20 to-pink-600/20 group-hover:from-purple-600/30 group-hover:to-pink-600/30 transition-all">
                                            {item.icon}
                                          </div>
                                          <span className="text-xs font-medium capitalize">{t(item.label)}</span>
                                        </Link>
                                      ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                              className={`group flex items-center justify-between px-2 py-1.5 rounded text-sm transition-all ${isMenuItemActive(item.to)
                                  ? "text-white bg-purple-600/20"
                                  : "text-gray-300 hover:text-white hover:bg-white/5"
                                }`}
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

              {/* Mobile Menu Toggle */}
              <div className="md:hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 py-3">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full p-2 pl-10 text-sm text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Search..."
                />
              </div>
              <div className="space-y-1">
                {filteredMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center space-x-2 px-2 py-2 rounded text-sm transition-all ${isMenuItemActive(item.to)
                        ? "text-white bg-purple-600/20"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-gradient-to-br from-purple-600/20 to-pink-600/20 group-hover:from-purple-600/30 group-hover:to-pink-600/30 transition-all">
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium capitalize">{t(item.label)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}