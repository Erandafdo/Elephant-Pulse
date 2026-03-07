# 🐘 Elephant-Pulse: Intelligent Care & Visitor Insight System

A unified, AI-powered web application for monitoring and managing elephant health, nutrition, and stress, alongside a robust visitor analytics and management platform for the Pinnawala Elephant Orphanage.

Built with a **React** frontend and a **Flask** backend (Care System), with a separate **Visitor API** for guest management.

---

## 📋 Table of Contents
- [System Overview](#-system-overview)
- [Project Structure](#-project-structure)
- [Modules](#-modules)
  - [Elephant Care System](#1-elephant-care-system)
  - [Visitor Insight System](#2-visitor-insight-system)
- [AI Models](#-ai-models)
- [Datasets](#-datasets)
- [Database Schema](#-database-schema)
- [Tech Stack](#-tech-stack)
- [How to Run](#-how-to-run)
- [API Reference](#-api-reference)

---

## 🧠 System Overview

Elephant-Pulse consolidates advanced AI monitoring with sanctuary management. It is divided into two primary subsystems:

| Subsystem | Key Features |
|---|---|
| **🐘 Elephant Care** | Health profiles, AI health status prediction, stress detection (CV), and AI-optimised feeding plans. |
| **�️ Visitor Insight** | Analytics dashboard, live visitor tracking, crowd density forecasting, and ticket tariff management. |

---

## 📁 Project Structure

```
Elephant-Pulse/
│
├── backend/                            # Elephant Care API (Flask)
│   ├── app.py                          # Care API routes (Health, Stress, Food)
│   ├── init_db.py                      # Database initialisation script
│   ├── migrate_db.py                   # Database migration script
│   ├── train_health_models.py          # AI model training script
│   ├── elephant_health_model.pkl       # Trained health classifier
│   ├── diagnosis_model.pkl             # Trained diagnosis classifier
│   ├── database.db                     # Unified SQLite database
│   ├── requirements.txt                # Python dependencies
│   │
│   ├── core_logic/                     # AI & Business Logic
│   │   ├── health_predictor.py         # AI health inference
│   │   ├── food_quantity_engine.py     # AI nutritional engine
│   │   ├── camera.py                   # Real-time stress detection feed
│   │   └── reporting.py                # Automated feeding reports
│   │
│   └── models/
│       └── stress_detector.pkl         # Trained CV stress model
│
├── frontend/                           # Unified React/Vite Web App
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx               # Caretaker/Vet Login
│   │   │   ├── Dashboard.jsx           # Care System Herd Overview
│   │   │   ├── Profile.jsx             # Individual Elephant Health Profile
│   │   │   ├── StressDetector.jsx      # Live Stress Monitoring
│   │   │   ├── FoodChain.jsx           # AI Feeding Management
│   │   │   ├── VisitorLogin.jsx        # Visitor Admin Login
│   │   │   ├── VisitorAdminDashboard.jsx # Visitor Analytics & Store Management
│   │   │   └── VisitorPublicPage.jsx   # Public-facing Visitor Portal
│   │   │
│   │   ├── components/                 # Shared UI components
│   │   └── utils/
│   │       ├── api.js                  # Care API Client (Port 5005)
│   │       └── visitorApi.js           # Visitor API Client (Port 8000)
│   └── vite.config.js
│
└── visitor ins/                        # Visitor System Assets (Internal)
```

---

## 🧩 Modules

### 1. Elephant Care System
- **Health Profiles**: Monitor vitals and log daily reports.
- **AI Diagnosis**: Random Forest & Gradient Boosting models predict 5 health statuses and specific clinical diagnoses.
- **Stress Detector**: Neural-based computer vision classifies stress levels from real-time video streams using Optical Flow.
- **Food Chain**: Personalised nutritional engine using environmental and activity data to calculate optimal feeding schedules.

### 2. Visitor Insight System
- **Analytics Dashboard**: Monitor total revenue, live visitors, and AI accuracy.
- **Crowd Density**: AI-driven 7-day visitor forecasting and real-time crowd heatmap.
- **Check-in Terminal**: Manual check-in system for verified visitor tickets.
- **Store Management**: Dynamic ticket tariff configuration and premium package controls.

---

## 🤖 AI Models

| Model | Algorithm | Purpose | Output |
|---|---|---|---|
| **Health Classifier** | Random Forest | Vitals analysis | Healthy, Infection, Dehydration, etc. |
| **Diagnosis Classifier**| GD Boosting | Clinical insight | Bacterial Infection, Arthritis, etc. |
| **Stress Detector** | Random Forest (CV) | Motion analysis | Stress Probability % |
| **Nutrition Engine** | Rule-Based AI | Feeding optimization | Morning/Evening KG split + Remarks |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Framer Motion, Recharts, Lucide React, Vite.
- **Backend (Care)**: Python 3, Flask, SQLite.
- **Backend (Visitor)**: FastAPI / Node.js (External Integration).
- **AI/ML**: Scikit-learn, OpenCV (Computer Vision), Pandas, Numpy.

---

## 🚀 How to Run

### 1. Backend (Elephant Care)
```bash
cd backend
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```
*API runs at `http://localhost:5005`*

### 2. Backend (Visitor System)
*Ensure the Visitor backend is running on `http://localhost:8000`.*

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
*App accessible at `http://localhost:5173`*

---

## 📡 API Reference

| Endpoint | Method | System |
|---|---|---|
| `/api/auth/login` | POST | Care |
| `/api/elephants/:id/health` | POST | Care |
| `/api/video_feed` | GET | Care (Stress) |
| `/api/food/ai-recommend` | POST | Care |
| `/admin/analytics/forecast` | GET | Visitor |
| `/admin/tariffs` | GET | Visitor |




Designed for SLIIT Research Project — 2026
