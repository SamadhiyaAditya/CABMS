# CAMS — Chai Adda Management System

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
| Validation   | Zod v4                            |
| Testing      | Jest + ts-jest                    |

---

## Architecture
Three-tier architecture:
- **Presentation**: Next.js (Customer Panel + Shopkeeper Panel)
- **Business Logic**: Express REST API with service layer
- **Data**: PostgreSQL via Prisma ORM

See `/docs` for the full Planning Document and API Reference.
See `/diagrams` for Class, Use Case, Sequence, and ER diagrams.

---

## Design Patterns Used (7/7)
| #  | Pattern         | Location                            | Problem Solved                    |
|----|-----------------|-------------------------------------|-----------------------------------|
| 1  | Singleton       | `DatabaseConnection`, `Service Classes` | Shared state & resource efficiency |
| 2  | Factory         | `UserFactory`                       | Role-based object creation        |
| 3  | Adapter         | `NotificationAdapter` (In-App/Email)| Pluggable channel support         |
| 4  | Composite       | `MenuComposite` (Category/Item)     | Uniform tree traversal            |
| 5  | Observer        | `OrderObserver`, `InventoryService` | SSE Updates & Low-stock alerts    |
| 6  | Strategy        | `ReportStrategy` (Sales/Inventory)  | Swappable analytics algorithms    |
| 7  | Template Method | `OrderTemplate` (Checkout workflow) | Fixed-step transactional logic    |

> **Note:** Patterns like **Observer**, **Adapter**, and **Singleton** are reused across multiple modules (Menu, Order, Inventory) to demonstrate consistent architectural design.

---

## OOP Concepts Demonstrated
- **Abstraction**: `User` base class hides auth details behind abstract methods
- **Encapsulation**: `passwordHash` is private — accessible only via `getPasswordHash()`
- **Inheritance**: `Customer` and `Shopkeeper` extend `User`
- **Polymorphism**: `getPermissions()` returns different values based on role
- **Interfaces**: `MenuComponent`, `IReportStrategy`, `INotificationService`, `IStockObserver`

## SOLID Principles
- **S (Single Responsibility)**: Each service class handles exactly one domain responsibility.
- **O (Open/Closed)**: New report types can cleanly extend `IReportStrategy` without modifying existing code.
- **L (Liskov Substitution)**: Customer and Shopkeeper can securely be substituted for User anywhere needed.
- **I (Interface Segregation)**: `INotificationService`, `IStockObserver`, `MenuComponent` are small and focused.
- **D (Dependency Inversion)**: Services depend on abstract interfaces rather than concrete class implementations.

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- npm or yarn
- PostgreSQL database (Neon DB recommended)

### Steps
1. Clone the repository
   ```bash
   git clone https://github.com/<your-username>/cams.git
   cd cams
   ```

2. Install backend dependencies
   ```bash
   cd backend && npm install
   ```

3. Install frontend dependencies
   ```bash
   cd frontend && npm install
   ```

4. Set up environment variables
   ```bash
   # Backend — copy example and fill in your DATABASE_URL
   cp backend/.env.example backend/.env

   # Frontend
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > frontend/.env.local
   ```

5. Run database migrations
   ```bash
   cd backend && npx prisma migrate dev --name init
   ```

6. Seed the database
   ```bash
   npx prisma db seed
   ```

---

## How to Run

**1. Start backend API:**
```bash
cd backend && npm run dev   # runs on port 3001
```

**2. Start frontend:**
```bash
cd frontend && npm run dev   # runs on port 3000
```

**3. Run tests:**
```bash
cd backend && npm test   # 38 unit tests
```

Open `http://localhost:3000` in your browser.

### Demo Credentials (from seed data)
| Role        | Email                      | Password     |
|-------------|----------------------------|-------------|
| Shopkeeper  | `shopkeeper@chaiadda.com`  | `password123` |
| Customer 1  | `test@customer.com`        | `password123` |
| Customer 2  | `anant@college.edu`        | `password123` |

---

## Project Structure
```
CABMS/
├── backend/
│   ├── prisma/          # Schema + migrations + seed
│   ├── src/
│   │   ├── config/      # DatabaseConnection (Singleton), env
│   │   ├── controllers/ # Thin HTTP handlers (7 modules)
│   │   ├── middlewares/  # Auth, Role Guard, Error Handler
│   │   ├── models/       # User class hierarchy (OOP)
│   │   ├── patterns/     # 7 Design Patterns
│   │   ├── routes/       # Express route definitions
│   │   ├── services/     # Business logic layer
│   │   ├── validators/   # Zod request validation
│   │   ├── utils/        # Custom error hierarchy
│   │   ├── __tests__/    # Jest unit tests
│   │   ├── app.ts        # Express app configuration
│   │   └── server.ts     # Entry point
│   └── jest.config.js
├── frontend/
│   └── app/
│       ├── (customer)/   # Menu, Cart, Orders, Profile pages
│       ├── (shopkeeper)/ # Admin Dashboard
│       ├── components/   # Reusable UI components
│       └── lib/          # API client (Axios)
├── diagrams/             # ER, Class, Use Case, Sequence PDFs
├── docs/                 # Planning document + API reference
└── README.md
```

---

## Team
- Aditya Samadhiya
- Anant Pratap Singh
- Abhishek Tripathi
- Yash Raj
- Yash Yadav
- Rohan Choudhary
