# Gallery Images for Umbrel App Store

This directory should contain the following images for the Umbrel Community Apps submission:

## Required Images:

1. **icon.svg** - App icon (SVG format, square aspect ratio)
2. **gallery-1.jpg** - Main interface screenshot (1200x800px recommended)
3. **gallery-2.jpg** - File upload interface (1200x800px recommended) 
4. **gallery-3.jpg** - Inscription progress view (1200x800px recommended)

## Image Guidelines:

- **Icon**: Clean, recognizable symbol representing ordinals/inscriptions
- **Screenshots**: Show the actual app interface with realistic data
- **Format**: JPG for screenshots, SVG for icon
- **Quality**: High resolution, clear text, good contrast
- **Content**: Demonstrate key features like file upload, fee estimation, progress tracking

## Creating Screenshots:

1. Run the app locally with `npm start`
2. Open http://localhost:3333 in browser
3. Use developer tools to set viewport to 1200x800
4. Take screenshots of:
   - Home page with upload area
   - File selected with fee estimation
   - Inscription in progress with status updates

## Icon Suggestions:

- Bitcoin symbol with inscription overlay
- Stylized "O" for Ordinals
- Document/file with Bitcoin symbol
- Minimalist geometric design representing data inscription

Place all images in this directory and they will be referenced in the umbrel-app.yml manifest.
