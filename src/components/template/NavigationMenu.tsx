import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import InitialIcons from "@/components/template/InitialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Camera, Video, Image, Users, Download, Heart, Bookmark, Activity, Menu, X, Search } from "lucide-react";
import { GlobalSearch } from "@/components/template/GlobalSearch";
import { NotificationPanel } from "@/components/template/NotificationPanel";
import { AccountDropdown } from "@/components/template/AccountDropdown";

const menuItems = [
  { to: "/", label: "home", icon: <Home size={18} /> },
  { to: "/camviewer", label: "camviewer", icon: <Camera size={18} /> },
  { to: "/redgifs", label: "redgifs", icon: <Video size={18} /> },
  { to: "/wallheaven", label: "wallheaven", icon: <Image size={18} /> },
  { to: "/coomerKemono", label: "coomerKemono", icon: <Users size={18} /> },
  { to: "/downloads", label: "downloads", icon: <Download size={18} /> },
  { to: "/favorites", label: "favorites", icon: <Heart size={18} /> },
  { to: "/bookmarks", label: "bookmarks", icon: <Bookmark size={18} /> },
  { to: "/activity", label: "activity", icon: <Activity size={18} /> },
];

export default function NavigationMenu() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const getCurrentRouteName = () => {
    const currentItem = menuItems.find((item) => item.to === location.pathname);
    return currentItem ? t(currentItem.label) : "Home";
  };

  const isMenuItemActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="relative z-50">
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-full px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <InitialIcons />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-light tracking-wide text-white">
                    <span className="font-medium">Coomer</span>Labs
                    <span className="ml-2 text-xs text-gray-400">/ {getCurrentRouteName()}</span>
                  </h1>
                </div>
              </Link>
            </div>

            {/* Navigation Icons - Desktop */}
            <div className="hidden items-center space-x-1 lg:flex">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center justify-center rounded-lg p-2.5 transition-all ${isMenuItemActive(item.to) ? "bg-purple-600/20 text-purple-400" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                  title={t(item.label)}
                >
                  {item.icon}
                </Link>
              ))}
            </div>

            {/* Center Section - Global Search Component */}
            <GlobalSearch />

            {/* Right Section */}
            <div className="flex items-center space-x-1">
              <NotificationPanel />
              <AccountDropdown />
              <div className="lg:hidden">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400">
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
            className="border-b border-white/10 bg-black/90 backdrop-blur-xl lg:hidden"
          >
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {menuItems.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className={`group flex flex-col items-center justify-center space-y-1 rounded-lg p-3 text-sm transition-all ${isMenuItemActive(item.to) ? "bg-purple-600/20 text-purple-400" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 transition-all group-hover:bg-white/10">{item.icon}</div>
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