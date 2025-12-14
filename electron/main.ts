import { app, BrowserWindow, Menu, dialog } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

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
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.reload();
            }
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
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
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
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

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Focus the window
    if (isDev) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // In production, load from built files
    mainWindow.loadFile(join(__dirname, '..', 'dist', 'index.html'));
  }

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
  createMenu();
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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
