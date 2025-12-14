import { app, BrowserWindow, Menu, dialog, session } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

// Error logging
interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

function logError(error: Error | string, context?: Record<string, unknown>) {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'object' && error.stack ? error.stack : undefined,
    context,
  };

  // Log to console
  console.error('[Electron Error]', errorLog);

  // Optionally log to file (for production diagnostics)
  if (!isDev) {
    try {
      const logPath = join(app.getPath('userData'), 'error.log');
      const logEntry = JSON.stringify(errorLog) + '\n';
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch (logError) {
      console.error('Failed to write error log:', logError);
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(error, { type: 'uncaughtException' });
  
  // Show user-friendly error dialog
  if (mainWindow && !mainWindow.isDestroyed()) {
    dialog.showErrorBox(
      'Application Error',
      'An unexpected error occurred. The application may need to restart.\n\n' +
      'Error details have been logged. If this problem persists, please contact support.'
    );
  }
  
  // In production, we might want to restart the app
  // For now, just log and continue
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logError(error, { type: 'unhandledRejection' });
});

// Window state management
interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized?: boolean;
  isFullScreen?: boolean;
}

function getWindowStatePath(): string {
  const userDataPath = app.getPath('userData');
  return join(userDataPath, 'window-state.json');
}

function loadWindowState(): WindowState {
  const statePath = getWindowStatePath();
  const defaultState: WindowState = {
    width: 1920,
    height: 1080,
  };

  try {
    if (existsSync(statePath)) {
      const data = readFileSync(statePath, 'utf-8');
      return { ...defaultState, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Failed to load window state:', error);
  }

  return defaultState;
}

function saveWindowState(window: BrowserWindow) {
  try {
    const bounds = window.getBounds();
    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: window.isMaximized(),
      isFullScreen: window.isFullScreen(),
    };

    const statePath = getWindowStatePath();
    const stateDir = dirname(statePath);
    
    if (!existsSync(stateDir)) {
      mkdirSync(stateDir, { recursive: true });
    }

    writeFileSync(statePath, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Failed to save window state:', error);
  }
}

// Get app version from package.json
function getAppVersion(): string {
  try {
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    return packageJson.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

// Create application menu
function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', label: 'Undo' },
        { role: 'redo', label: 'Redo' },
        { type: 'separator' },
        { role: 'cut', label: 'Cut' },
        { role: 'copy', label: 'Copy' },
        { role: 'paste', label: 'Paste' },
        { role: 'selectAll', label: 'Select All' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          },
        },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Fullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize', label: 'Minimize' },
        { role: 'close', label: 'Close' },
        ...(process.platform === 'darwin'
          ? [
              { type: 'separator' as const },
              { role: 'front' as const, label: 'Bring All to Front' },
            ]
          : []),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Robot Ops Console',
          click: () => {
            showAboutDialog();
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'About Robot Ops Console' },
        { type: 'separator' },
        { role: 'services', label: 'Services' },
        { type: 'separator' },
        { role: 'hide', label: 'Hide Robot Ops Console' },
        { role: 'hideOthers', label: 'Hide Others' },
        { role: 'unhide', label: 'Show All' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Cmd+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    });
  }

  // In production, remove or disable developer tools menu item
  if (!isDev) {
    const viewMenu = template.find((item) => item.label === 'View');
    if (viewMenu && 'submenu' in viewMenu && Array.isArray(viewMenu.submenu)) {
      const submenu = viewMenu.submenu as Electron.MenuItemConstructorOptions[];
      const devToolsIndex = submenu.findIndex(
        (item) => item.label === 'Toggle Developer Tools'
      );
      if (devToolsIndex !== -1) {
        submenu.splice(devToolsIndex, 1);
      }
    }
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Show About dialog
function showAboutDialog() {
  const version = getAppVersion();
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'About Robot Ops Console',
    message: 'Robot Ops Console',
    detail: `Version ${version}\n\nA React + TypeScript proof-of-concept exploring UI patterns for robotics operator dashboards.`,
    buttons: ['OK'],
  });
}

/**
 * Configure security settings for the Electron application.
 * 
 * Security measures implemented:
 * - Content Security Policy (CSP) to prevent XSS attacks
 * - Block external navigation to prevent phishing/redirect attacks
 * - Certificate validation for secure connections
 * 
 * See: https://www.electronjs.org/docs/latest/tutorial/security
 */
function configureSecurity() {
  // Set Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:* data: blob:;"
            : "default-src 'self' 'unsafe-inline' data: blob:; connect-src 'self' ws://localhost:*;",
        ],
      },
    });
  });

  // Block navigation to external URLs (prevent XSS)
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ['http://*/*', 'https://*/*'] },
    (details, callback) => {
      // Allow localhost in development
      if (isDev && details.url.includes('localhost')) {
        callback({});
        return;
      }
      
      // Block all external navigation in production
      if (!details.url.startsWith('file://') && !details.url.includes('localhost')) {
        logError(new Error(`Blocked navigation to external URL: ${details.url}`), {
          type: 'blockedNavigation',
        });
        callback({ cancel: true });
        return;
      }
      
      callback({});
    }
  );
}

