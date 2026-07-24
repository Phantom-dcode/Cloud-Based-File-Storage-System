# ☁️ CloudVault — Enterprise Cloud File Storage & Management System

> **CloudVault** is a modern, high-performance, full-stack cloud storage application built with React 19, TypeScript, Express, and Tailwind CSS. It delivers a seamless, Google Drive-like experience with file uploading, version control, secure share links, trash recovery, and storage analytics.

[![Live Application](https://img.shields.io/badge/🚀_Live_App-CloudVault-3B82F6?style=for-the-badge&logo=googlecloud)](https://ais-pre-i67idjba6xaolnwu6wttdn-692835517606.asia-southeast1.run.app)
[![Dev Environment](https://img.shields.io/badge/💻_Dev_Instance-AI_Studio-10B981?style=for-the-badge&logo=vite)](https://ais-dev-i67idjba6xaolnwu6wttdn-692835517606.asia-southeast1.run.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

---

## 🔗 Quick Links & Live Application

* 🌐 **Production Web Application:** [https://ais-pre-i67idjba6xaolnwu6wttdn-692835517606.asia-southeast1.run.app](https://ais-pre-i67idjba6xaolnwu6wttdn-692835517606.asia-southeast1.run.app)
* 🛠️ **Development Sandbox:** [https://ais-dev-i67idjba6xaolnwu6wttdn-692835517606.asia-southeast1.run.app](https://ais-dev-i67idjba6xaolnwu6wttdn-692835517606.asia-southeast1.run.app)

---

## ✨ Key Features

- 📁 **Folder & File Management:** Create custom folders with custom color accents, organize files hierarchicaly, rename, star, and delete.
- ⚡ **Drag & Drop Uploads:** High-speed file uploads with real-time percentage progress bars and MIME type auto-categorization.
- 📜 **File Versioning:** Maintain historic file versions, view changelogs, and upload new revisions seamlessly.
- 🔗 **Secure Sharing Links:** Generate public share URLs with configurable view/edit permissions and instant download toggles.
- 🗑️ **Trash & Recovery:** Soft deletion workflow with full restore capabilities and option for permanent deletion.
- 📊 **Storage Analytics Widget:** Interactive breakdown of storage space used across categories (Images, Documents, Videos, Code, Archives).
- 🔍 **Real-Time Search & Filtering:** Filter files by category chips or instant search query.
- 🛡️ **Fault-Tolerant Resilience:** Features graceful offline/fallback state handling to guarantee smooth user experience in all network conditions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Build Tool:** Vite

### Backend & API
- **Runtime:** Node.js + Express
- **File Storage:** AWS S3 SDK v3 (with built-in local fallback engine)
- **Database / Metadata:** Firestore / Dynamic REST API layer

---

## 📂 Project Structure

```
.
├── server.ts                 # Full-stack Express API backend server
├── src/
│   ├── App.tsx               # Primary application layout & route views
│   ├── main.tsx              # React entry point
│   ├── components/
│   │   ├── dashboard/        # Storage widgets & category stats
│   │   ├── files/            # Grid/Table file views, previews, versions, share modals
│   │   ├── layout/           # Sidebar navigation, top header Navbar
│   │   └── ui/               # Reusable UI controls and dialogs
│   ├── context/
│   │   ├── AuthContext.tsx   # User authentication & profile provider
│   │   └── FileContext.tsx   # File system state management & API syncing
│   ├── services/
│   │   └── api.ts            # Client REST API wrapper & fallback state engine
│   └── types/
│       └── index.ts          # Shared TypeScript interfaces & models
├── package.json              # Project dependencies and deployment scripts
└── metadata.json             # Applet metadata configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ 
- **npm** v9+

### Installation & Local Setup

1. **Clone the Repository:**
   ```bash
   git clone <your-repo-url>
   cd cloudvault
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and adjust settings as needed:
   ```bash
   cp .env.example .env
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🌐 How to Push to your GitHub Account

To push this repository to your personal GitHub account from AI Studio or your local machine:

1. **In Google AI Studio:**
   - Click on the **Settings / Export** menu at the top right of the screen.
   - Select **Export to GitHub** or **Download ZIP**.
   - If exporting directly, connect your GitHub account and choose target repository name.

2. **Command Line Push (Local Machine):**
   ```bash
   git init
   git add .
   git commit -m "feat: complete CloudVault platform setup with full backend resilience"
   git branch -M main
   git remote add origin https://github.com/<your-username>/cloudvault.git
   git push -u origin main
   ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
