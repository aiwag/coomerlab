import exposeContexts from "./helpers/ipc/context-exposer";
import { contextBridge, shell, ipcRenderer } from "electron";

exposeContexts();

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url: string) => shell.openExternal(url),
});

// Expose a secure API to the renderer process and webviews.
// This is the modern, secure way to handle IPC in Electron.
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    // A one-way channel from renderer to main.
    send: (channel: string, ...args: any[]) => {
      ipcRenderer.send(channel, ...args);
    },
    // A channel to send messages from the webview to its host renderer process.
    sendToHost: (channel: string, ...args: any[]) => {
      ipcRenderer.sendToHost(channel, ...args);
    },
    // A two-way channel from renderer to main.
    invoke: (channel: string, ...args: any[]) => {
      return ipcRenderer.invoke(channel, ...args);
    },
    // A channel from main to renderer.
    on: (channel: string, func: (...args: any[]) => void) => {
      const subscription = (
        _event: Electron.IpcRendererEvent,
        ...args: any[]
      ) => func(...args);
      ipcRenderer.on(channel, subscription);
      // Return a cleanup function
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    // A one-time channel from main to renderer.
    once: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
