import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, CreditCard, HelpCircle, UserCircle, Github } from 'lucide-react';
import { Separator } from '../ui/separator';

const accountMenuItems = [
  { to: "/profile", label: "Profile", icon: <UserCircle size={16} /> },
  { to: "/settings", label: "Settings", icon: <Settings size={16} /> },
  { to: "/billing", label: "Billing", icon: <CreditCard size={16} /> },
];

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 transition-colors hover:text-white"
        title="Account"
      >
        <User size={18} />
      </motion.button>
       <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-60 rounded-lg border border-white/10 bg-black/50 backdrop-blur-xl p-2"
            >
                <div className="p-2">
                    <p className="font-semibold text-white">Guest User</p>
                    <p className="text-xs text-gray-400">guest@coomer.labs</p>
                </div>
                <Separator className="my-1 bg-white/10" />
                {accountMenuItems.map(item => (
                    <Link key={item.to} to={item.to} className="flex w-full items-center gap-2 p-2 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white" onClick={() => setIsOpen(false)}>
                        {item.icon} {item.label}
                    </Link>
                ))}
                <Separator className="my-1 bg-white/10" />
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex w-full items-center gap-2 p-2 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white">
                    <Github size={16} /> Source Code
                </a>
                <a href="/help" className="flex w-full items-center gap-2 p-2 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white">
                    <HelpCircle size={16} /> Help
                </a>
                <Separator className="my-1 bg-white/10" />
                 <button className="flex w-full items-center gap-2 p-2 rounded-md text-sm text-red-400 hover:bg-red-500/20">
                    <LogOut size={16}/> Logout
                </button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}