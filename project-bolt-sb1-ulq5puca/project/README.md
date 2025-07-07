# JVoice AI by Jaideep - Free Text-to-Speech Generator

A professional, unlimited text-to-speech generator with realistic AI voices in English and Hindi. Created by Jaideep and built with React, TypeScript, and Tailwind CSS.

## 🌐 Live Demo

**Access the app instantly:** [https://venerable-florentine-15354d.netlify.app/](https://venerable-florentine-15354d.netlify.app/)

## ✨ Features

- **Unlimited Text Length** - No word or character limits
- **Multiple Realistic Voices** - Professional male and female voices
- **Bilingual Support** - English and Hindi languages
- **Advanced Controls** - Speed, pitch, and volume adjustment
- **Free Forever** - No registration or payment required
- **Production Ready** - Professional design and functionality
- **Cross-Platform** - Works on desktop, tablet, and mobile
- **Offline Capable** - Uses browser's built-in speech synthesis

## 🎯 Voice Options

### English Voices
- **Alex** - Professional American Male
- **Emma** - Clear American Female
- **Oliver** - British Male
- **Charlotte** - British Female
- **William** - Australian Male
- **Sophie** - Australian Female

### Hindi Voices
- **Raj** - Hindi Male Voice
- **Priya** - Hindi Female Voice

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jaideep/jvoice-ai.git
   cd jvoice-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or with yarn:
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   or with yarn:
   ```bash
   yarn dev
   ```

4. **Open in browser**
   - The app will automatically open at `http://localhost:5173`
   - If it doesn't open automatically, navigate to the URL manually

5. **Build for production**
   ```bash
   npm run build
   ```
   - Built files will be in the `dist` folder

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting
npm run lint
```

## 🌐 Deployment Guide

### Option 1: Hugging Face Spaces (Recommended for AI/ML Community)

1. **Create Hugging Face Account**
   - Go to [huggingface.co](https://huggingface.co) and sign up

2. **Create a New Space**
   - Click "Create new" → "Space"
   - Name: `jvoice-ai` (or your preferred name)
   - License: `MIT`
   - Space SDK: `Static`
   - Visibility: `Public`

3. **Upload Files**
   ```bash
   # Build the project first
   npm run build
   
   # Upload the contents of the 'dist' folder to your Space
   # You can drag and drop files or use git
   ```

4. **Using Git (Advanced)**
   ```bash
   # Clone your space repository
   git clone https://huggingface.co/spaces/YOUR_USERNAME/jvoice-ai
   cd jvoice-ai
   
   # Copy built files
   cp -r ../jvoice-ai/dist/* .
   
   # Commit and push
   git add .
   git commit -m "Deploy JVoice AI"
   git push
   ```

5. **Access Your App**
   - Your app will be live at: `https://huggingface.co/spaces/YOUR_USERNAME/jvoice-ai`

### Option 2: Netlify (Easiest Deployment)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Drag & Drop**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to the deploy area
   - Get instant live URL

3. **Deploy via Git (Recommended)**
   - Connect your GitHub repository to Netlify
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Auto-deploy on every push

4. **Custom Domain (Optional)**
   - Add your custom domain in Netlify settings
   - SSL certificate is automatically provided

### Option 3: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   # In your project directory
   vercel
   
   # Follow the prompts
   # Build command: npm run build
   # Output directory: dist
   ```

3. **Access Your App**
   - Get instant live URL from Vercel
   - Automatic deployments on git push

### Option 4: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**
   - Go to repository settings
   - Enable Pages from `gh-pages` branch
   - Access at: `https://YOUR_USERNAME.github.io/jvoice-ai`

## 🔧 Technology Stack

### Frontend Framework
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Lucide React** - Beautiful, customizable SVG icons
- **Custom CSS** - Additional styling for sliders and animations

### Speech Technology
- **Web Speech API** - Browser-native text-to-speech synthesis
- **SpeechSynthesisUtterance** - Controls speech parameters
- **Cross-browser compatibility** - Works on Chrome, Firefox, Safari, Edge

### Development Tools
- **ESLint** - Code linting and quality checks
- **PostCSS** - CSS processing with Autoprefixer
- **TypeScript ESLint** - TypeScript-specific linting rules

## 🎨 Design & Architecture

### Design Principles
- **Apple-level aesthetics** - Clean, sophisticated, and intuitive
- **Responsive design** - Mobile-first approach with breakpoints
- **Accessibility** - WCAG compliant with proper ARIA labels
- **Performance** - Optimized loading and smooth interactions

### Component Architecture
```
src/
├── App.tsx          # Main application component
├── main.tsx         # React app entry point
├── index.css        # Global styles and Tailwind imports
└── vite-env.d.ts    # TypeScript environment definitions
```

### Key Features Implementation
- **Voice Management** - Dynamic voice loading with fallbacks
- **State Management** - React hooks for local state
- **Error Handling** - Comprehensive error messages and recovery
- **Performance** - Optimized re-renders and voice caching

## 📱 Browser Compatibility

### Supported Browsers
- ✅ **Chrome** 33+ (Full support)
- ✅ **Firefox** 49+ (Full support)
- ✅ **Safari** 7+ (Full support)
- ✅ **Edge** 14+ (Full support)
- ✅ **Mobile browsers** (iOS Safari, Chrome Mobile)

### Required Permissions
- **Microphone** - Not required (output only)
- **Audio** - Browser audio permissions
- **JavaScript** - Must be enabled

## 🔒 Privacy & Security

### Data Protection
- **No data collection** - All processing happens locally
- **No server communication** - Pure client-side application
- **No tracking** - No analytics or user monitoring
- **No registration** - Immediate access without accounts

### Security Features
- **HTTPS ready** - Secure deployment compatible
- **CSP compatible** - Content Security Policy friendly
- **XSS protection** - React's built-in XSS prevention
- **No external dependencies** - Minimal attack surface

## 🎯 Usage Guide

### Basic Usage
1. **Enter text** - Type or paste unlimited text
2. **Select voice** - Choose from English/Hindi voices
3. **Adjust settings** - Speed, pitch, volume (optional)
4. **Generate** - Click "Generate Voice" to hear speech
5. **Control playback** - Stop/start as needed

### Advanced Features
- **Sample texts** - Quick insertion of demo content
- **Voice comparison** - Switch between voices easily
- **Real-time controls** - Adjust parameters during playback
- **Copy/Clear** - Text management utilities

### Troubleshooting
- **No voices loading** - Refresh page, check browser compatibility
- **No audio** - Check system volume, browser audio permissions
- **Slow loading** - Wait for voice initialization, try different browser

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- **TypeScript** - Strict type checking enabled
- **ESLint** - Follow configured linting rules
- **Prettier** - Code formatting (if configured)
- **Conventional Commits** - Use semantic commit messages

## 📄 License

This project is open source and available under the **MIT License**.

```
MIT License

Copyright (c) 2024 Jaideep

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🎯 Roadmap

### Upcoming Features
- [ ] **More languages** - Spanish, French, German, Japanese
- [ ] **Voice cloning** - Custom voice training capabilities
- [ ] **Audio export** - Download as MP3, WAV, OGG
- [ ] **Batch processing** - Multiple text files at once
- [ ] **API integration** - Google Cloud TTS, Amazon Polly
- [ ] **Voice effects** - Echo, reverb, speed variations
- [ ] **SSML support** - Advanced speech markup
- [ ] **Pronunciation editor** - Custom word pronunciations

### Technical Improvements
- [ ] **PWA support** - Offline functionality
- [ ] **WebAssembly** - Faster processing
- [ ] **Web Workers** - Background processing
- [ ] **IndexedDB** - Local voice caching
- [ ] **WebRTC** - Real-time voice streaming

## 💡 Support & Contact

### Getting Help
- **Issues** - Report bugs on GitHub Issues
- **Discussions** - Community support on GitHub Discussions
- **Documentation** - This README and inline code comments

### Creator
**Jaideep** - Full Stack Developer & AI Enthusiast
- **GitHub** - [github.com/jaideep](https://github.com/jaideep)
- **Email** - Contact via GitHub profile

### Acknowledgments
- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For beautiful icons
- **Web Speech API** - For browser-native TTS capabilities

---

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/jaideep/jvoice-ai.git
cd jvoice-ai
npm install
npm run dev

# Build and deploy
npm run build
# Upload 'dist' folder to your hosting platform
```

**JVoice AI by Jaideep** - Professional Text-to-Speech Generator | Unlimited • Free • No Limits

---

*Created with ❤️ by Jaideep | Production Ready | Open Source*