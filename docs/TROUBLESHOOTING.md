# Troubleshooting

## App Won't Start on macOS

If the Electron app doesn't fully start on macOS, try these steps:

### 1. Enable DevTools to See Errors

Temporarily enable DevTools in production to see console errors:

1. Open `electron/main.ts`
2. Find the line: `// mainWindow?.webContents.openDevTools();`
3. Uncomment it (remove the `//`)
4. Rebuild: `npm run electron:build && npm run electron:dist:mac`
5. Run the app and check the Console tab in DevTools

### 2. Check Console Logs

The app logs important information to the console. Look for:
- File path errors
- Missing file errors
- Network errors
- JavaScript errors

### 3. Verify Build Files

Ensure all required files are built:

```bash
# Check that these directories exist after building
ls -la dist/           # Should contain index.html and assets
ls -la dist-electron/  # Should contain main.js and preload.js
```

### 4. Test with Unpacked Build

Test with an unpacked build first:

```bash
npm run electron:pack
```

Then run the app from `release/mac/Robot Ops Console.app`

### 5. Check File Paths

The app should load from:
- Main process: `dist-electron/main.js`
- Preload: `dist-electron/preload.js`
- Renderer: `dist/index.html`

In a packaged app, these should be at:
- `app.asar/dist-electron/main.js`
- `app.asar/dist-electron/preload.js`
- `app.asar/dist/index.html`

### 6. Common Issues

#### "Failed to load page"
- **Cause**: Incorrect file path or missing files
- **Fix**: Verify `dist/` and `dist-electron/` exist after build

#### "Cannot find module"
- **Cause**: Missing dependencies in packaged app
- **Fix**: Ensure all dependencies are in `package.json` dependencies (not just devDependencies)

#### Blank white screen
- **Cause**: JavaScript errors or missing assets
- **Fix**: Enable DevTools (step 1) and check console for errors

#### App crashes immediately
- **Cause**: Error in main process
- **Fix**: Check terminal/console where you launched the app for errors

### 7. macOS-Specific Issues

#### "App is damaged and can't be opened"
- **Cause**: macOS Gatekeeper blocking unsigned app
- **Fix**: 
  ```bash
  xattr -cr "Robot Ops Console.app"
  ```
  Or: Right-click → Open (first time only)

#### App doesn't appear in Applications
- **Cause**: App might be in DMG, not installed
- **Fix**: Drag the app from DMG to Applications folder

### 8. Rebuild from Scratch

If nothing works, try a clean rebuild:

```bash
# Clean build artifacts
rm -rf dist dist-electron release node_modules

# Reinstall dependencies
npm install

# Rebuild
npm run electron:build
npm run electron:dist:mac
```

### 9. Check Error Logs

Error logs are written to:
- Console: Check terminal where you ran the app
- File (production): `~/Library/Application Support/Robot Ops Console/error.log`

### 10. Get Help

If the issue persists:
1. Enable DevTools (step 1)
2. Take a screenshot of the console errors
3. Check the error log file
4. Note your macOS version and Node.js version
5. Share the error messages for help

## Development vs Production

### Development Mode
- Loads from `http://localhost:5173`
- DevTools enabled by default
- More verbose error messages

### Production Mode
- Loads from `file://` protocol
- DevTools disabled by default
- Errors logged to file

If it works in dev but not production, the issue is likely:
- File path resolution
- Missing files in build
- Asset loading issues (base path)

## Quick Debug Checklist

- [ ] App builds without errors (`npm run electron:build`)
- [ ] `dist/` directory exists and has `index.html`
- [ ] `dist-electron/` directory exists and has `main.js` and `preload.js`
- [ ] DevTools enabled to see console errors
- [ ] Checked error log file
- [ ] Tried unpacked build (`npm run electron:pack`)
- [ ] Verified file paths in console logs
