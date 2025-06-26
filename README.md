# Brainwave Shift

A sophisticated AI-powered cognitive monitoring and wellness platform that helps optimize mental performance through real-time behavioral analysis and personalized interventions.

![Brainwave Shift Dashboard](public/BrainwaveShift.png)

## 🧠 Overview

Brainwave Shift is a production-ready web application that monitors your cognitive state in real-time and provides intelligent wellness interventions to maintain peak mental performance. The platform analyzes browser activity, keyboard patterns, and mouse movements to assess focus levels, cognitive load, and stress indicators.

## ✨ Features

### Core Functionality
- **Real-time Cognitive Monitoring** - Continuous analysis of focus, cognitive load, and emotional state
- **Intelligent Interventions** - AI-powered wellness recommendations based on your current state
- **Focus Timer** - Customizable Pomodoro-style sessions with preset configurations
- **Analytics Dashboard** - Comprehensive performance tracking and insights
- **Device Integration** - Support for smartwatch and calendar data (simulated)

### Advanced Capabilities
- **Behavioral Pattern Analysis** - Keyboard typing rhythm and mouse movement pattern detection
- **Adaptive Recommendations** - Personalized intervention frequency based on user preferences
- **Calendar Intelligence** - Meeting density analysis and focus time optimization
- **Physiological Monitoring** - Heart rate, sleep, and stress level integration
- **Privacy-First Design** - Local data processing with optional anonymous sharing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/brainwave-shift.git
   cd brainwave-shift
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 🎯 Usage Guide

### Getting Started
1. **Dashboard Overview** - View your current cognitive state and key metrics
2. **Start Monitoring** - Click "Resume" to begin real-time cognitive tracking
3. **Focus Sessions** - Use the timer for structured work periods
4. **Review Analytics** - Track your performance patterns over time
5. **Customize Settings** - Adjust intervention frequency and preferences

### Key Sections

#### 🏠 Dashboard
- Real-time cognitive score display
- Quick access to all major features
- Device integration status
- Performance overview

#### 🧠 Monitor
- Detailed cognitive metrics with trends
- Browser, keyboard, and mouse activity analysis
- Data source status indicators
- Historical performance charts

#### ⏱️ Focus Timer
- Customizable work/break intervals
- Preset configurations (Pomodoro, Deep Focus, Sprint)
- Automatic break reminders
- Session quality tracking

#### 🌿 Wellness
- Personalized intervention recommendations
- Breathing exercises and movement prompts
- Posture and hydration reminders
- Completion tracking

#### 📊 Analytics
- Daily and weekly focus time statistics
- Peak performance hour identification
- Distraction pattern analysis
- Streak tracking and achievements

#### ⚙️ Settings
- Intervention frequency customization
- Device integration management
- Privacy and data sharing controls
- Notification preferences

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18** - Modern component-based UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom design system
- **Vite** - Fast build tool and development server
- **Lucide React** - Beautiful, consistent icons

### Key Services
- **CognitiveMonitor** - Real-time behavioral analysis engine
- **DeviceIntegrationService** - Simulated smartwatch and calendar data
- **Analytics Engine** - Performance tracking and insights generation

### Design System
- **Typography** - Inter font family with strategic weight usage
- **Color Palette** - Calming blues and greens with accessibility compliance
- **Components** - Modular, reusable UI elements
- **Animations** - Smooth 60fps micro-interactions

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Dashboard.tsx    # Main dashboard view
│   ├── Navigation.tsx   # Sidebar navigation
│   ├── FocusTimer.tsx   # Timer functionality
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useCognitiveState.ts
│   ├── useSettings.ts
│   └── ...
├── services/           # Business logic and data services
│   ├── CognitiveMonitor.ts
│   ├── DeviceIntegrationService.ts
│   └── ...
├── types/              # TypeScript type definitions
└── styles/             # Global styles and Tailwind config
```

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality. All data processing happens locally in the browser.

### Customization
- **Intervention Frequency** - Minimal, Normal, or Frequent
- **Focus Session Length** - 15-60 minute intervals
- **Break Reminders** - Toggle notifications
- **Data Sharing** - Optional anonymous usage analytics

## 🎨 Design Philosophy

### User Experience
- **Calming Interface** - Reduces cognitive load while providing insights
- **Minimal Distractions** - Clean, focused design that doesn't interrupt workflow
- **Accessibility First** - WCAG compliant with proper contrast and navigation
- **Responsive Design** - Seamless experience across all device sizes

### Performance
- **60fps Animations** - Smooth, hardware-accelerated transitions
- **Lazy Loading** - Optimized bundle splitting for fast initial load
- **Error Boundaries** - Graceful handling of component failures
- **Progressive Enhancement** - Core functionality works without JavaScript

## 🔒 Privacy & Security

- **Local Processing** - All cognitive analysis happens in your browser
- **No External Tracking** - No third-party analytics or tracking scripts
- **Optional Data Sharing** - Anonymous usage data sharing is opt-in only
- **Secure Storage** - Settings stored locally using browser storage APIs

## 🚀 Deployment

### Netlify (Recommended)
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Vercel
```bash
npm run build
# Deploy using Vercel CLI or GitHub integration
```

### Self-Hosted
```bash
npm run build
# Serve dist/ folder with any static file server
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain component modularity
- Write accessible HTML
- Test across different browsers
- Ensure responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Inter Font Family** - Beautiful, readable typography
- **Lucide Icons** - Consistent, professional iconography
- **Tailwind CSS** - Efficient, maintainable styling
- **React Community** - Excellent ecosystem and documentation

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check the documentation
- Review existing discussions

---

**Built with ❤️ for cognitive wellness and peak performance**