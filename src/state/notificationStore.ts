import { create } from 'zustand';

export interface AppNotification {
  id: number;
  type: 'download' | 'alert' | 'favorite' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: number) => void;
  clearAll: () => void;
}

// --- Sample Notifications to Demonstrate Functionality ---
const sampleNotifications: AppNotification[] = [
    { id: 1, type: 'download', title: 'Download Complete', message: 'your_file_1.mp4 has finished downloading.', timestamp: new Date(), read: false },
    { id: 2, type: 'favorite', title: 'Favorite Online', message: 'Streamer "cutegirl" is now live!', timestamp: new Date(Date.now() - 3600000), read: false },
    { id: 3, type: 'info', title: 'App Update', message: 'Version 2.1.0 is now available.', timestamp: new Date(Date.now() - 86400000), read: true },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: sampleNotifications,
  
  addNotification: (notification) => set((state) => ({
    notifications: [
      { ...notification, id: Date.now(), timestamp: new Date(), read: false },
      ...state.notifications
    ]
  })),

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),

  clearAll: () => set((state) => ({
    notifications: state.notifications.map(n => ({...n, read: true})) // Or set to [] to delete
  })),
}));