import exposeContexts from "./helpers/ipc/context-exposer";
import { contextBridge, shell } from 'electron';

exposeContexts();

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url: string) => shell.openExternal(url)
});