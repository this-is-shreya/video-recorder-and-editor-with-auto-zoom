// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getDesktopSources: (options) =>
    ipcRenderer.invoke("get-desktop-sources", options),
  resizeWindow: (width, height) =>
    ipcRenderer.invoke("resize-window", { width, height }),
  captureWebContents: () => ipcRenderer.invoke("capture-web-contents"),
  getWebContentsStream: () => ipcRenderer.invoke("get-web-contents-stream"),
  // Main IPC methods
  toggleRecording: (startTime) =>
    ipcRenderer.send("toggle-recording", startTime),
  forceStopRecording: () => ipcRenderer.send("force-stop-recording"),
  getDesktopSources: () => ipcRenderer.invoke("get-desktop-sources"),
  getAllSessions: () => ipcRenderer.invoke("get-all-sessions"),
  clearAllSessions: () => ipcRenderer.invoke("clear-all-sessions"),

  // Event listeners
  onCursorCapture: (callback) => ipcRenderer.on("cursor-capture", callback),
  onRecordingStarted: (callback) =>
    ipcRenderer.on("recording-started", callback),
  onRecordingStopped: (callback) =>
    ipcRenderer.on("recording-stopped", callback),
  onRecordingCancelled: (callback) =>
    ipcRenderer.on("recording-cancelled", callback),
  onRecordingForceStopped: (callback) =>
    ipcRenderer.on("recording-force-stopped", callback),
  // OAuth methods
  startGoogleAuth: () => ipcRenderer.invoke("start-google-auth"),
  onAuthSuccess: (callback) => ipcRenderer.on("auth-success", callback),
  onAuthError: (callback) => ipcRenderer.on("auth-error", callback),
  // Remove listeners (optional - for cleanup)
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners("cursor-capture");
    ipcRenderer.removeAllListeners("recording-started");
    ipcRenderer.removeAllListeners("recording-stopped");
    ipcRenderer.removeAllListeners("recording-cancelled");
    ipcRenderer.removeAllListeners("recording-force-stopped");
    ipcRenderer.removeAllListeners("auth-success");
  },

  // Individual remove listener methods
  removeListener: (channel, callback) =>
    ipcRenderer.removeListener(channel, callback),
});
