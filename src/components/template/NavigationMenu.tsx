import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ToggleTheme from "../ToggleTheme";
import LangToggle from "../LangToggle";
import InitialIcons from "@/components/template/InitialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, 
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
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { to: "/", label: "chaturbate viewer", icon: <Home size={16} /> },
  { to: "/chaturbate", label: "chaturbate rooms", icon: <Home size={16} /> },
  { to: "/wallheaven", label: "wallheaven", icon: <Home size={16} /> },
  { to: "/coomerKemono", label: "coomerKemono", icon: <MessageSquare size={16} /> },
  { to: "/nsfwer", label: "nsfwer", icon: <Shield size={16} /> },
  { to: "/myfreecams", label: "myfreecams", icon: <Shield size={16} /> },
  { to: "/pornhub", label: "pornhub", icon: <Home size={16} /> },
  { to: "/pixiv", label: "pixiv", icon: <MessageSquare size={16} /> },
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);

  // Get current route name
  const getCurrentRouteName = () => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(item => item.to === currentPath);
    return currentItem ? t(currentItem.label) : "home";
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
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
                    Coomer<span className="font-medium">Labs</span>
                    <span className="text-xs text-gray-400 ml-2">/ {getCurrentRouteName()}</span>
                  </h1>
                </div>
              </motion.div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1">
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
                      className="absolute right-0 mt-1 w-72"
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden">
                        <div className="p-3">
                          <div className="grid grid-cols-2 gap-1">
                            {menuItems.map((item, index) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsDropdownOpen(false)}
                                className="group flex items-center space-x-2 px-2 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                              >
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-gradient-to-br from-purple-600/20 to-pink-600/20 group-hover:from-purple-600/30 group-hover:to-pink-600/30 transition-all">
                                  {item.icon}
                                </div>
                                <span className="text-xs font-medium capitalize">{t(item.label)}</span>
                              </Link>
                            ))}
                          </div>
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
                              className="group flex items-center justify-between px-2 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
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
        </div>
      </div>
    </nav>
  );
}