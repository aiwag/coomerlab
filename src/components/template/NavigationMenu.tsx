import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import InitialIcons from "@/components/template/InitialIcons";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Grid3x3,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Image,
  Video,
  Users,
  Zap,
  FileText,
  Database,
  Camera,
  Download,
  Heart,
  Bookmark,
  Activity,
  Settings,
  HelpCircle,
  CreditCard,
  UserCircle,
} from "lucide-react";

const menuItems = [
  { to: "/", label: "home", icon: <Home size={18} /> },
  { to: "/camviewer", label: "camviewer", icon: <Camera size={18} /> },
  { to: "/chaturbate", label: "chaturbate", icon: <Video size={18} /> },
  { to: "/wallheaven", label: "wallheaven", icon: <Image size={18} /> },
  { to: "/coomerKemono", label: "coomerKemono", icon: <Users size={18} /> },
  { to: "/downloads", label: "downloads", icon: <Download size={18} /> },
  { to: "/favorites", label: "favorites", icon: <Heart size={18} /> },
  { to: "/bookmarks", label: "bookmarks", icon: <Bookmark size={18} /> },
  { to: "/activity", label: "activity", icon: <Activity size={18} /> },
];

const accountMenuItems = [
  { to: "/profile", label: "profile", icon: <UserCircle size={16} /> },
  { to: "/settings", label: "settings", icon: <Settings size={16} /> },
  { to: "/billing", label: "billing", icon: <CreditCard size={16} /> },
  { to: "/help", label: "help", icon: <HelpCircle size={16} /> },
];

export default function NavigationMenu() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const accountDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Get current route name
  const getCurrentRouteName = () => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find((item) => item.to === currentPath);
    return currentItem ? t(currentItem.label) : "home";
  };

  // Check if a menu item is active
  const isMenuItemActive = (path) => {
    return location.pathname === path;
  };

  // Filter menu items based on search query
  const filteredMenuItems = menuItems.filter((item) =>
    t(item.label).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target)
      ) {
        setIsAccountDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
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
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-full px-4">
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
                    <Link to="/" className="font-medium">
                      Coomer
                    </Link>
                    <span className="font-medium">Labs</span>
                    <span className="ml-2 text-xs text-gray-400">
                      / {getCurrentRouteName()}
                    </span>
                  </h1>
                </div>
              </motion.div>
            </div>

            {/* Navigation Items - Desktop */}
            <div className="hidden items-center space-x-1 lg:flex">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center justify-center rounded-lg p-2 transition-all ${
                    isMenuItemActive(item.to)
                      ? "bg-purple-600/20 text-purple-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                  title={t(item.label)}
                >
                  {item.icon}
                  <span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                    {t(item.label)}
                  </span>
                </Link>
              ))}
            </div>

            {/* Center Section - Search Bar */}
            <div className="mx-4 hidden max-w-xs flex-1 md:flex lg:max-w-md">
              <div
                className={`relative w-full transition-all ${isSearchFocused ? "max-w-md" : ""}`}
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 p-2 pl-10 text-sm text-white placeholder-gray-400 focus:border-transparent focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="Search..."
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
                  className="relative p-2 text-gray-400 transition-colors hover:text-white"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </motion.button>
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
                  className="p-2 text-gray-400 transition-colors hover:text-white"
                  title="Account"
                >
                  <User size={18} />
                </motion.button>
              </div>

              {/* Mobile Menu Toggle */}
              <div className="lg:hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-gray-400 transition-colors hover:text-white"
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
            className="border-b border-white/10 bg-black/90 backdrop-blur-xl lg:hidden"
          >
            <div className="px-4 py-3">
              <div className="relative mb-4">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 p-2 pl-10 text-sm text-white placeholder-gray-400 focus:border-transparent focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="Search..."
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {filteredMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex flex-col items-center justify-center space-y-1 rounded-lg p-3 text-sm transition-all ${
                      isMenuItemActive(item.to)
                        ? "bg-purple-600/20 text-purple-400"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 transition-all group-hover:from-purple-600/30 group-hover:to-pink-600/30">
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium capitalize">
                      {t(item.label)}
                    </span>
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
