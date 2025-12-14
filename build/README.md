# Build Assets

This directory contains build assets for electron-builder.

## Icons

Place your application icons here:

- **macOS**: `icon.icns` (512x512 or larger, multi-resolution)
- **Windows**: `icon.ico` (256x256 or larger, multi-resolution)
- **Linux**: `icon.png` (512x512 or larger)

### Creating Icons

#### macOS (.icns)
1. Create a 1024x1024 PNG image
2. Use a tool like [iconutil](https://developer.apple.com/library/archive/documentation/GraphicsAnimation/Conceptual/HighResolutionOSX/Optimizing/Optimizing.html) or online converters
3. Save as `icon.icns`

#### Windows (.ico)
1. Create a 256x256 PNG image
2. Use a tool like [ImageMagick](https://imagemagick.org/) or online converters
3. Save as `icon.ico` with multiple sizes (16x16, 32x32, 48x48, 256x256)

#### Linux (.png)
1. Create a 512x512 PNG image
2. Save as `icon.png`

### Online Icon Generators
- [CloudConvert](https://cloudconvert.com/) - Convert between icon formats
- [IconKitchen](https://icon.kitchen/) - Generate icons from images
- [Electron Icon Maker](https://www.electron.build/icons) - Electron-specific tools

### Temporary Placeholders

If you don't have icons yet, electron-builder will use default Electron icons. You can add proper icons later and rebuild.
