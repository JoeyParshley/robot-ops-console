import { contextBridge } from 'electron';

// Expose protected methods that allow the renderer process to use
// the APIs in a secure way. This is the recommended approach for
// Electron apps with context isolation enabled.

// Example: If you need to expose APIs to the renderer process, do it here
// contextBridge.exposeInMainWorld('electronAPI', {
//   // your APIs here
// });

// For now, we don't need to expose any APIs since the React app
// works independently. This file is required for context isolation.
