# Building Desktop Applications

This guide explains how to create distributable desktop applications from the Robot Ops Console.

## Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the React app and Electron:**
   ```bash
   npm run electron:build
   ```
   This compiles the React app and Electron TypeScript files.

## Building Distributable Packages

### Quick Start

Build for your current platform:
```bash
npm run electron:dist
```

The built application will be in the `release/` directory.

### Platform-Specific Builds

#### macOS
```bash
npm run electron:dist:mac
```

Creates:
- `.dmg` file (disk image for distribution)
- `.zip` file (for direct distribution)

**Note:** On macOS, you may see a warning about the app being from an unidentified developer. To fix this:
1. Right-click the app → Open
2. Or use code signing (see below)

#### Windows
```bash
npm run electron:dist:win
```

Creates:
- `.exe` installer (NSIS installer)
- `.exe` portable version (no installation needed)

#### Linux
```bash
npm run electron:dist:linux
```

Creates:
- `.AppImage` (portable application)
- `.deb` (Debian/Ubuntu package)

### Testing Build (Unpacked)

To test the build without creating an installer:
```bash
npm run electron:pack
```

This creates an unpacked application in `release/` that you can run directly.

## Application Icons

Icons are located in the `build/` directory:

- **macOS**: `build/icon.icns`
- **Windows**: `build/icon.ico`
- **Linux**: `build/icon.png`

If icons are missing, electron-builder will use default Electron icons. See `build/README.md` for instructions on creating icons.

## Code Signing (Optional)

For distribution, you may want to code sign your application:

### macOS
1. Get an Apple Developer certificate
2. Add to `package.json`:
   ```json
   "build": {
     "mac": {
       "identity": "Developer ID Application: Your Name (TEAM_ID)"
     }
   }
   ```

### Windows
1. Get a code signing certificate
2. Add to `package.json`:
   ```json
   "build": {
     "win": {
       "certificateFile": "path/to/certificate.pfx",
       "certificatePassword": "password"
     }
   }
   ```

See [electron-builder code signing documentation](https://www.electron.build/code-signing) for details.

## Build Configuration

Build configuration is in `package.json` under the `"build"` key. Key settings:

- **appId**: Unique identifier for your app
- **productName**: Display name of the application
- **directories.output**: Where built apps are placed (default: `release/`)
- **files**: Which files to include in the package

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Check that `npm run electron:build` succeeds first
- Verify Node.js version (v18+ recommended)

### App Won't Start
- Check that `dist/` and `dist-electron/` directories exist
- Verify the main process file is at `dist-electron/main.js`
- Check console for error messages

### Icons Not Showing
- Ensure icon files are in the `build/` directory
- Verify icon file formats (.icns, .ico, .png)
- Rebuild after adding icons

### Large File Size
- Electron apps are typically 100-200MB
- This is normal due to Chromium + Node.js bundling
- Consider using [electron-builder compression](https://www.electron.build/configuration/configuration) options

## Distribution

### macOS
- **DMG**: Best for distribution, users can drag app to Applications
- **ZIP**: Simpler, but users need to extract first

### Windows
- **NSIS Installer**: Standard Windows installer experience
- **Portable**: No installation, just run the .exe

### Linux
- **AppImage**: Works on most Linux distributions
- **DEB**: For Debian/Ubuntu-based systems

## Next Steps

1. Test the built application thoroughly
2. Add proper application icons
3. Set up code signing for distribution
4. Consider auto-updater for future updates
5. Create release notes for users

For more information, see the [electron-builder documentation](https://www.electron.build/).
