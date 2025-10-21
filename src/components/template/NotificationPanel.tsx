import React, { useState, useRef, useEffect } from 'react';
import { useNotificationStore } from '@/state/notificationStore';
import { Bell, Download, Heart, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';

const iconMap = {
  download: <Download size={16} />,
  favorite: <Heart size={16} />,
  info: <Info size={16} />,
  alert: <Info size={16} />,
};

export function NotificationPanel() {
  const { notifications, markAsRead, clearAll } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={panelRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 transition-colors hover:text-white"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-80 rounded-lg border border-white/10 bg-black/50 backdrop-blur-xl"
            >
                <div className="p-3 flex justify-between items-center border-b border-white/10">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <Button variant="link" size="sm" className="text-purple-400" onClick={clearAll}>Mark all as read</Button>
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar p-1">
                    {notifications.length === 0 && <p className="text-center text-sm text-gray-400 p-4">No new notifications</p>}
                    {notifications.map(n => (
                        <div key={n.id} className={`p-2 rounded-md transition-colors ${!n.read ? 'hover:bg-white/10' : ''}`} onClick={() => markAsRead(n.id)}>
                            <div className="flex gap-3">
                                <div className={`mt-1 ${n.read ? 'text-gray-500' : 'text-purple-400'}`}>{iconMap[n.type]}</div>
                                <div className="flex-grow">
                                    <p className={`font-semibold text-sm ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.title}</p>
                                    <p className={`text-xs ${n.read ? 'text-gray-500' : 'text-gray-300'}`}>{n.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(n.timestamp, { addSuffix: true })}</p>
                                </div>
                                {!n.read && <div className="w-2 h-2 rounded-full bg-purple-500 self-center flex-shrink-0" />}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}