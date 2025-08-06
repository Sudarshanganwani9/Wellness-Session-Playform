# Wellness Session Playform

A modern, interactive web application designed to guide users through a wellness session using a combination of visuals, sound, and structured pose data. Built with **React**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Features

- 🧘 Modular Yoga and Wellness Sessions  
- 📷 Visual guidance with images per pose  
- 🔊 Audio playback synced with poses  
- ⏱️ Timed auto-transition between poses  
- 🎨 Beautiful and responsive UI using Tailwind CSS  
- ⚙️ Configurable via JSON (pose data, duration, etc.)

---

## 📁 Project Structure
Wellness-Session-Playform-main/
│
├── .gitignore                    # Files and folders ignored by Git
├── README.md                     # Project documentation
├── bun.lockb                     # Bun package lock file
├── components.json               # UI component config (likely for shadcn/ui or similar)
├── eslint.config.js              # ESLint config for code linting
├── index.html                    # Root HTML file for the app
├── package.json                  # Project metadata and dependencies
├── package-lock.json             # NPM lock file
├── postcss.config.js             # PostCSS setup (used by Tailwind)
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript base config
├── tsconfig.app.json             # App-specific TypeScript config
├── tsconfig.node.json            # Node-specific TypeScript config
├── vite.config.ts                # Vite build tool configuration
│
├── public/                       # Static files served as-is
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
└── src/                          # Main application source code
    ├── App.css                   # Component-level styles
    ├── App.tsx                   # Main React App component
    └── index.css                 # Global CSS styles


---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wellness-session-playform.git
   cd wellness-session-playform

## Install dependencies 

npm install

## Run the development server

npm run dev
