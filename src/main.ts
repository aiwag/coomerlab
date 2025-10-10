// main.ts
import { app, BrowserWindow, session } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import path from "path";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

// import { ElectronBlocker } from "@ghostery/adblocker-electron";
// import "@ghostery/adblocker-electron-preload";
// import fetch from "cross-fetch";
// import { promises as fs } from "fs";

const inDevelopment = process.env.NODE_ENV === "development";

// 👇 Wrap window creation in an async function to await blocker
async function createWindow() {
  // 🛡️ Initialize ad blocker
  // const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch, {
  //   path: "engine.bin",
  //   read: fs.readFile,
  //   write: fs.writeFile,
  // });
  // blocker.enableBlockingInSession(session.defaultSession);
  // blocker.on("request-blocked", (request) => {
  //   console.log("🚫 Blocked request to:", request.url);
  // });
  // console.log("✅ Ad blocker enabled.");

  // 🪟 Create main window
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      webviewTag: true,
      preload: preload,
      webSecurity: false
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    trafficLightPosition:
      process.platform === "darwin" ? { x: 5, y: 5 } : undefined,
  });

  registerListeners(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}

// 🧩 DevTools install remains the same
async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

// 👇 Modify whenReady to wait for adblock setup
app.whenReady().then(createWindow).then(installExtensions);

// macOS: quit app when all windows closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
