# 🖥️ ServiceDesk Pro — IT Helpdesk & Asset Management

> **AI-Enabled ITSM Capstone** · MERN Stack (MongoDB · Express · React · Node.js)

A production-grade **IT Service Management (ITSM)** and **Asset Lifecycle Management** platform with role-based access control, SLA escalation, an AI copilot, and a rich analytics dashboard.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm v9+

### 1. Clone the repo
```bash
git clone https://github.com/Chaitanya-Aripirala/ServiceDesk.git
cd ServiceDesk
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Seed the Database
```bash
cd backend
node seed/seeder.js
```

The app will be available at **http://localhost:3000** (frontend) and **http://localhost:5000** (API).

---

## 👥 Demo Accounts

All accounts use password: **`Password123!`**

| Role | Email | Description |
|------|-------|-------------|
| **System Admin** | `admin@servicedesk.io` | Full governance: SLA policies, categories, audit trail |
| **IT Manager** | `manager@servicedesk.io` | SLA monitoring, technician assignments, KPI reports |
| **Technician** | `tech@servicedesk.io` | Ticket queue, AI Copilot, work logs, asset diagnostics |
| **Asset Manager** | `assetmgr@servicedesk.io` | Hardware/software lifecycle, vendors, maintenance |
| **Employee** | `employee@servicedesk.io` | Submit tickets, track SLA status, rate CSAT |

> 💡 The login page features **1-click persona switching** — click any role card to instantly log in!

---

## 🏗️ Architecture

```
ServiceDesk/
├── backend/                  # Node.js + Express REST API
│   ├── config/               # MongoDB connection
│   ├── controllers/          # Route handlers
│   ├── middleware/           # JWT auth, RBAC, audit logging
│   ├── models/               # 11 Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── seed/                 # Database seeder with enterprise demo data
│   └── services/             # AI classification, SLA escalation daemon
└── frontend/                 # React + Vite SPA
    └── src/
        ├── components/       # Reusable UI components (Badge, Modal, SLAProgress)
        ├── context/          # Auth context (JWT + role management)
        ├── pages/            # Feature pages
        │   ├── auth/         # Login with demo persona switcher
        │   ├── dashboard/    # Role-adaptive analytics dashboard
        │   ├── tickets/      # Ticket list, create, detail
        │   ├── assets/       # Asset list, create, detail
        │   ├── knowledge/    # Knowledge base & article editor
        │   ├── admin/        # Admin console (users, SLA, categories)
        │   └── reports/      # Analytics & reporting
        └── services/         # Axios API service layer
```

---

## ✨ Key Features

### 🎫 Ticket Management
- Multi-priority ticket lifecycle (New → In Progress → Resolved → Closed)
- AI-powered ticket classification and Knowledge Base suggestions
- SLA tracking with breach detection and auto-escalation
- Threaded comments (internal notes + customer replies)
- Technician work logs with time tracking
- CSAT rating system

### 🖥️ Asset Management
- Hardware and software inventory with asset tags
- Complete lifecycle tracking (procurement → deployment → retirement)
- Depreciation calculation (straight-line)
- Warranty expiry monitoring
- Maintenance log history
- Vendor management

### 🧠 AI Features
- Keyword-based ticket classification by category and priority
- Knowledge Base copilot suggestions on ticket view
- Sentiment analysis for escalation prioritization

### ⏱️ SLA Engine
- Configurable SLA policies per priority level
- Background daemon checks every 2 minutes
- Auto-escalation with notifications on breach

### 📊 Analytics & Reporting
- Role-adaptive dashboard with Chart.js visualizations
- Ticket volume trends, resolution rate, SLA compliance
- Technician performance metrics
- Asset lifecycle and category distribution charts

### 🔐 Security
- JWT-based authentication with configurable expiry
- Role-Based Access Control (Admin, Manager, Technician, Asset Manager, Employee)
- Audit trail for all critical operations
- Server-side validation and sanitization

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| UI | Vanilla CSS with glassmorphism, Chart.js |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose ODM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Scheduler | node-cron (SLA daemon) |
| HTTP Client | Axios |

---

## 📡 API Endpoints

| Module | Endpoints |
|--------|----------|
| Auth | `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/auth/notifications` |
| Tickets | `GET/POST /api/tickets`, `PUT /api/tickets/:id/assign`, `PUT /api/tickets/:id/status` |
| Assets | `GET/POST /api/assets`, `PUT /api/assets/:id/lifecycle` |
| Knowledge Base | `GET/POST /api/kb`, `POST /api/kb/:id/vote` |
| Users | `GET /api/users`, `GET /api/users/technicians` |
| SLA | `GET/POST /api/sla/policies`, `GET /api/sla/categories` |
| Analytics | `GET /api/analytics/dashboard` |
| Audit | `GET /api/audit` |

---

## 📄 License

MIT © 2026 Chaitanya Aripirala
