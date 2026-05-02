# 🐘 Elephant-Pulse: Intelligent Care & Visitor Insight System

A unified, AI-powered web application for monitoring and managing elephant health, nutrition, and stress — alongside a robust visitor analytics and management platform for the Pinnawala Elephant Orphanage.

Built with a **React (Vite)** frontend and a **Flask** backend (Care System), and a modularly connected **Visitor System**.

---

## 📋 Table of Contents
- [System Overview](#-system-overview)
- [Project Structure](#-project-structure)
- [Modules](#-modules)
- [AI Models](#-ai-models)
- [UI Features](#-ui-features)
- [Tech Stack](#-tech-stack)
- [How to Run](#-how-to-run)

---

## 🧠 System Overview

Elephant-Pulse consolidates advanced AI monitoring with sanctuary management. It is divided into two primary subsystems:

| Subsystem | Key Features |
|---|---|
| **🐘 Elephant Care** | Health profiles, AI health status prediction, local stress detection (CV), and AI-optimised feeding plans. |
| **🎟️ Visitor Insight** | Analytics dashboard, live visitor tracking, crowd density forecasting, and ticket tariff management. |

---

## 📁 Project Structure

```text
Elephant-Pulse/
│
├── backend/                            # Elephant Care API (Flask)
│   ├── app.py                          # Core API + Integrated AI prediction endpoints
│   ├── core_logic/                     # AI & Business Logic (Optical Flow, Feature Extraction)
│   ├── datasets/                       # Elephant vitals and feeding context
│   ├── models/                         # Trained ML Models (RandomForest, Pickle files)
│   └── database.db                     # Unified SQLite database
│
├── frontend/                           # Unified React/Vite Web App
│   ├── public/                         # Static assets (AI-generated elephant portraits)
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx           # Herd overview with grid/list toggle
│       │   ├── StressDetector.jsx      # Live monitoring & local AI video analysis
│       │   ├── FoodChain.jsx           # Feeding logs, AI recommendations & forecast
│       │   └── VisitorAdminDashboard.jsx # Visitor management & analytics
│       ├── components/
│       │   ├── Navigation.jsx          # Sticky nav with 🌙/☀️ dark/light mode toggle
│       │   └── ProfileHeader.jsx       # Adaptive elephant profile card
│       ├── utils/
│       │   ├── api.js                  # Care System client (Port 5005)
│       │   └── visitorApi.js           # Visitor System client (Port 8000)
│       └── index.css                   # Global design system with dark/light CSS variables
│
└── visitor_system/                     # Visitor System Microservices
    ├── Backend/                        # Native FastAPI Visitor Logic
    ├── Admin_Frontend/                 # Specialized Vite React Admin Dashboard
    ├── Visitor_Frontend/               # Visitor-facing Vite React App
    ├── docker-compose.yml              # Microservice deployment config
    └── app.py                          # Lightweight mock API for direct React integration
```

---

## 🧩 Modules

### 1. Elephant Care System
- **Health Profiles**: Monitor vitals and log daily health reports with AI-generated elephant portraits for each profile.
- **AI Diagnosis**: Random Forest & Gradient Boosting models accurately predict 5 health statuses and specific clinical diagnoses.
- **Stress Detector**: **Fully local** AI computer vision using Optical Flow processes both live CCTV feeds and `.mp4` video uploads — no cloud API dependency.
- **Food Chain**: Personalized nutritional calculation engine with 7-day AI forecasts and feeding history.

### 2. Visitor Insight System
- **Analytics Dashboard**: Tracks revenue, live visitors, and AI accuracy metrics.
- **Tariff Engine**: Full CRUD for ticket pricing tiers — changes reflect immediately in the UI.
- **Check-in Terminal**: Manual check-in updates the live visitor occupancy count in real time.
- **Advanced Microservices**: Designed for enterprise scaling via Docker, FastAPI, MongoDB, and Next.js.

---

## 🤖 AI Models

| Model | Algorithm | Purpose | Output |
|---|---|---|---|
| **Health Classifier** | Random Forest | Vitals analysis | Healthy, Infection, Dehydration, etc. |
| **Diagnosis Classifier** | Gradient Boosting | Clinical insight | Bacterial Infection, Arthritis, etc. |
| **Stress Detector** | OpenCV + Random Forest | Motion analysis (local) | Stress Probability % / Normal Behavior |
| **Nutrition Engine** | Rule-Based AI | Feeding optimization | Morning/Evening KG split + Remarks |

---

## 🎨 UI Features

- **Dark / Light Mode Toggle** — Persistent ☀️/🌙 button in the navigation header. Pure AMOLED black dark mode.
- **Safari Tech Color Palette** — Curated Emerald Green (`#10b981`), Slate, and Rose accent system with adaptive CSS variables.
- **AI-Generated Elephant Portraits** — Unique, photorealistic AI images for every elephant profile stored locally in `/public`.
- **Glassmorphism Cards** — Adaptive frosted-glass panels that adjust for both light and dark backgrounds.
- **Responsive Grid/List Toggle** — Switch between card grid and compact list views on the Dashboard.
- **Smooth Theme Transitions** — 400ms CSS transitions across all background and color changes.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS (CSS Variables), Recharts, Lucide React |
| **Care Backend** | Python 3, Flask, SQLite, Scikit-learn, OpenCV, Pandas |
| **Visitor Backend** | FastAPI, Node.js, MongoDB, Docker (full stack) |
| **AI/ML** | Random Forest, Gradient Boosting, Optical Flow (Farneback), NumPy |

---

## 🚀 How to Run

### Prerequisites

Make sure you have the following installed before starting:

| Requirement | Version | Check Command |
|---|---|---|
| **Python** | 3.9+ | `python3 --version` |
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **MongoDB** | 7.0+ | `mongosh --eval "db.version()"` |

> ⚠️ **MongoDB must be running** before starting the Visitor System Backend (Step 3).
> On macOS: `brew services start mongodb-community`

---

### Step 1 — Elephant Care Backend (Flask API)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python init_db.py                # First time only — creates the SQLite database
python app.py
```
✅ Running at → `http://localhost:5005`

---

### Step 2 — Main Frontend (React / Vite)

```bash
cd frontend
npm install
npm run dev
```
✅ Running at → `http://localhost:5173`

> This is the unified dashboard for **Health Profiles**, **Stress Detection**, **Food Chain**, and integrated **Visitor Admin**.

---

### Step 3 — Visitor System Backend (FastAPI)

> Requires **MongoDB** to be running on `localhost:27017`.

```bash
cd visitor_system/Backend
python3 -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Seed the database** (first time only — populates demo data):
```bash
PYTHONPATH=. python app/seed_full_db.py
```

**Start the server:**
```bash
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
✅ Running at → `http://localhost:8000`
📄 API Docs → `http://localhost:8000/docs`

---

### Step 4 — Visitor Public App (React / Vite + TypeScript)

```bash
cd visitor_system/Visitor_Frontend
npm install
npm run dev
```
✅ Running at → `http://localhost:3000`

> Visitor-facing app for registration, ticket booking, event timelines, and profile management.

---

### Step 5 — Admin Portal (React / Vite + TypeScript)

```bash
cd visitor_system/Admin_Frontend
npm install
npm run dev
```
✅ Running at → `http://localhost:3001`

> Admin dashboard for revenue analytics, visitor heatmaps, tariff management, and event operations.

---

### 📋 Quick Start (All Services)

Run each command in a **separate terminal window**:

```bash
# Terminal 1 — Care Backend
cd backend && source .venv/bin/activate && python app.py

# Terminal 2 — Main Frontend
cd frontend && npm run dev

# Terminal 3 — Visitor Backend
cd visitor_system/Backend && source venv/bin/activate && PYTHONPATH=. uvicorn app.main:app --port 8000 --reload

# Terminal 4 — Visitor App
cd visitor_system/Visitor_Frontend && npm run dev

# Terminal 5 — Admin Portal
cd visitor_system/Admin_Frontend && npm run dev
```

---

### 🌐 Service Map

| # | Service | URL | Port |
|---|---------|-----|------|
| 1 | 🐘 Care Backend (Flask) | `http://localhost:5005` | `5005` |
| 2 | 🖥️ Main Frontend (React) | `http://localhost:5173` | `5173` |
| 3 | 📊 Visitor Backend (FastAPI) | `http://localhost:8000` | `8000` |
| 4 | 🎫 Visitor App | `http://localhost:3000` | `3000` |
| 5 | 🔐 Admin Portal | `http://localhost:3001` | `3001` |

---

## 🔐 Default Login Credentials

| Portal | Username / Email | Password |
|---|---|---|
| **Vet Dashboard** (Main Frontend) | `vet_kamal` | `password` |
| **Admin Portal** | `admin@pinnawala.lk` | `admin123` |
| **Visitor App** | `user1@test.com` | `password123` |

---

*Designed for SLIIT Research Project — 2026*
