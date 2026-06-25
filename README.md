# Frontend

## Overview

The frontend of **StudyMind AI** is built using **React.js** and **Vite**, providing a fast, responsive, and modern Single Page Application (SPA). It serves as the primary interface for students to interact with the backend and AI services, allowing them to submit study questions, receive AI-powered topic classification, discover similar questions, and visualize learning progress through interactive dashboards.

The frontend communicates with the backend using REST APIs and provides a seamless user experience with authentication, analytics, and responsive UI components.

---

# Technology Stack

| Technology | Purpose |
|------------|---------|
| React.js | Frontend Framework |
| Vite | Build Tool |
| Material UI (MUI) | UI Component Library |
| React Router DOM | Client-side Routing |
| Axios | API Communication |
| React Context API | Global State Management |
| Recharts | Dashboard Charts |
| date-fns | Date Formatting |
| CSS-in-JS (MUI Theme) | Styling |

---

# Frontend Architecture

```text
                      User
                        │
                        ▼
              React Single Page Application
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
 Authentication     Dashboard      Ask Question
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                  Axios API Layer
                        │
                        ▼
                Node.js Express API
                        │
                        ▼
                FastAPI AI Service
```

---

# Project Structure

```text
frontend/
│
├── public/
│
├── src/
│   ├── api/
│   │   └── api.js
│   │
│   ├── assets/
│   │   ├── hero.png
│   │   ├── dashboard-study-hero.png
│   │   └── icons
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── LoadingScreen.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── AppUiContext.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── AskQuestion.jsx
│   │   └── History.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
└── package.json
```

---

# Application Flow

Every user interaction follows the workflow below.

```text
Application Startup
        │
        ▼
React Router
        │
        ▼
Authentication Check
        │
        ▼
Protected Route
        │
        ▼
Selected Page
        │
        ▼
Axios API Request
        │
        ▼
Backend API
        │
        ▼
Render Updated UI
```

---

# Routing

The application uses **React Router DOM** for navigation.

| Route | Description |
|--------|-------------|
| `/login` | User Login |
| `/register` | User Registration |
| `/` | Dashboard |
| `/ask` | Ask a Study Question |
| `/history` | Question History |

Protected routes ensure that only authenticated users can access the dashboard and AI features.

---

# Authentication

Authentication is handled using **JWT tokens**.

### Login Flow

```text
User Login
     │
     ▼
POST /api/auth/login
     │
     ▼
Receive JWT Token
     │
     ▼
Store Token in Local Storage
     │
     ▼
Attach Token to Every API Request
     │
     ▼
Access Protected Routes
```

The authentication state is managed globally using **React Context API**, allowing all components to access user information without prop drilling.

---

# Global State Management

The application uses two context providers.

## AuthContext

Responsible for:

- User Login
- User Registration
- Session Persistence
- Logout
- User Profile
- Authentication Status

---

## AppUiContext

Responsible for:

- Global Toast Notifications
- Success Messages
- Error Alerts
- Snackbar Management

---

# Axios API Layer

A centralized Axios instance is used for all API communication.

Responsibilities include:

- Base URL configuration
- Automatic JWT attachment
- Request interception
- Simplified API requests

```text
React Component
        │
        ▼
Axios Instance
        │
Bearer Token
        │
        ▼
Backend API
```

---

# Dashboard

The dashboard provides real-time learning analytics.

Features include:

- Total Questions
- Most Common Topic
- Study Streak
- Latest Activity
- Weekly Question Trend
- Topic Distribution
- Recent Questions

Interactive charts are built using **Recharts**.

---

# Ask Question Module

The Ask Question page is the core feature of the application.

Workflow:

```text
User Enters Question
        │
        ▼
Input Validation
        │
        ▼
POST /api/questions
        │
        ▼
Backend Processing
        │
        ▼
AI Analysis
        │
        ▼
Topic Classification
Similarity Detection
Confidence Score
        │
        ▼
Display Results
```

The page displays:

- Detected Topic
- Confidence Score
- AI Analysis
- Similar Questions
- Study Recommendations

---

# History Module

The History page allows students to review previous study sessions.

Features include:

- Chronological Question History
- Topic Information
- Search-ready Structure
- Personal Learning Archive

---

# Material UI Theme

The application uses a centralized Material UI theme to maintain design consistency.

The theme defines:

- Color Palette
- Typography
- Border Radius
- Buttons
- Cards
- Forms
- Global Spacing
- Responsive Breakpoints

---

# Responsive Design

The interface is fully responsive and optimized for:

- Desktop
- Laptop
- Tablet
- Mobile Devices

Responsive layouts are implemented using:

- Material UI Grid
- Flexbox
- Responsive Containers
- Adaptive Navigation

---

# Component Architecture

```text
App
│
├── Navbar
├── Footer
├── LoadingScreen
│
├── Dashboard
│   ├── Analytics Cards
│   ├── Charts
│   └── Recent Activity
│
├── AskQuestion
│   ├── Question Form
│   ├── AI Analysis
│   └── Similar Questions
│
├── History
├── Login
└── Register
```

---

# User Workflow

```text
Register
    │
    ▼
Login
    │
    ▼
Dashboard
    │
    ▼
Ask Question
    │
    ▼
AI Analysis
    │
    ▼
Topic Prediction
    │
    ▼
Similar Questions
    │
    ▼
Saved to History
    │
    ▼
Dashboard Analytics Updated
```

---

# User Experience Features

The frontend focuses on providing a clean and intuitive learning experience.

Implemented features include:

- JWT Authentication
- Protected Routes
- Responsive Layout
- Material UI Components
- Animated Page Transitions
- Loading Screens
- Toast Notifications
- Interactive Dashboard
- Similar Question Cards
- Progress Indicators
- Empty State Handling
- Error Handling
- Session Persistence

---

# Design Principles

The frontend follows modern software engineering practices:

- Component-Based Architecture
- Reusable UI Components
- Centralized State Management
- API Abstraction Layer
- Responsive Design
- Consistent Design System
- Separation of Concerns
- Scalable Folder Structure

---

# Future Improvements

Potential enhancements include:

- Dark and Light Theme Support
- Advanced Search and Filters
- User Profile Management
- AI Study Recommendations
- Study Goal Tracking
- Progressive Web App (PWA)
- Offline Support
- Multi-language Support
- Voice Question Input
- Real-time Notifications