function createWindow() {
  // Load window state
  const windowState = loadWindowState();

  const preloadPath = join(__dirname, 'preload.js');

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 1280,
    minHeight: 720,
    title: 'Robot Ops Console',
    webPreferences: {
      // ✅ SECURITY: Disable node integration in renderer process
      // Prevents renderer from accessing Node.js APIs directly
      nodeIntegration: false,
      
      // ✅ SECURITY: Enable context isolation
      // Isolates preload script from web content, preventing XSS attacks
      contextIsolation: true,
      
      // ✅ SECURITY: Use preload script for secure IPC
      // Only way to safely expose APIs to renderer process
      preload: preloadPath,
      
      // ✅ SECURITY: Keep web security enabled
      // Prevents bypassing same-origin policy
      webSecurity: true,
    },
    backgroundColor: '#121212', // Dark theme background
    show: false, // Don't show until ready
  });

  // Restore maximized or fullscreen state
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }
  if (windowState.isFullScreen) {
    mainWindow.setFullScreen(true);
  }

  // Save window state on move/resize
  let saveStateTimeout: NodeJS.Timeout;
  const scheduleSaveState = () => {
    clearTimeout(saveStateTimeout);
    saveStateTimeout = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        saveWindowState(mainWindow);
      }
    }, 500); // Debounce saves
  };

  mainWindow.on('moved', scheduleSaveState);
  mainWindow.on('resized', scheduleSaveState);
  mainWindow.on('maximize', scheduleSaveState);
  mainWindow.on('unmaximize', scheduleSaveState);
  mainWindow.on('enter-full-screen', scheduleSaveState);
  mainWindow.on('leave-full-screen', scheduleSaveState);

  // Handle renderer process errors
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    logError(new Error(`Render process crashed: ${details.reason}`), {
      type: 'renderProcessGone',
      reason: details.reason,
      exitCode: details.exitCode,
    });

    dialog.showErrorBox(
      'Application Error',
      'The application window has crashed. Please restart the application.\n\n' +
      `Reason: ${details.reason || 'Unknown'}`
    );
  });

  // Handle failed page loads
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    logError(new Error(`Failed to load page: ${errorDescription}`), {
      type: 'pageLoadFailed',
      errorCode,
      errorDescription,
      url: validatedURL,
    });

    // Show user-friendly error for network issues
    if (errorCode === -106 || errorCode === -105) {
      // ERR_INTERNET_DISCONNECTED or ERR_NAME_NOT_RESOLVED
      dialog.showErrorBox(
        'Connection Error',
        'Unable to connect to the application server.\n\n' +
        'Please ensure:\n' +
        '• The development server is running (if in development mode)\n' +
        '• Your network connection is active\n' +
        '• The application files are not corrupted'
      );
    }
  });

  // Handle certificate errors (for development only)
  mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
    if (isDev && url.includes('localhost')) {
      // In development, allow self-signed certificates for localhost
      event.preventDefault();
      callback(true);
    } else {
      // In production, reject invalid certificates
      logError(new Error(`Certificate error: ${error}`), {
        type: 'certificateError',
        url,
        error,
      });
      callback(false);
    }
  });

  // ✅ SECURITY: Prevent new window creation (popups)
  // Intercept window.open() calls and block them
  mainWindow.webContents.setWindowOpenHandler(() => {
    logError(new Error('Blocked attempt to open new window'), {
      type: 'blockedWindowOpen',
    });
    return { action: 'deny' };
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Focus the window
    if (isDev) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Load the app with error handling
  const loadApp = async () => {
    try {
      if (isDev) {
        // In development, load from Vite dev server
        await mainWindow!.loadURL('http://localhost:5173');
      } else {
        // In production, load from built files
        await mainWindow!.loadFile(join(__dirname, '..', 'dist', 'index.html'));
      }
    } catch (error) {
      logError(error as Error, { type: 'loadAppFailed' });
      
      // Show error dialog
      dialog.showErrorBox(
        'Failed to Load Application',
        'The application could not be loaded.\n\n' +
        'Please try restarting the application. If the problem persists, ' +
        'the application may need to be reinstalled.'
      );
    }
  };

  loadApp();

  // Handle window close
  mainWindow.on('close', (event) => {
    // On macOS, closing the window doesn't quit the app
    if (process.platform === 'darwin') {
      event.preventDefault();
      mainWindow?.hide();
    }
    // On other platforms, the default behavior (quit) is fine
  });

  mainWindow.on('closed', () => {
    // Save final window state before closing
    if (mainWindow && !mainWindow.isDestroyed()) {
      saveWindowState(mainWindow);
    }
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  try {
    // Configure security settings
    configureSecurity();
    
    // Create menu and window
    createMenu();
    createWindow();
  } catch (error) {
    logError(error as Error, { type: 'appInitFailed' });
    dialog.showErrorBox(
      'Initialization Error',
      'Failed to initialize the application. Please try restarting.'
    );
    app.quit();
  }

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      try {
        createWindow();
      } catch (error) {
        logError(error as Error, { type: 'windowCreationFailed' });
      }
    } else {
      // Show existing window if it exists
      mainWindow?.show();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app certificate errors globally
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev && url.includes('localhost')) {
    // In development, allow self-signed certificates for localhost
    event.preventDefault();
    callback(true);
  } else {
    // In production, reject invalid certificates
    logError(new Error(`Global certificate error: ${error}`), {
      type: 'globalCertificateError',
      url,
      error,
    });
    callback(false);
  }
});
