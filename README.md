# 🏨 CheckingCheckout Mobile

<div align="center">
  
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB.svg?logo=react)
![Expo](https://img.shields.io/badge/Expo-54.0.20-000020.svg?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6.svg?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**A comprehensive mobile hospitality ERP system for hotels and guesthouses**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Screenshots](#-screenshots)

</div>

---

## 📱 About

CheckingCheckout Mobile is a powerful, multi-tenant hospitality management system designed specifically for hotels and guesthouses. Built with React Native and Expo, it provides seamless property management, booking operations, financial tracking, and comprehensive reporting—all from your mobile device.

## ✨ Features

### 🏠 **Core Management**

- **Multi-Property Support** - Manage multiple locations from a single account
- **Real-time Dashboard** - Live occupancy rates, revenue metrics, and key statistics
- **Smart Location Switching** - Seamlessly switch between properties with context preservation

### � **Reservation Management**

- **Advanced Calendar Views** - Daily, weekly, and monthly timeline views
- **Quick Booking** - Streamlined reservation creation with intelligent room suggestions
- **Guest Management** - Comprehensive guest profiles and booking history
- **Status Tracking** - Tentative, confirmed, checked-in, checked-out, and cancelled states
- **Room Assignments** - Visual room allocation with availability indicators

### 💰 **Financial Operations**

- **Income Tracking** - Detailed revenue recording with multiple categories
- **Expense Management** - Track operational costs with receipt uploads
- **Account Management** - Multi-currency support (LKR, USD, EUR, GBP)
- **Commission Tracking** - Agent and guide commission calculations
- **Payment Processing** - Multiple payment method support

### 📊 **Advanced Reports**

- **Comprehensive Overview** - Real-time financial metrics and KPIs
- **Enhanced Financial Reports** - Category-wise and timeline-based analysis
- **Account Statements** - Detailed balance sheets and transaction history
- **Commission Reports** - Agent performance and payment tracking
- **Export Functionality** - Generate and share PDF/Excel reports

### 🔐 **Security & Access Control**

- **Role-Based Permissions** - Granular access control per user
- **Tenant Isolation** - Complete data separation between organizations
- **Secure Authentication** - JWT-based auth with automatic token refresh
- **Owner Bypass** - Tenant owners have full access to all features

### 🎨 **User Experience**

- **Modern UI/UX** - Clean, intuitive interface with NativeWind styling
- **Floating Tab Navigation** - Modern bottom tab bar with rounded corners
- **Safe Area Support** - Adaptive layout for all device types
- **Dark Mode Ready** - Comprehensive theming system
- **Offline Support** - Local caching with sync capabilities

## 🛠️ Tech Stack

### **Frontend**

- **React Native** `0.81.5` - Cross-platform mobile framework
- **Expo SDK** `54.0.20` - Development platform and tooling
- **TypeScript** `5.3.3` - Type-safe development
- **React Navigation** - Bottom tabs and stack navigation
- **NativeWind** - Tailwind CSS for React Native
- **TanStack Query** - Data fetching and caching

### **Backend & Database**

- **Supabase** - Backend-as-a-Service platform
  - **PostgreSQL** - Relational database with RLS policies
  - **Authentication** - User management and JWT tokens
  - **Storage** - File uploads and receipt management
  - **Edge Functions** - Serverless API endpoints
  - **Real-time Subscriptions** - Live data updates

### **State Management**

- **Context API** - Global auth and location state
- **TanStack Query** - Server state management
- **React Hooks** - Local component state

### **UI Components**

- **Expo Vector Icons** (Ionicons) - Icon library
- **React Native Gesture Handler** - Touch interactions
- **React Native Reanimated** - Smooth animations
- **React Native Safe Area Context** - Safe area management

### **Development Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Metro Bundler** - JavaScript bundler

## 🗄️ Database Architecture

### **Multi-Tenant Design**

```
Tenants (Organizations)
  ├── Profiles (Users)
  │   └── User_permissions (Role-based access)
  ├── Locations (Properties)
  │   ├── Rooms (Inventory)
  │   │   └── Reservations (Bookings)
  │   ├── Income (Revenue tracking)
  │   ├── Expenses (Cost tracking)
  │   └── Accounts (Financial accounts)
  ├── Guides (Tour guides)
  └── Agents (Booking agents)
```

### **Key Tables**

- `tenants` - Organization management with trial tracking
- `profiles` - User accounts linked to tenants
- `user_permissions` - Granular permission matrix
- `locations` - Properties within organizations
- `rooms` - Inventory with dynamic pricing
- `reservations` - Complete booking lifecycle
- `income` / `expenses` - Financial transactions
- `accounts` - Account balances and statements
- `guides` / `agents` - Commission tracking

### **Security Features**

- **Row Level Security (RLS)** - Database-level tenant isolation
- **Foreign Key Constraints** - Data integrity enforcement
- **Audit Trails** - Automatic timestamp tracking
- **Secure Functions** - RPC functions for complex operations

## 🚀 Getting Started

### **Prerequisites**

- Node.js (v18 or higher)
- npm or yarn or bun
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for physical device testing)

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/RavinduBA/Checking-Checkout-Mobile.git
   cd my-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**

   ```bash
   # Create .env file in root directory
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**

   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

### **Build Commands**

```bash
# Development build
npx expo start --dev-client

# Production build for iOS
eas build --platform ios

# Production build for Android
eas build --platform android

# Create APK for testing
eas build -p android --profile preview
```

## 🏗️ Architecture

### **Project Structure**

```
my-app/
├── app/                      # App entry points
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Main screen
├── components/              # Reusable components
│   ├── accounts/           # Account management
│   ├── auth/               # Authentication
│   ├── calendar/           # Calendar views
│   ├── dashboard/          # Dashboard widgets
│   ├── expense/            # Expense tracking
│   ├── reports/            # Report components
│   ├── reservation/        # Booking management
│   ├── settings/           # Settings screens
│   └── ui/                 # UI components
├── contexts/               # Global state
│   ├── AuthContext.tsx    # Authentication state
│   └── LocationContext.tsx # Location state
├── hooks/                  # Custom React hooks
├── integrations/          # External services
│   └── supabase/         # Supabase client
├── utils/                 # Utility functions
└── assets/               # Images and fonts
```

### **Data Flow**

1. **Authentication** → AuthContext provides user, tenant, subscription
2. **Location Selection** → LocationContext manages active property
3. **Data Fetching** → TanStack Query with Supabase client
4. **Permission Check** → usePermissions hook validates access
5. **UI Rendering** → React Native components with NativeWind styling

### **Navigation Flow**

```
Authentication
  ├── Login
  └── Onboarding
      ↓
Main App (Bottom Tabs)
  ├── Dashboard (Overview)
  ├── Calendar (Booking timeline)
  ├── Reservations (Booking list)
  ├── Expense (Cost tracking)
  └── Reports (Analytics)
      ├── Comprehensive
      ├── Financial
      ├── Accounts
      └── Commission
```

## 📸 Screenshots

> Add screenshots of your app here to showcase the UI

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Development Team** - CheckingCheckout Development Team
- **Repository** - [github.com/RavinduBA/Checking-Checkout-Mobile](https://github.com/RavinduBA/Checking-Checkout-Mobile)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

<div align="center">
  
**Built with ❤️ using React Native & Expo**

⭐ Star us on GitHub — it helps!

</div>
