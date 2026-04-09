# ☕ CAMS — Chai Adda Management System

> A digital ordering and management system for Chai Adda, our college campus shop — built for the System Design & System Engineering course.

---

## Project Overview
CAMS is a two-panel web application that digitizes the ordering workflow at Chai Adda. Customers browse the menu, place orders, and track status digitally. The shopkeeper manages menu items, inventory, and processes orders through a dedicated admin panel. Orders are paid and picked up physically at the shop — CAMS handles everything before and after that moment.

---

## Tech Stack
| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | Next.js (React) + Vanilla CSS     |
| Backend API  | Express.js + Node.js + TypeScript |
| ORM          | Prisma (v5.20)                    |
| Database     | PostgreSQL (Neon DB)              |
| Auth         | JWT (role-based)                  |

---

## Architecture
Three-tier architecture:
- **Presentation**: Next.js (Customer Panel + Shopkeeper Panel)
- **Business Logic**: Express REST API with service layer
- **Data**: PostgreSQL via Prisma ORM

See `/docs` and the root `CAMS_Planning_Document.md` for the full System Design document.
See `/diagrams` for Class, Use Case, Sequence, and ER diagrams.

---

## Design Patterns Used
| Pattern         | Location                           |
|-----------------|------------------------------------|
| Singleton       | `src/config/DatabaseConnection.ts` |
| Factory         | `src/patterns/UserFactory.ts`      |
| Adapter         | `src/patterns/NotificationAdapter.ts`|
| Composite       | `src/patterns/MenuComposite.ts`    |
| Observer        | `src/patterns/OrderObserver.ts`    |
| Strategy        | `src/patterns/ReportStrategy.ts`   |
| Template Method | `src/patterns/OrderTemplate.ts`    |

---

## SOLID Principles
- **S (Single Responsibility)**: Each service class handles exactly one domain responsibility.
- **O (Open/Closed)**: New report types can cleanly extend `IReportStrategy` without modifying existing code.
- **L (Liskov Substitution)**: Customer and Shopkeeper can securely be substituted for User anywhere needed.
- **I (Interface Segregation)**: `IOrderable`, `IReviewable`, etc. are isolated.
- **D (Dependency Inversion)**: Services depend directly on abstract interfaces rather than concrete class implementations.

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- npm or yarn

### Steps
1. Clone the repository
   ```bash
   git clone https://github.com/<your-username>/cams.git
   cd cams
   ```

2. Install backend dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create `.env` file in the root based on `.env.example`:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-host.region.aws.neon.tech/dbname?sslmode=require"
   JWT_SECRET="your-secret-key"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```

4. Run database migrations
   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed the database (optional)
   ```bash
   npx prisma db seed
   ```

---

## How to Run

**1. Start backend API:**
```bash
npm run dev   # runs on port 3001
```

**2. Start frontend:**
*(Frontend functionality inside `frontend/` is being actively developed as of Sprint 2).*
```bash
cd frontend && npm run dev   # runs on port 3000
```

Open `http://localhost:3000` in your browser.
Register as a Customer to browse and order or as a Shopkeeper to securely access the admin panel.

---

## Team
Aditya Samadhiya — Solo Project
