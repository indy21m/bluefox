# BlueFox - Intelligent Survey Platform

BlueFox is a modern survey platform that enables intelligent subscriber segmentation through direct integration with ConvertKit. Built with React, TypeScript, and deployed on Vercel.

## 🚀 Live Demo

Visit the live application at: [https://bluefox-rho.vercel.app](https://bluefox-rho.vercel.app)

## ✨ Features

- **One-Question-Per-Screen Surveys**: Clean, focused survey experience
- **Conditional Logic Engine**: Build intelligent survey paths
- **ConvertKit Integration**: Direct custom field mapping
- **Visual Logic Builder**: Drag-and-drop logic flow creation
- **Real-time Analytics**: Track survey performance and completion rates
- **A/B Testing**: Built-in A/B testing capabilities
- **Theme Customization**: Visual theme editor with live preview
- **Multi-Survey Management**: Create and manage multiple surveys

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Emotion.js with custom design system
- **State Management**: React Context API
- **Deployment**: Vercel (Frontend + Serverless Functions)
- **API Integration**: ConvertKit v4 API

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/indy21m/bluefox.git
cd bluefox
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables:
```bash
# Create .env file in frontend directory
VITE_CONVERTKIT_API_KEY=your_api_key_here
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🚀 Deployment

The application is configured for automatic deployment on Vercel:

1. Push changes to the main branch
2. Vercel automatically builds and deploys
3. View deployment at: https://bluefox-rho.vercel.app

## 📁 Project Structure

```
bluefox/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context providers
│   │   ├── design-system/  # Core design system
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   ├── api/               # Vercel serverless functions
│   └── vercel.json        # Vercel configuration
├── penguin/               # Design system guidelines
└── start/                 # UI/UX reference materials
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Key Features Implementation Status

- ✅ Survey Creation & Management
- ✅ Visual Logic Builder with Testing Mode
- ✅ ConvertKit Integration
- ✅ Analytics Dashboard
- ✅ Theme Customization
- ✅ Vercel Deployment
- 🚧 Advanced A/B Testing
- 🚧 Export Functionality

## 🐛 Known Issues

- Toast notifications may occasionally stack (fix in progress)
- Some buttons may require double-clicking on mobile devices

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Please contact the maintainer for contribution guidelines.

## 📞 Support

For support, please open an issue in the GitHub repository.