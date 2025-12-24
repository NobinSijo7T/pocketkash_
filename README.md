<div align="center">

# 💰 PocketKash

<img src="public/favicon.svg" alt="PocketKash Logo" width="120" height="120">

### Smart Personal Finance Tracker

*Track where your money actually goes. Build better saving habits.*

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

[Features](#-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure)

</div>

---

## 📋 About

**PocketKash** is a modern personal finance tracking application designed to help users understand their spending behavior, detect money leaks early, and build better saving habits. Built with React and TypeScript, it offers a beautiful, responsive interface with AI-powered insights.

### Key Highlights

- 📊 **Track Daily, Weekly & Monthly Expenses** - Comprehensive expense tracking across different time periods
- 🧠 **AI-Powered Insights** - Intelligent analysis of your spending patterns with personalized recommendations
- 💡 **Spending Behavior Analysis** - Understand if you're an impulsive or planned spender
- 🔔 **Money Leak Detection** - Spot small recurring expenses that add up over time
- 🎯 **Savings Goals** - Set limits and track your progress towards financial goals

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏠 **Dashboard** | Overview of your financial health with charts and quick stats |
| 📅 **Daily Tracking** | Log and review daily transactions |
| 📆 **Weekly Reports** | Weekly spending summaries and trends |
| 📈 **Monthly Analytics** | Deep dive into monthly financial patterns |
| 🤖 **AI Chatbot** | Ask questions about your finances and get smart suggestions |
| 👤 **User Profiles** | Personalized experience with onboarding flow |
| 🌙 **Dark Mode** | Easy on the eyes with theme support |

---

## 🤖 AI-Powered Features

PocketKash leverages **Groq Cloud** with **Meta's Llama 3.3 (70B Versatile)** model to provide intelligent financial insights and conversational assistance.

### AI Capabilities

| Feature | Technology | Description |
|---------|-----------|-------------|
| 💬 **AI Chatbot** | Groq Cloud API | Natural language conversations about your finances |
| 🧠 **Smart Insights** | Llama 3.3 70B | Personalized spending analysis and recommendations |
| 📊 **Pattern Recognition** | AI-powered | Identifies spending patterns and money leaks |
| 💡 **Actionable Tips** | Context-aware | Real-time suggestions based on your transaction data |

### AI Integration Details

- **Provider**: Groq Cloud
- **Model**: `llama-3.3-70b-versatile` (Meta Llama)
- **Features**:
  - Real-time financial advice
  - Contextual spending insights
  - Behavioral pattern analysis
  - Natural conversation flow
  - Personalized saving recommendations

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Pages      │  │  Components  │  │     Contexts         │   │
│  │              │  │              │  │                      │   │
│  │ • Landing    │  │ • Layout     │  │ • UserContext        │   │
│  │ • Dashboard  │  │ • UI (shadcn)│  │ • FinanceContext     │   │
│  │ • Daily      │  │ • Chat       │  │                      │   │
│  │ • Weekly     │  │ • Dashboard  │  └──────────────────────┘   │
│  │ • Monthly    │  │ • Landing    │                              │
│  │ • Insights   │  │ • Onboarding │  ┌──────────────────────┐   │
│  │ • Profile    │  │ • Guards     │  │      Hooks           │   │
│  │ • Auth       │  │ • Splash     │  │                      │   │
│  └──────────────┘  └──────────────┘  │ • use-ai-insights    │   │
│                                       │ • use-mobile         │   │
│                                       │ • use-toast          │   │
│                                       └──────────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                         CORE LIBRARIES                           │
│  React Router DOM │ TanStack Query │ React Hook Form │ Zod      │
├─────────────────────────────────────────────────────────────────┤
│                         UI FRAMEWORK                             │
│  Tailwind CSS │ shadcn/ui │ Radix UI │ Framer Motion │ Recharts │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component → Context/Hook → State Update → Re-render
     │
     └──→ Form (React Hook Form + Zod) → Validation → Context
```

---

## 🛠 Tech Stack

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| **React** | ^18.3.1 | UI library for building component-based interfaces |
| **TypeScript** | ^5.8.3 | Type-safe JavaScript |
| **Vite** | ^5.4.19 | Next-generation build tool and dev server |

### Routing & State Management
| Package | Version | Purpose |
|---------|---------|---------|
| **react-router-dom** | ^6.30.1 | Client-side routing |
| **@tanstack/react-query** | ^5.83.0 | Async state management and caching |

### UI Components & Styling
| Package | Version | Purpose |
|---------|---------|---------|
| **tailwindcss** | ^3.4.17 | Utility-first CSS framework |
| **shadcn/ui** | - | Beautifully designed components |
| **@radix-ui/*** | Various | Accessible UI primitives |
| **framer-motion** | ^12.23.26 | Animation library |
| **lucide-react** | ^0.462.0 | Icon library |
| **recharts** | ^2.15.4 | Chart library for data visualization |

### Form Handling & Validation
| Package | Version | Purpose |
|---------|---------|---------|
| **react-hook-form** | ^7.61.1 | Performant form management |
| **@hookform/resolvers** | ^3.10.0 | Validation resolvers |
| **zod** | ^3.25.76 | TypeScript-first schema validation |
### AI & Machine Learning
| Package | Version | Purpose |
|---------|---------|---------||
| **groq-sdk** | ^0.8.1 | Groq Cloud API client for AI-powered insights |
| **Model** | llama-3.3-70b-versatile | Meta's Llama model for natural language processing |
### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| **date-fns** | ^3.6.0 | Modern date utility library |
| **clsx** | ^2.1.1 | Conditional className utility |
| **tailwind-merge** | ^2.6.0 | Merge Tailwind classes efficiently |
| **class-variance-authority** | ^0.7.1 | Component variant management |

### UI Enhancements
| Package | Version | Purpose |
|---------|---------|---------|
| **sonner** | ^1.7.4 | Toast notifications |
| **vaul** | ^0.9.9 | Drawer component |
| **cmdk** | ^1.1.1 | Command menu |
| **embla-carousel-react** | ^8.6.0 | Carousel/slider |
| **react-day-picker** | ^8.10.1 | Date picker |
| **react-resizable-panels** | ^2.1.9 | Resizable panel layouts |
| **input-otp** | ^1.4.2 | OTP input component |
| **next-themes** | ^0.3.0 | Theme management |

### Development Tools
| Package | Version | Purpose |
|---------|---------|---------|
| **eslint** | ^9.32.0 | Code linting |
| **typescript-eslint** | ^8.38.0 | TypeScript ESLint integration |
| **autoprefixer** | ^10.4.21 | CSS vendor prefixing |
| **postcss** | ^8.5.6 | CSS transformations |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have **Node.js** installed on your machine.

#### Installing Node.js

**Windows:**
1. Download the installer from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the prompts
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

**macOS (using Homebrew):**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Using nvm (Recommended):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install latest LTS version
nvm install --lts

# Use it
nvm use --lts
```

---

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pocketkash.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd pocketkash
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

---

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

---

## 📁 Project Structure

```
pocketkash/
├── public/
│   ├── favicon.svg          # App favicon
│   └── placeholder.svg      # Placeholder image
│
├── src/
│   ├── components/
│   │   ├── chat/            # AI chatbot components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── guards/          # Route guards (OnboardingGuard)
│   │   ├── landing/         # Landing page sections
│   │   ├── layout/          # Layout components (AppLayout)
│   │   ├── onboarding/      # Onboarding flow components
│   │   ├── splash/          # Splash screen
│   │   └── ui/              # shadcn/ui components
│   │
│   ├── contexts/
│   │   ├── FinanceContext.tsx   # Financial data state
│   │   └── UserContext.tsx      # User state management
│   │
│   ├── hooks/
│   │   ├── use-ai-insights.ts   # AI insights hook
│   │   ├── use-mobile.tsx       # Mobile detection
│   │   └── use-toast.ts         # Toast notifications
│   │
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   │
│   ├── pages/
│   │   ├── Auth.tsx         # Authentication page
│   │   ├── Daily.tsx        # Daily view
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Insights.tsx     # AI insights page
│   │   ├── Landing.tsx      # Landing/home page
│   │   ├── Monthly.tsx      # Monthly view
│   │   ├── NotFound.tsx     # 404 page
│   │   ├── Onboarding.tsx   # User onboarding
│   │   ├── Profile.tsx      # User profile
│   │   └── Weekly.tsx       # Weekly view
│   │
│   ├── types/
│   │   ├── finance.ts       # Financial data types
│   │   └── user.ts          # User-related types
│   │
│   ├── App.tsx              # Main app component
│   ├── App.css              # App styles
│   ├── index.css            # Global styles
│   ├── main.tsx             # App entry point
│   └── vite-env.d.ts        # Vite type definitions
│
├── index.html               # HTML entry point
├── package.json             # Dependencies & scripts
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

---

## 🎨 Theme

PocketKash uses a purple-violet color scheme with full dark mode support:

- **Primary**: `#8B5CF6` (Violet)
- **Accent**: `#7C3AED` (Purple)
- **Background**: Adaptive light/dark mode

---

## 📄 License

This project is private and proprietary.

---

<div align="center">

**Made with ❤️ by PocketKash Team**

</div>
