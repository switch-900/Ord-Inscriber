# Gallery Assets for Umbrel App Store

This directory contains the required assets for Umbrel App Store submission.

## Required Files

### App Icon (✅ Complete)
- **File**: `icon.svg`
- **Requirements**: SVG format, clean design, works at small sizes
- **Current**: Custom Bitcoin Ordinals themed icon

### Screenshots (⚠️ TODO)
The Umbrel App Store requires 3 screenshots demonstrating app functionality:

#### 1. `1.jpg` - Main Interface
- **Size**: 1200x800px recommended
- **Content**: Show the main inscription interface with file upload area
- **Focus**: Highlight the clean, user-friendly design

#### 2. `2.jpg` - Active Inscription Process  
- **Size**: 1200x800px recommended
- **Content**: Show an inscription in progress with progress bars/status
- **Focus**: Demonstrate real-time updates and fee estimation

#### 3. `3.jpg` - Wallet/Management View
- **Size**: 1200x800px recommended  
- **Content**: Show wallet balance, inscription history, or management features
- **Focus**: Highlight Bitcoin integration and transaction tracking

## Screenshot Guidelines

### Technical Requirements
- **Format**: JPG or PNG
- **Size**: 1200x800px (or similar 3:2 aspect ratio)
- **Quality**: High resolution, clear text
- **File Size**: Under 2MB per image

### Content Guidelines
- Show actual app functionality (not mockups)
- Include realistic data/content
- Ensure text is readable at smaller sizes
- Use consistent browser/environment
- Avoid personal information in screenshots

### Tips for Good Screenshots
1. **Use a clean browser**: No bookmarks bar, clean tabs
2. **Consistent window size**: Same browser dimensions for all shots
3. **Good lighting**: If showing mobile, use good lighting
4. **Representative content**: Show real features, not empty states
5. **Professional appearance**: Clean, polished interface

## How to Take Screenshots

1. **Start the application**:
   ```bash
   npm start
   # OR
   docker run -p 3333:3333 ordinals-inscriber
   ```

2. **Navigate to**: `http://localhost:3333`

3. **Take screenshots** of:
   - Main interface with upload ready
   - Inscription process in action  
   - Management/wallet features

4. **Save as**:
   - `gallery/1.jpg`
   - `gallery/2.jpg` 
   - `gallery/3.jpg`

## Current Status
- ✅ `icon.svg` - Complete and ready
- ⚠️ `1.jpg` - Need to capture main interface
- ⚠️ `2.jpg` - Need to capture inscription process
- ⚠️ `3.jpg` - Need to capture management features

Once screenshots are added, the app will be ready for Umbrel App Store submission!
