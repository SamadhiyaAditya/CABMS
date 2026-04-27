# ☕ CAMS — Chai Adda Management System

**System Design & Engineering — Project Planning Document**
**Subject:** System Design and System Engineering
**Stack:** Next.js • Express + Node.js • TypeScript • Prisma • PostgreSQL

---

## 1. Project Overview

CAMS is a digital ordering and management system designed for Chai Adda, a campus shop. The system enables students and staff to browse the menu, place orders, and track order status — while giving the shopkeeper full control over the menu, inventory, and order management through a dedicated panel.

### Real-World Pitch Goal

Beyond the academic submission, CAMS is designed to be pitched to the actual owner of Chai Adda as a live system. Payment and delivery are intentionally out of scope — customers order via the app, pay and pick up physically at the shop, and the shopkeeper marks the order done.

### 1.1 Core Objectives

- Provide a seamless digital menu browsing and ordering experience for customers
- Give the shopkeeper a management panel to control items, inventory, and orders
- Generate a unique Order ID per order to link the digital record with physical pickup
- Demonstrate professional software engineering: OOP, SOLID, Design Patterns, and SDLC

### 1.2 Out of Scope (Intentional)

- Payment gateway integration (handled physically at the shop)
- Delivery / logistics
- Multi-location support

---

## 2. Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | Next.js (React) | SSR + routing + great DX with TypeScript |
| Backend API | Express + Node.js + TypeScript | Lightweight REST API, full type safety |
| ORM | Prisma | Type-safe DB queries, auto-generated types from schema |
| Database | PostgreSQL | Relational data, clean ER model, strong cardinality support |
| Auth | JWT (JSON Web Tokens) | Stateless, role-based auth for Customer vs Shopkeeper |
| Styling | Tailwind CSS | Rapid UI development with utility classes |

---

## 3. System Architecture

### 3.1 High-Level Architecture

CAMS follows a classic three-tier architecture with a clean separation between presentation, business logic, and data layers.

| Tier | Component | Description |
|------|-----------|-------------|
| Presentation | Next.js Frontend | Customer Panel + Shopkeeper Panel — two role-based views |
| Business Logic | Express REST API | All core logic: auth, orders, inventory, cart, reviews |
| Data | PostgreSQL via Prisma | Persistent storage for all entities and relationships |

### 3.2 Request Flow

- User interacts with Next.js frontend (Customer or Shopkeeper panel)
- Frontend sends HTTP request to Express REST API with JWT in Authorization header
- API middleware validates JWT and extracts role (CUSTOMER / SHOPKEEPER)
- Route handler calls the appropriate Service class
- Service interacts with PostgreSQL via Prisma ORM
- Response returned to frontend and UI updates accordingly

### 3.3 Folder Structure

```
/
├── /src
│   ├── /config          ← DB config, env, constants (Singleton lives here)
│   ├── /controllers     ← Route handlers (thin layer, delegates to services)
│   ├── /services        ← Core business logic
│   ├── /models          ← TypeScript interfaces and abstract base classes
│   ├── /patterns        ← Dedicated files for each design pattern
│   ├── /middlewares     ← Auth, error handling, role guard
│   ├── /routes          ← Express route definitions
│   └── /utils           ← Helpers, validators, formatters
├── /frontend            ← Next.js app
│   ├── /app             ← App router pages
│   ├── /components      ← Reusable UI components
│   └── /lib             ← API client, auth helpers
├── /prisma
│   └── schema.prisma    ← Database schema (source of truth)
├── /docs                ← This document + API docs
├── /diagrams            ← ER diagram, class diagram, flow diagrams
└── /dbDesign            ← Prisma migrations, seed files
```

---

## 4. System Modules

CAMS is divided into 7 core modules. Each module has a single responsibility (S in SOLID) and communicates through well-defined interfaces.

### Module 1 — Auth & User Management

| Attribute | Detail |
|-----------|--------|
| Roles | CUSTOMER, SHOPKEEPER |
| Auth Strategy | JWT — issued on login, validated per request via middleware |
| Key Entities | User (abstract base), Customer, Shopkeeper |
| Endpoints | POST /auth/register, POST /auth/login, GET /auth/me |
| OOP Concept | Inheritance — Customer and Shopkeeper extend abstract User class |

### Module 2 — Menu & Catalogue

| Attribute | Detail |
|-----------|--------|
| Purpose | Shopkeeper manages menu items; customers browse and filter them |
| Item Categories | Beverages, Food, Packaged Snacks, Combos |
| Key Entities | MenuCategory, MenuItem |
| Endpoints | GET /menu, POST /menu/items (shopkeeper), PUT /menu/items/:id, DELETE /menu/items/:id |
| Design Pattern | Composite — MenuCategory contains MenuItems, both implement MenuComponent interface |
| OOP Concept | Polymorphism via MenuComponent interface |

### Module 3 — Cart

| Attribute | Detail |
|-----------|--------|
| Purpose | Customer builds an order before confirming it |
| Behaviour | Add item, remove item, update quantity, view subtotal, clear cart |
| Key Entities | Cart, CartItem |
| Endpoints | GET /cart, POST /cart/items, PUT /cart/items/:id, DELETE /cart/items/:id |
| Design Pattern | Observer — Cart notifies when item is out of stock and removes it automatically |

### Module 4 — Order Management

| Attribute | Detail |
|-----------|--------|
| Purpose | Core transaction — converts cart to a confirmed order |
| Order Status Flow | PENDING → READY → PICKED_UP |
| Key Entities | Order, OrderItem |
| Endpoints | POST /orders (customer), GET /orders/:id, GET /orders (shopkeeper), PATCH /orders/:id/status |
| Design Pattern | Template Method — base order processing flow with fixed steps: validate → reserve stock → create order → notify |
| Note | No payment processed. Order ID printed/shown for physical pickup reference. |

### Module 5 — Inventory

| Attribute | Detail |
|-----------|--------|
| Purpose | Track stock count per item; prevent ordering out-of-stock items |
| Behaviour | Stock count per item, low-stock flag (threshold configurable), items hidden from menu when stock = 0 |
| Key Entities | InventoryItem (linked 1:1 with MenuItem) |
| Endpoints | GET /inventory (shopkeeper), PATCH /inventory/:itemId |
| Design Pattern | Observer — inventory changes trigger notification/flag for shopkeeper |

### Module 6 — Reviews & Ratings

| Attribute | Detail |
|-----------|--------|
| Purpose | Let customers rate items after pickup |
| Constraint | Only customers with PICKED_UP orders containing that item can review it |
| Key Entities | Review |
| Endpoints | POST /reviews, GET /reviews/item/:itemId |
| OOP Concept | Encapsulation — review eligibility logic fully inside ReviewService |

### Module 7 — Sales & Reports

| Attribute | Detail |
|-----------|--------|
| Purpose | Give shopkeeper analytics on orders and revenue |
| Features | Total orders today/week, revenue totals, most ordered items, pending vs completed count |
| Endpoints | GET /reports/summary, GET /reports/top-items |
| Design Pattern | Strategy — different report generation strategies (daily, weekly, item-wise) via ReportStrategy interface |

---

## 5. OOP Design & Class Hierarchy

### 5.1 Core Class Hierarchy

**Abstract Base Classes & Interfaces**

```typescript
// Abstract User (base class)
abstract class User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: Role  // enum: CUSTOMER | SHOPKEEPER
  createdAt: Date
  abstract getPermissions(): Permission[]
}

class Customer extends User {
  getPermissions() { return [VIEW_MENU, PLACE_ORDER, VIEW_HISTORY, RATE_ITEM] }
}

class Shopkeeper extends User {
  getPermissions() { return [MANAGE_MENU, MANAGE_INVENTORY, UPDATE_ORDER_STATUS, VIEW_REPORTS] }
}

// Menu Composite
interface MenuComponent {
  getName(): string
  getPrice(): number | null
  display(): void
}

class MenuCategory implements MenuComponent { children: MenuComponent[] }
class MenuItem implements MenuComponent { price: number; stock: number; category: MenuCategory }

// Order
class Order {
  id: string               // unique order ID
  customer: Customer
  items: OrderItem[]
  status: OrderStatus      // enum: PENDING | READY | PICKED_UP
  totalAmount: number
  createdAt: Date
}

enum OrderStatus { PENDING, READY, PICKED_UP }
```

### 5.2 OOP Concepts in CAMS

| OOP Concept | Where Applied | Example |
|-------------|---------------|---------|
| Abstraction | User base class hides auth details | `abstract class User` with `abstract getPermissions()` |
| Encapsulation | Business logic inside service classes | `ReviewService.canReview()` — logic hidden from controller |
| Inheritance | Role-based user types | Customer and Shopkeeper extend User |
| Polymorphism | Menu composite, Report strategies | MenuComponent interface used for both Category and Item |
| Interfaces | Service contracts, pattern implementations | IOrderService, IInventoryService, MenuComponent |

---

## 6. Design Patterns

All 7 required patterns are applied with genuine justification — each pattern solves a real problem in CAMS, not artificially forced. Several patterns are reused across multiple modules where the same problem recurs naturally.

### 6.0 Design Pattern Reuse Map

The same pattern can appear in multiple modules when it solves the same type of problem. Below is the complete map of every pattern usage across CAMS.

| Pattern | Primary Usage | Additional Reuse | Justification for Reuse |
|---------|--------------|-------------------|------------------------|
| Singleton | DatabaseConnection (Prisma Client) | ConfigManager (env vars + app settings) | App config should also be loaded once and shared — same problem as DB connection |
| Factory | UserFactory (Customer / Shopkeeper) | — | Single usage; only one polymorphic creation point |
| Adapter | InAppNotificationAdapter | EmailAdapter (same interface, different channel) | Multiple notification channels = multiple adapters. The whole point of Adapter is swappability |
| Composite | MenuCategory + MenuItem (MenuComponent) | — | Single usage; only the menu has a tree structure |
| Observer | OrderEventEmitter → CustomerNotifier, InventoryUpdater | InventoryEventEmitter → LowStockNotifier (alerts shopkeeper when stock < threshold) | Inventory stock changes are a separate event stream from order events — decouples stock alerts from order processing |
| Strategy | ReportStrategy (Daily, Weekly, TopItems) | MenuSortStrategy (sort menu by price, by name, by popularity) | Customer-facing menu needs sortable views — same swap-algorithm-at-runtime problem |
| Template Method | OrderProcessor (validate → reserve → create → notify) | — | Single usage; only order processing has a fixed-step pipeline |

### Pattern 1 — Singleton

| Attribute | Detail |
|-----------|--------|
| Problem Solved | Database connection should be created once and reused across the app |
| Implementation | DatabaseConnection class with private constructor and static getInstance() method |
| File | `src/config/DatabaseConnection.ts` |
| Why here | Prisma Client is expensive to instantiate — Singleton ensures one instance app-wide |

```typescript
class DatabaseConnection {
  private static instance: PrismaClient;
  static getInstance(): PrismaClient {
    if (!this.instance) this.instance = new PrismaClient();
    return this.instance;
  }
}
```

### Pattern 2 — Factory

| Attribute | Detail |
|-----------|--------|
| Problem Solved | Creating the right type of user (Customer or Shopkeeper) based on role during registration |
| Implementation | UserFactory class with static create(role, data) method |
| File | `src/patterns/UserFactory.ts` |
| Why here | Auth controller should not know the construction details of each user type — factory abstracts this |

```typescript
class UserFactory {
  static create(role: Role, data: CreateUserDto): Customer | Shopkeeper {
    return role === 'CUSTOMER' ? new Customer(data) : new Shopkeeper(data);
  }
}
```

### Pattern 3 — Adapter

| Attribute | Detail |
|-----------|--------|
| Problem Solved | Sending order confirmation notifications — the system should not depend on a specific notification channel |
| Implementation | INotificationService interface + adapters: InAppNotificationAdapter, EmailAdapter |
| File | `src/patterns/NotificationAdapter.ts` |
| Why here | Real pitch value: when CAMS goes live, the owner can plug in any notification channel without changing core logic |

```typescript
interface INotificationService {
  send(to: string, message: string): Promise<void>
}
class InAppNotificationAdapter implements INotificationService {
  send(...) { /* in-app notification logic */ }
}
class EmailAdapter implements INotificationService {
  send(...) { /* email logic */ }
}
```

### Pattern 4 — Composite

| Attribute | Detail |
|-----------|--------|
| Problem Solved | Menu has categories (Beverages, Food, Snacks) that contain items — need uniform traversal |
| Implementation | MenuComponent interface implemented by both MenuCategory (composite) and MenuItem (leaf) |
| File | `src/patterns/MenuComposite.ts` |
| Why here | Allows recursive menu rendering on frontend and uniform operations (e.g. getAll prices in a category) |

```typescript
interface MenuComponent {
  getName(): string;
  getChildren?(): MenuComponent[]
}
class MenuCategory implements MenuComponent {
  children: MenuComponent[];
  getChildren() { return this.children; }
}
```

### Pattern 5 — Observer

| Attribute | Detail |
|-----------|--------|
| Problem Solved | When order status changes, the customer should be notified; when stock hits 0, menu should update |
| Implementation | OrderEventEmitter (subject) + CustomerNotifier, InventoryUpdater (observers) |
| File | `src/patterns/OrderObserver.ts` |
| Why here | Decouples order logic from notification/inventory update logic — OrderService doesn't need to know about either |

```typescript
interface IObserver { update(event: OrderEvent): void }
class OrderEventEmitter {
  private observers: IObserver[];
  notify(event) { this.observers.forEach(o => o.update(event)); }
}
```

### Pattern 6 — Strategy

| Attribute | Detail |
|-----------|--------|
| Problem Solved | Reports can be generated in different ways — daily summary, weekly, by item — all with same interface |
| Implementation | IReportStrategy interface + DailyReportStrategy, WeeklyReportStrategy, TopItemsStrategy |
| File | `src/patterns/ReportStrategy.ts` |
| Why here | Shopkeeper may want different report views — Strategy lets us swap algorithms without changing ReportService |

```typescript
interface IReportStrategy { generate(data: OrderData[]): Report }
class DailyReportStrategy implements IReportStrategy {
  generate(data) { /* filter today's orders */ }
}
```

### Pattern 7 — Template Method

| Attribute | Detail |
|-----------|--------|
| Problem Solved | Order processing always follows the same sequence of steps, but individual steps may differ |
| Implementation | Abstract OrderProcessor class with processOrder() template method + abstract hook methods |
| File | `src/patterns/OrderTemplate.ts` |
| Why here | Enforces consistent order flow (validate → check stock → create → notify) while allowing extension for future order types |

```typescript
abstract class OrderProcessor {
  processOrder() {
    this.validate();
    this.reserveStock();
    this.createOrder();
    this.notify();
  }
  abstract validate(): void;
  abstract notify(): void;
}
```

---

## 7. SOLID Principles

Each SOLID principle is demonstrated in at least two concrete locations across CAMS to show consistent application, not one-off usage.

| Principle | Primary Example | Second Example |
|-----------|----------------|----------------|
| S — Single Responsibility | OrderService handles only order logic. NotificationService handles only notifications. They never cross. | ReviewService only handles review eligibility + creation. It does not touch order status or inventory — those are separate services. |
| O — Open/Closed | Adding a new report type = new class implementing IReportStrategy. Existing strategies untouched. | Adding a new notification channel = new class implementing INotificationService. InAppNotificationAdapter stays unchanged. |
| L — Liskov Substitution | Any function accepting User works correctly when passed a Customer or Shopkeeper instance. | Any function accepting MenuComponent works correctly whether it receives a MenuCategory or a MenuItem — Composite pattern relies on this. |
| I — Interface Segregation | IOrderable, IReviewable, IInventoryManageable — no class is forced to implement unrelated methods. | INotificationService has only send(). IReportStrategy has only generate(). IObserver has only update(). Each interface has exactly one method — maximum segregation. |
| D — Dependency Inversion | OrderService depends on INotificationService (abstraction), not InAppNotificationAdapter (concrete). Swap channel anytime. | ReportService depends on IReportStrategy (abstraction), not DailyReportStrategy (concrete). Swap report algorithm at runtime. |

### 7.1 SOLID Traceability — File Locations

| Principle | Where to Find in Code |
|-----------|-----------------------|
| SRP | Each file in `src/services/` has exactly one class with one responsibility |
| OCP | `src/patterns/ReportStrategy.ts` — add new strategy without modifying existing ones |
| LSP | `src/models/User.ts` — Customer and Shopkeeper both satisfy the User contract |
| ISP | All interfaces in `src/models/` and `src/patterns/` — each has 1–2 methods max |
| DIP | Constructor injection in `src/services/OrderService.ts` — accepts INotificationService, not a concrete class |

---

## 8. Database Design (ER Model)

### 8.1 Entities & Attributes

**User**
- id (PK, UUID)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- passwordHash (VARCHAR)
- role (ENUM: CUSTOMER, SHOPKEEPER)
- createdAt (TIMESTAMP)

**MenuItem**
- id (PK, UUID)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- imageUrl (VARCHAR, nullable)
- isAvailable (BOOLEAN)
- categoryId (FK → MenuCategory)
- createdAt (TIMESTAMP)

**MenuCategory**
- id (PK, UUID)
- name (VARCHAR) — e.g. Beverages, Food, Packaged Snacks
- description (TEXT, nullable)

**InventoryItem**
- id (PK, UUID)
- menuItemId (FK → MenuItem, UNIQUE — 1:1 relation)
- stockCount (INTEGER)
- lowStockThreshold (INTEGER, default 5)
- updatedAt (TIMESTAMP)

**Cart**
- id (PK, UUID)
- customerId (FK → User, UNIQUE — one active cart per customer)
- createdAt (TIMESTAMP)

**CartItem**
- id (PK, UUID)
- cartId (FK → Cart)
- menuItemId (FK → MenuItem)
- quantity (INTEGER)

**Order**
- id (PK, UUID) ← this is the Order ID shown to customer
- customerId (FK → User)
- status (ENUM: PENDING, READY, PICKED_UP)
- totalAmount (DECIMAL)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)

**OrderItem**
- id (PK, UUID)
- orderId (FK → Order)
- menuItemId (FK → MenuItem)
- quantity (INTEGER)
- priceAtTime (DECIMAL) ← snapshot of price at order time

**Review**
- id (PK, UUID)
- customerId (FK → User)
- menuItemId (FK → MenuItem)
- orderId (FK → Order) ← ensures review is tied to a real purchase
- rating (INTEGER, 1–5)
- comment (TEXT, nullable)
- createdAt (TIMESTAMP)

### 8.2 Relationships & Cardinality

| Entity A | Relationship | Entity B | Cardinality |
|----------|-------------|----------|-------------|
| User (Customer) | places | Order | 1 : Many |
| Order | contains | OrderItem | 1 : Many |
| MenuItem | appears in | OrderItem | 1 : Many |
| MenuCategory | groups | MenuItem | 1 : Many |
| MenuItem | has one | InventoryItem | 1 : 1 |
| User (Customer) | has one active | Cart | 1 : 1 |
| Cart | contains | CartItem | 1 : Many |
| User (Customer) | writes | Review | 1 : Many |
| MenuItem | receives | Review | 1 : Many |

---

## 9. API Endpoint Reference

| Method + Endpoint | Auth Role | Description |
|-------------------|-----------|-------------|
| POST /auth/register | Public | Register as customer or shopkeeper |
| POST /auth/login | Public | Login and receive JWT |
| GET /auth/me | Any | Get current user profile |
| GET /menu | Public | Get full menu with categories and items |
| GET /menu/categories | Public | Get all menu categories |
| POST /menu/items | Shopkeeper | Add a new menu item |
| PUT /menu/items/:id | Shopkeeper | Update a menu item |
| DELETE /menu/items/:id | Shopkeeper | Remove a menu item |
| GET /cart | Customer | View current cart |
| POST /cart/items | Customer | Add item to cart |
| PUT /cart/items/:id | Customer | Update cart item quantity |
| DELETE /cart/items/:id | Customer | Remove item from cart |
| POST /orders | Customer | Place order from cart |
| GET /orders | Shopkeeper | View all orders (filterable by status) |
| GET /orders/my | Customer | View own order history |
| GET /orders/:id | Customer / Shopkeeper | View single order details |
| PATCH /orders/:id/status | Shopkeeper | Update order status |
| GET /inventory | Shopkeeper | View inventory status of all items |
| PATCH /inventory/:itemId | Shopkeeper | Update stock count for an item |
| POST /reviews | Customer | Submit a review for a purchased item |
| GET /reviews/item/:itemId | Public | Get all reviews for a menu item |
| GET /reports/summary | Shopkeeper | Get sales summary (daily/weekly) |
| GET /reports/top-items | Shopkeeper | Get most ordered items |

---

## 10. SDLC — Software Development Life Cycle

CAMS follows the Agile-inspired iterative SDLC model, structured into 4 phases aligned with academic deadlines and real-world delivery goals.

### Phase 1 — Planning & Requirements (Completed)

- Identified stakeholders: students/staff (customers) and shop owner (shopkeeper)
- Defined functional requirements per module
- Identified non-functional requirements: role-based access, type safety, scalability
- Decided tech stack: Next.js, Express, TypeScript, Prisma, PostgreSQL
- Created this planning document

### Phase 2 — System Design (Current Phase)

- Defined class hierarchy, OOP model, and design patterns
- Designed ER diagram with entities, relationships, and cardinality
- Planned folder structure and API contracts
- Mapped SOLID principles to actual code decisions
- Set up GitHub repository with README and folder structure

### Phase 3 — Implementation (Upcoming)

- Sprint 1: Auth module + DB setup + Prisma schema
- Sprint 2: Menu & Inventory modules + Shopkeeper panel
- Sprint 3: Cart + Order modules + Customer panel
- Sprint 4: Reviews + Reports + Observer/notification wiring
- Sprint 5: Integration testing + UI polish

### Phase 4 — Testing & Deployment

- Unit tests for Service classes (Jest)
- Integration tests for API endpoints
- Manual end-to-end testing of both panels
- README updated with setup instructions and demo
- Final pitch prep: document real-world value for Chai Adda owner

---

## 11. GitHub README Template

Copy this into your repository README.md:

```markdown
# ☕ CAMS — Chai Adda Management System

> A digital ordering and management system for Chai Adda,
> our college campus shop — built for the System Design &
> System Engineering course.

---

## Project Overview
CAMS is a two-panel web application that digitizes the
ordering workflow at Chai Adda. Customers browse the menu,
place orders, and track status digitally. The shopkeeper
manages menu items, inventory, and processes orders through
a dedicated admin panel. Orders are paid and picked up
physically at the shop — CAMS handles everything before
and after that moment.

---

## Tech Stack
| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | Next.js (React) + Tailwind CSS    |
| Backend API  | Express.js + Node.js + TypeScript |
| ORM          | Prisma                            |
| Database     | PostgreSQL                        |
| Auth         | JWT (role-based)                  |

---

## Architecture
Three-tier architecture:
- Presentation: Next.js (Customer Panel + Shopkeeper Panel)
- Business Logic: Express REST API with service layer
- Data: PostgreSQL via Prisma ORM

See /docs for the full System Design document.
See /diagrams for Class, Use Case, Sequence, and ER diagrams.

---

## Design Patterns Used
| Pattern         | Location                           |
|-----------------|------------------------------------|
| Singleton       | src/config/DatabaseConnection.ts   |
| Factory         | src/patterns/UserFactory.ts        |
| Adapter         | src/patterns/NotificationAdapter.ts|
| Composite       | src/patterns/MenuComposite.ts      |
| Observer        | src/patterns/OrderObserver.ts      |
| Strategy        | src/patterns/ReportStrategy.ts     |
| Template Method | src/patterns/OrderTemplate.ts      |

---

## SOLID Principles
- S: Each service class has exactly one responsibility
- O: New report types extend IReportStrategy, no existing code modified
- L: Customer and Shopkeeper substitutable for User anywhere
- I: IOrderable, IReviewable, IInventoryManageable are separate interfaces
- D: Services depend on interfaces, not concrete implementations

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL running locally or via Docker
- npm or yarn

### Steps
1. Clone the repository
   git clone https://github.com/<your-username>/cams.git
   cd cams

2. Install backend dependencies
   cd src && npm install

3. Install frontend dependencies
   cd frontend && npm install

4. Set up environment variables
   Copy .env.example to .env and fill in:
   DATABASE_URL="postgresql://user:pass@localhost:5432/cams"
   JWT_SECRET="your-secret-key"
   PORT=3001

5. Run database migrations
   npx prisma migrate dev --name init

6. Seed the database (optional)
   npx prisma db seed

---

## How to Run

Start backend API:
  cd src && npm run dev   (runs on port 3001)

Start frontend:
  cd frontend && npm run dev   (runs on port 3000)

Open http://localhost:3000 in your browser.

Register as Customer to browse and order.
Register as Shopkeeper to access the admin panel.

---

## Team
[Your Name] — Solo Project
```

---

## 12. Implementation Checklist

### By 10 April (Phase 3 requirement — 40% core)

| Task | Status | Notes |
|------|--------|-------|
| GitHub repo created with README | [ ] | Add initial commit with folder structure |
| Folder structure in place (/src /docs /diagrams /dbDesign) | [ ] | Can be empty folders with .gitkeep |
| Prisma schema with all entities | [ ] | User, MenuItem, Order, Cart, Review, Inventory |
| ER diagram created | [ ] | Export to /diagrams folder |
| Abstract User class + Customer + Shopkeeper | [ ] | src/models/User.ts |
| MenuComponent interface + Composite pattern | [ ] | src/patterns/MenuComposite.ts |
| Singleton pattern — DB connection | [ ] | src/config/DatabaseConnection.ts |
| Factory pattern — UserFactory | [ ] | src/patterns/UserFactory.ts |
| One design pattern documented in README | [ ] | Pick Singleton or Factory — simplest to explain |
| Auth endpoints working (register + login) | [ ] | POST /auth/register, POST /auth/login |

### Full Submission

| Module | Status | Notes |
|--------|--------|-------|
| All 7 design patterns implemented | [ ] | See Section 6 for file locations |
| All 5 SOLID principles demonstrated | [ ] | Comment in code referencing which principle |
| All API endpoints working | [ ] | See Section 9 for full list |
| Customer panel — Next.js | [ ] | Browse, cart, order, history, reviews |
| Shopkeeper panel — Next.js | [ ] | Menu mgmt, inventory, order status, reports |
| Reviews module | [ ] | With purchase verification gate |
| Reports module with Strategy pattern | [ ] | Daily + Weekly + Top Items |
| Observer pattern for order events | [ ] | Status change → notification trigger |
| All diagrams in /diagrams folder | [ ] | ER, class diagram, use case, sequence |
| Full documentation in /docs | [ ] | This doc + API doc |

---

## 13. Problem Statement & Solution Approach

### 13.1 Problem Statement

Chai Adda is a popular campus shop serving students and staff daily. Currently, the entire ordering process is manual — customers walk up to the counter, wait in queues especially during peak hours (lunch breaks, between classes), and place orders verbally. There is no digital record of orders, no inventory tracking, no way for students to pre-order, and no sales data for the shop owner to make informed decisions.

This creates several concrete problems:

- Long queues during peak hours lead to frustrated customers and lost sales
- No way for students to browse the menu digitally before arriving
- Shopkeeper has no visibility into stock levels — items run out unexpectedly
- No order history means disputes cannot be resolved and regulars get no recognition
- Zero sales data means the owner cannot identify best-selling items or plan inventory

### 13.2 Solution Approach

| Problem | CAMS Solution |
|---------|--------------|
| Queue congestion at counter | Students pre-order digitally, just show Order ID to collect |
| No menu visibility before arriving | Full digital menu with categories, prices, and item availability |
| Stock running out silently | Inventory module with stock count — items auto-hidden when stock = 0 |
| No order records | Every order stored with unique Order ID, full history for customer and shopkeeper |
| No sales insights | Reports module — daily/weekly summaries, top items, revenue totals |
| No customer feedback loop | Reviews & ratings module tied to verified purchases |

### 13.3 System Design Optimizations

- **Separation of Concerns**: Frontend (Next.js) and Backend (Express API) are fully decoupled — each can be scaled independently
- **Stateless Auth**: JWT-based authentication means the backend is stateless and horizontally scalable
- **Single Source of Truth**: Prisma schema is the single authoritative definition of the data model — eliminates drift between code and DB
- **Role-Based Access Control**: Middleware enforces permissions at the API layer — no business logic needed in each controller
- **Stock Reservation on Order**: Inventory is decremented atomically when an order is placed, preventing overselling
- **Price Snapshot in OrderItem**: priceAtTime field captures item price at order creation — changing menu prices never corrupt historical orders

---

## 13.4 Non-Functional Requirements

| Requirement | Target | How CAMS Achieves It |
|-------------|--------|---------------------|
| Performance | API response < 200ms for menu/cart operations | Prisma query optimization, indexed FKs, Singleton DB connection avoids reconnection overhead |
| Security | No unauthorized access to shopkeeper routes | JWT validation middleware + role guard middleware on every protected route (defense in depth) |
| Scalability | Support 50+ concurrent users during peak hours | Stateless JWT auth (no session storage), decoupled frontend/backend (can scale independently) |
| Reliability | No data loss on order placement | Prisma transactions for atomic stock reservation + order creation (RISK-01 fix) |
| Usability | First-time user can place order in < 2 minutes | Clean UI flow: browse → add to cart → place order → see Order ID. Minimal steps. |
| Maintainability | New developer can understand any module in < 15 minutes | Single Responsibility per service, design pattern labels in every file header, comprehensive README |
| Data Integrity | No negative stock, no duplicate reviews, no orphaned cart items | DB-level constraints (unique, check), Prisma schema enforced, application-level validation with zod |

### 13.5 Security Considerations

| Security Concern | Mitigation |
|-----------------|------------|
| Password Storage | bcrypt hashing with salt rounds ≥ 10. Raw passwords never stored or logged. |
| JWT Expiry | Tokens expire after 24 hours. Frontend checks expiry and redirects to login. |
| JWT Secret | Loaded from environment variable, never hardcoded. `.env` in `.gitignore`. |
| Input Validation | All request bodies validated with zod schemas before reaching business logic. Rejects malformed data with 400. |
| SQL Injection | Prisma ORM uses parameterized queries by default — no raw SQL strings. |
| Role Escalation | Backend role guard middleware checks JWT role on every request. Frontend-only checks are UX, not security. |
| CORS | Only the configured frontend origin is allowed. No wildcard `*` in production. |
| Rate Limiting | Express-rate-limit middleware on auth routes to prevent brute-force login attempts. |

---

## 14. UML Diagrams — Detailed Specifications

Complete diagram specifications are provided below. Each diagram is described in enough detail that it can be recreated in any UML tool (draw.io, Lucidchart, PlantUML, StarUML). Exported diagram images should be saved to `/diagrams` in the repository.

### 14.1 Class Diagram

The class diagram covers all major classes, interfaces, abstract classes, their attributes, methods, and relationships (inheritance, implementation, association, composition).

#### Abstract Classes

```
User (abstract)
+ id: string
+ name: string
+ email: string
+ passwordHash: string
+ role: Role (enum)
+ createdAt: Date
--
+ abstract getPermissions(): Permission[]
+ validatePassword(input: string): boolean
```

#### Concrete Classes extending User

```
Customer extends User
(inherits all User fields)
--
+ getPermissions(): Permission[]
  returns [VIEW_MENU, PLACE_ORDER, VIEW_HISTORY, RATE_ITEM]

Shopkeeper extends User
(inherits all User fields)
--
+ getPermissions(): Permission[]
  returns [MANAGE_MENU, MANAGE_INVENTORY, UPDATE_ORDER_STATUS, VIEW_REPORTS]
```

#### Interfaces

```
MenuComponent (interface)
+ getName(): string
+ getPrice(): number | null
+ isAvailable(): boolean
+ display(): void

IOrderService (interface)
+ placeOrder(customerId: string, cartId: string): Promise<Order>
+ getOrder(orderId: string): Promise<Order>
+ updateStatus(orderId: string, status: OrderStatus): Promise<Order>

INotificationService (interface)
+ send(to: string, message: string): Promise<void>

IReportStrategy (interface)
+ generate(data: OrderData[]): Report

IObserver (interface)
+ update(event: OrderEvent): void
```

#### Composite Pattern Classes

```
MenuCategory implements MenuComponent
+ id: string
+ name: string
+ children: MenuComponent[]
--
+ getName(): string
+ getPrice(): null
+ isAvailable(): boolean
+ display(): void
+ add(component: MenuComponent): void
+ remove(component: MenuComponent): void
+ getChildren(): MenuComponent[]

MenuItem implements MenuComponent
+ id: string
+ name: string
+ description: string
+ price: number
+ imageUrl: string
+ categoryId: string
--
+ getName(): string
+ getPrice(): number
+ isAvailable(): boolean  (checks InventoryItem.stockCount > 0)
+ display(): void
```

#### Order-related Classes

```
Order
+ id: string
+ customerId: string
+ status: OrderStatus (enum: PENDING | READY | PICKED_UP)
+ totalAmount: number
+ createdAt: Date
+ updatedAt: Date
+ items: OrderItem[]
--
+ getStatusLabel(): string
+ isComplete(): boolean

OrderItem
+ id: string
+ orderId: string
+ menuItemId: string
+ quantity: number
+ priceAtTime: number
--
+ getLineTotal(): number

Cart
+ id: string
+ customerId: string
+ items: CartItem[]
+ createdAt: Date
--
+ getTotal(): number
+ isEmpty(): boolean
+ clear(): void

CartItem
+ id: string
+ cartId: string
+ menuItemId: string
+ quantity: number
--
+ getLineTotal(price: number): number
```

#### Pattern-specific Classes

```
DatabaseConnection (Singleton)
- static instance: PrismaClient
- constructor()  [private]
--
+ static getInstance(): PrismaClient

UserFactory (Factory)
(no instance fields — all static)
--
+ static create(role: Role, data: CreateUserDto): Customer | Shopkeeper

OrderEventEmitter (Observer Subject)
- observers: IObserver[]
--
+ subscribe(observer: IObserver): void
+ unsubscribe(observer: IObserver): void
+ notify(event: OrderEvent): void

CustomerNotifier implements IObserver
- notificationService: INotificationService
--
+ update(event: OrderEvent): void

InventoryUpdater implements IObserver
- prisma: PrismaClient
--
+ update(event: OrderEvent): void

InAppNotificationAdapter implements INotificationService
--
+ send(to: string, message: string): Promise<void>

EmailAdapter implements INotificationService
- emailClient: ExternalEmailClient
--
+ send(to: string, message: string): Promise<void>

OrderProcessor (Template Method — abstract)
# prisma: PrismaClient
--
+ processOrder(customerId: string, cartId: string): Promise<Order>  [TEMPLATE - final]
# abstract validate(cart: Cart): void
# reserveStock(items: CartItem[]): Promise<void>
# createOrder(customerId: string, items: CartItem[]): Promise<Order>
# abstract notify(order: Order): void

StandardOrderProcessor extends OrderProcessor
(inherits OrderProcessor)
--
# validate(cart: Cart): void
# notify(order: Order): void

DailyReportStrategy implements IReportStrategy
+ generate(data: OrderData[]): Report  — filters today's orders

WeeklyReportStrategy implements IReportStrategy
+ generate(data: OrderData[]): Report  — aggregates last 7 days

TopItemsStrategy implements IReportStrategy
+ generate(data: OrderData[]): Report  — ranks items by order frequency
```

#### Class Diagram Relationships to Draw

| From | Relationship Type | To | Label / Multiplicity |
|------|------------------|-----|---------------------|
| Customer | extends (solid arrow, hollow triangle) | User | inheritance |
| Shopkeeper | extends (solid arrow, hollow triangle) | User | inheritance |
| MenuCategory | implements (dashed arrow, hollow triangle) | MenuComponent | interface |
| MenuItem | implements (dashed arrow, hollow triangle) | MenuComponent | interface |
| MenuCategory | composition (filled diamond) | MenuComponent | 1 contains 0..* |
| Order | composition (filled diamond) | OrderItem | 1 contains 1..* |
| Cart | composition (filled diamond) | CartItem | 1 contains 0..* |
| CustomerNotifier | implements (dashed) | IObserver | interface |
| InventoryUpdater | implements (dashed) | IObserver | interface |
| InAppNotificationAdapter | implements (dashed) | INotificationService | interface |
| EmailAdapter | implements (dashed) | INotificationService | interface |
| OrderEventEmitter | association (solid line) | IObserver | 1 notifies 0..* |
| StandardOrderProcessor | extends | OrderProcessor | inheritance |
| DailyReportStrategy | implements (dashed) | IReportStrategy | interface |
| WeeklyReportStrategy | implements (dashed) | IReportStrategy | interface |
| TopItemsStrategy | implements (dashed) | IReportStrategy | interface |
| UserFactory | dependency (dashed arrow) | Customer | creates |
| UserFactory | dependency (dashed arrow) | Shopkeeper | creates |

### 14.2 Use Case Diagram

The Use Case Diagram shows the system boundary (CAMS), two actors (Customer and Shopkeeper), and all use cases mapped to each actor.

**Actors**
- Customer — A student or staff member who uses the app to browse and order
- Shopkeeper — The shop owner or staff who manages the shop via the admin panel

**System Boundary: CAMS**

**Customer Use Cases (inside system boundary)**
- UC01: Register Account
- UC02: Login
- UC03: Browse Menu (view categories and items)
- UC04: Search / Filter Menu Items
- UC05: Add Item to Cart
- UC06: Update Cart (change quantity, remove item)
- UC07: Place Order (convert cart to order)
- UC08: View Order Confirmation (see Order ID)
- UC09: Track Order Status (PENDING / READY / PICKED_UP)
- UC10: View Order History
- UC11: Rate and Review a Menu Item
- UC12: View Reviews for an Item

**Shopkeeper Use Cases (inside system boundary)**
- UC13: Login (Shopkeeper role)
- UC14: Add Menu Item
- UC15: Edit Menu Item (name, price, description, image)
- UC16: Remove Menu Item
- UC17: View Inventory
- UC18: Update Stock Count for an Item
- UC19: View All Orders (filterable by status)
- UC20: Update Order Status (PENDING → READY → PICKED_UP)
- UC21: View Sales Summary Report
- UC22: View Top Ordered Items Report

**Include / Extend Relationships**

| Use Case | Relationship | Depends On / Extends |
|----------|-------------|---------------------|
| UC05: Add to Cart | <<include>> | UC03: Browse Menu (must browse to add) |
| UC07: Place Order | <<include>> | UC05: Cart must have items |
| UC08: View Order Confirmation | <<include>> | UC07: Place Order |
| UC11: Rate Item | <<extend>> | UC10: View Order History (only from completed orders) |
| UC18: Update Stock | <<include>> | UC17: View Inventory |
| UC20: Update Order Status | <<include>> | UC19: View All Orders |
| UC02 / UC13: Login | <<include>> | All protected use cases require login |

**How to Draw This Diagram**
- Draw a large rectangle labeled 'CAMS System Boundary'
- Place a stick figure labeled 'Customer' to the left of the rectangle
- Place a stick figure labeled 'Shopkeeper' to the right of the rectangle
- Draw oval bubbles inside the rectangle for each use case (UC01–UC22)
- Group Customer use cases (UC01–UC12) on the left side, Shopkeeper (UC13–UC22) on the right
- Draw solid lines from each actor to their use cases
- Draw dashed arrows with <<include>> or <<extend>> labels for dependencies
- Note: Both actors share UC02 (Login) — draw lines from both stick figures to the Login oval

### 14.3 Sequence Diagram — Place Order Workflow

The sequence diagram illustrates the most important workflow in CAMS: a customer placing an order. This covers the Template Method pattern, Observer pattern, and inventory management in one flow.

**Participants (left to right)**
- Customer (actor)
- :Next.js Frontend
- :Express API
- :AuthMiddleware
- :OrderController
- :OrderProcessor (Template)
- :InventoryService
- :OrderEventEmitter
- :CustomerNotifier
- :PostgreSQL (via Prisma)

**Sequence of Messages**

| Step | From → To | Message / Action |
|------|-----------|-----------------|
| 1 | Customer → Frontend | Clicks 'Place Order' on cart page |
| 2 | Frontend → Express API | POST /orders  { Authorization: Bearer <JWT> } |
| 3 | Express API → AuthMiddleware | validateToken(JWT) |
| 4 | AuthMiddleware → Express API | return { userId, role: CUSTOMER } |
| 5 | Express API → OrderController | placeOrder(userId, cartId) |
| 6 | OrderController → OrderProcessor | processOrder(userId, cartId)  [Template invoked] |
| 7 | OrderProcessor → PostgreSQL | SELECT cart + cartItems WHERE cartId |
| 8 | PostgreSQL → OrderProcessor | return Cart with items |
| 9 | OrderProcessor → OrderProcessor | validate(cart) — check cart not empty |
| 10 | OrderProcessor → InventoryService | reserveStock(cartItems) |
| 11 | InventoryService → PostgreSQL | UPDATE inventoryItem SET stockCount -= qty FOR EACH item (transaction) |
| 12 | PostgreSQL → InventoryService | return updated inventory rows |
| 13 | InventoryService → OrderProcessor | return success |
| 14 | OrderProcessor → PostgreSQL | INSERT Order + OrderItems, generate UUID |
| 15 | PostgreSQL → OrderProcessor | return created Order with id |
| 16 | OrderProcessor → PostgreSQL | DELETE Cart items (clear cart) |
| 17 | OrderProcessor → OrderEventEmitter | notify({ type: ORDER_PLACED, order }) |
| 18 | OrderEventEmitter → CustomerNotifier | update({ type: ORDER_PLACED, order }) |
| 19 | CustomerNotifier → Customer | Order Confirmed! Your Order ID is #XXXX |
| 20 | OrderProcessor → OrderController | return Order |
| 21 | OrderController → Express API | return 201 Created { orderId, status, total } |
| 22 | Express API → Frontend | 201 { orderId, status: PENDING, totalAmount } |
| 23 | Frontend → Customer | Show Order Confirmation screen with Order ID |

**Alt / Error Flows to Show**
- Alt [cart is empty]: Step 9 validate() throws ValidationError → API returns 400 Bad Request 'Cart is empty'
- Alt [item out of stock]: Step 11 InventoryService finds stockCount = 0 → throws StockError → API returns 409 Conflict 'Item X is out of stock'
- Alt [invalid JWT]: Step 4 AuthMiddleware rejects → API returns 401 Unauthorized

**How to Draw This Diagram**
- Draw each participant as a box at the top with a vertical dashed lifeline going down
- Number each message as a horizontal arrow between lifelines (solid arrow = synchronous call, dashed arrow = return)
- Use a narrow rectangle (activation bar) on a lifeline to show when that object is active/processing
- Wrap steps 9–16 in an 'opt' or 'loop' fragment box if showing the stock reservation loop per item
- Add an 'alt' fragment box for the error flows at the bottom

### 14.4 ER Diagram — Drawing Guide

The full entity list and attributes are in Section 8. Below is the complete drawing specification.

**Entities to Draw (rectangles)**
- User, MenuCategory, MenuItem, InventoryItem, Cart, CartItem, Order, OrderItem, Review

**Attributes (ovals attached to entity rectangles)**
- User: id (underlined = PK), name, email, passwordHash, role, createdAt
- MenuItem: id (PK), name, description, price, imageUrl, isAvailable, categoryId (FK)
- MenuCategory: id (PK), name, description
- InventoryItem: id (PK), menuItemId (FK, underlined dashed = FK), stockCount, lowStockThreshold, updatedAt
- Cart: id (PK), customerId (FK), createdAt
- CartItem: id (PK), cartId (FK), menuItemId (FK), quantity
- Order: id (PK), customerId (FK), status, totalAmount, createdAt, updatedAt
- OrderItem: id (PK), orderId (FK), menuItemId (FK), quantity, priceAtTime
- Review: id (PK), customerId (FK), menuItemId (FK), orderId (FK), rating, comment, createdAt

**Relationships (diamonds) and Cardinality**

| Relationship Diamond | Entity A (side) | Cardinality | Entity B (side) |
|---------------------|-----------------|-------------|-----------------|
| places | User (Customer) | 1 : N | Order |
| contains_order | Order | 1 : N | OrderItem |
| references_item | MenuItem | 1 : N | OrderItem |
| groups | MenuCategory | 1 : N | MenuItem |
| tracks | MenuItem | 1 : 1 | InventoryItem |
| owns | User (Customer) | 1 : 1 | Cart |
| contains_cart | Cart | 1 : N | CartItem |
| includes | MenuItem | 1 : N | CartItem |
| writes | User (Customer) | 1 : N | Review |
| reviewed_in | MenuItem | 1 : N | Review |
| verifies | Order | 1 : N | Review |

- Use crow's foot notation at the 'many' end (N side) of each relationship line
- Use a single vertical bar at the '1' end
- For the 1:1 relationships (MenuItem–InventoryItem, User–Cart) use single bars on both ends
- Primary keys are underlined in the attribute ovals
- Foreign keys can be shown as dashed underlined or with a separate notation

### 14.5 Sequence Diagram — Update Order Status Workflow

This second sequence diagram covers the shopkeeper-side workflow and demonstrates the Observer pattern firing on status change.

**Participants (left to right)**
- Shopkeeper (actor)
- :Next.js Frontend (Shopkeeper Panel)
- :Express API
- :AuthMiddleware
- :RoleGuard
- :OrderController
- :OrderService
- :OrderEventEmitter
- :CustomerNotifier
- :PostgreSQL (via Prisma)

**Sequence of Messages**

| Step | From → To | Message / Action |
|------|-----------|------------------|
| 1 | Shopkeeper → Frontend | Clicks 'Mark Ready' on order card |
| 2 | Frontend → Express API | PATCH /orders/:id/status { status: READY, Authorization: Bearer <JWT> } |
| 3 | Express API → AuthMiddleware | validateToken(JWT) |
| 4 | AuthMiddleware → Express API | return { userId, role: SHOPKEEPER } |
| 5 | Express API → RoleGuard | requireShopkeeper(req) |
| 6 | RoleGuard → Express API | pass (role === SHOPKEEPER) |
| 7 | Express API → OrderController | updateStatus(orderId, READY) |
| 8 | OrderController → OrderService | updateStatus(orderId, READY) |
| 9 | OrderService → OrderService | validateTransition(PENDING → READY) — state machine check |
| 10 | OrderService → PostgreSQL | UPDATE order SET status = READY, updatedAt = NOW() WHERE id = orderId |
| 11 | PostgreSQL → OrderService | return updated Order |
| 12 | OrderService → OrderEventEmitter | notify({ type: STATUS_CHANGED, order, newStatus: READY }) |
| 13 | OrderEventEmitter → CustomerNotifier | update({ type: STATUS_CHANGED, order, newStatus: READY }) |
| 14 | CustomerNotifier → Customer | Your order #XXXX is READY for pickup! |
| 15 | OrderService → OrderController | return updated Order |
| 16 | OrderController → Express API | return 200 OK { orderId, status: READY } |
| 17 | Express API → Frontend | 200 { orderId, status: READY, updatedAt } |
| 18 | Frontend → Shopkeeper | Order card updates to show READY status |

**Alt / Error Flows**
- Alt [invalid transition]: Step 9 — shopkeeper tries PICKED_UP → PENDING → OrderService throws InvalidTransitionError → API returns 400 'Invalid status transition'
- Alt [order not found]: Step 10 — orderId doesn't exist → Prisma returns null → API returns 404 'Order not found'
- Alt [customer tries this route]: Step 5 — RoleGuard rejects → API returns 403 Forbidden

---

## 15. Test Cases & Expected Results

Test cases are organized by module. Each test case includes ID, description, input, expected output, and pass/fail criteria. These should be executed manually during development and automated with Jest.

### 15.1 Auth Module Tests

| Test ID | Description | Input | Expected Output | Pass Criteria |
|---------|-------------|-------|-----------------|---------------|
| TC-AUTH-01 | Register new customer | name, email, password, role=CUSTOMER | 201 Created, JWT token returned | User record created in DB with hashed password |
| TC-AUTH-02 | Register with duplicate email | Existing email | 409 Conflict | Error message: 'Email already registered' |
| TC-AUTH-03 | Login with valid credentials | email, password | 200 OK, JWT token | Token contains userId and role |
| TC-AUTH-04 | Login with wrong password | email, wrong password | 401 Unauthorized | Error: 'Invalid credentials' |
| TC-AUTH-05 | Access protected route without JWT | No Authorization header | 401 Unauthorized | Request rejected before reaching controller |
| TC-AUTH-06 | Customer tries shopkeeper route | Valid customer JWT on POST /menu/items | 403 Forbidden | Role guard blocks request |

### 15.2 Menu Module Tests

| Test ID | Description | Input | Expected Output | Pass Criteria |
|---------|-------------|-------|-----------------|---------------|
| TC-MENU-01 | Get full menu (public) | GET /menu | 200 OK, array of categories with items | All available items returned, out-of-stock items hidden from customer view |
| TC-MENU-02 | Add menu item (shopkeeper) | POST /menu/items with valid data + shopkeeper JWT | 201 Created, new item returned | Item visible in GET /menu response |
| TC-MENU-03 | Edit menu item | PUT /menu/items/:id with updated price | 200 OK, updated item | New price reflected in GET /menu |
| TC-MENU-04 | Delete menu item | DELETE /menu/items/:id | 200 OK | Item no longer appears in GET /menu |
| TC-MENU-05 | Customer tries to add item | POST /menu/items with customer JWT | 403 Forbidden | Role guard blocks customer from shopkeeper routes |

### 15.3 Cart & Order Module Tests

| Test ID | Description | Input | Expected Output | Pass Criteria |
|---------|-------------|-------|-----------------|---------------|
| TC-CART-01 | Add item to cart | POST /cart/items { menuItemId, quantity: 2 } | 200 OK, updated cart | CartItem created, subtotal updated |
| TC-CART-02 | Add out-of-stock item | POST /cart/items with stockCount=0 item | 400 Bad Request | Error: 'Item is out of stock' |
| TC-CART-03 | Place order with valid cart | POST /orders with items in cart | 201 Created, Order with ID | Order in DB, cart cleared, inventory decremented |
| TC-CART-04 | Place order with empty cart | POST /orders with empty cart | 400 Bad Request | Error: 'Cart is empty' |
| TC-ORD-01 | Shopkeeper updates order to READY | PATCH /orders/:id/status { status: READY } | 200 OK, updated order | Customer can see status changed to READY |
| TC-ORD-02 | Customer cannot update order status | PATCH /orders/:id/status with customer JWT | 403 Forbidden | Role guard blocks customer |
| TC-ORD-03 | Get order history | GET /orders/my with customer JWT | 200 OK, array of orders | Only orders belonging to that customer returned |

### 15.4 Inventory Module Tests

| Test ID | Description | Input | Expected Output | Pass Criteria |
|---------|-------------|-------|-----------------|---------------|
| TC-INV-01 | View inventory | GET /inventory with shopkeeper JWT | 200 OK, all items with stock counts | Correct stock counts shown for each item |
| TC-INV-02 | Update stock count | PATCH /inventory/:itemId { stockCount: 20 } | 200 OK, updated inventory | New stock count persisted in DB |
| TC-INV-03 | Stock decrements on order | Place order for 3 units of item with stock=10 | Order placed successfully | Item stockCount becomes 7 |
| TC-INV-04 | Item hidden at zero stock | Item stockCount set to 0 | Item not in GET /menu response | isAvailable = false, item filtered from customer menu |
| TC-INV-05 | Low stock flag | Item stockCount drops below threshold (default 5) | Inventory shows lowStock: true flag | Shopkeeper can see warning indicator |

### 15.5 Reviews & Reports Module Tests

| Test ID | Description | Input | Expected Output | Pass Criteria |
|---------|-------------|-------|-----------------|---------------|
| TC-REV-01 | Submit review after pickup | POST /reviews for item in a PICKED_UP order | 201 Created, review saved | Review visible on GET /reviews/item/:id |
| TC-REV-02 | Submit review without purchase | POST /reviews for item not in any of customer's orders | 403 Forbidden | Error: 'You have not purchased this item' |
| TC-REV-03 | Submit review before pickup | POST /reviews for item in a PENDING order | 403 Forbidden | Error: 'Order not yet completed' |
| TC-RPT-01 | Get daily sales summary | GET /reports/summary?period=daily | 200 OK, total orders and revenue for today | Counts match actual orders in DB for today |
| TC-RPT-02 | Get top ordered items | GET /reports/top-items | 200 OK, items ranked by order frequency | Most ordered item appears first |

---

## 16. Updated GitHub README Template

*(See Section 11 for the full README template — it already includes all mandatory fields specified by the faculty.)*

---

## 17. Risk Register & Mitigations

This section documents every known failure point in the current plan — technical, design, and academic — along with concrete fixes. These should be addressed before or during implementation, not discovered during the live demo.

### 17.1 Critical Risks (must fix before coding begins)

#### RISK-01 — Inventory Race Condition on Concurrent Orders

| Attribute | Detail |
|-----------|--------|
| Severity | Critical |
| Description | Two students place orders for the last item simultaneously. Both pass the stock check before either decrements the count. Stock goes to -1. The system is logically broken. |
| When it happens | Any time more than one customer orders a low-stock item at the same time — very likely during peak lunch hour at Chai Adda |
| Fix | Wrap the entire order placement flow in a Prisma transaction with a SELECT FOR UPDATE lock on the InventoryItem row. Use `prisma.$transaction()` in OrderProcessor.processOrder(). The stock check and the decrement must be atomic. |
| File | `src/patterns/OrderTemplate.ts` — inside reserveStock() method |

```typescript
await prisma.$transaction(async (tx) => {
  const inv = await tx.inventoryItem.findUnique({ where: { menuItemId } });
  if (inv.stockCount < qty) throw new StockError();
  await tx.inventoryItem.update({
    where: { menuItemId },
    data: { stockCount: { decrement: qty } }
  });
  await tx.order.create({ ... });
});
```

#### RISK-02 — Role Guard Only on Frontend

| Attribute | Detail |
|-----------|--------|
| Severity | Critical |
| Description | If role-based access control only exists on the Next.js frontend (hiding the shopkeeper panel from customers), any customer can call POST /menu/items directly via curl or Postman and add or delete menu items. |
| When it happens | Immediately — any technical user with the API URL can bypass the UI |
| Fix | Create a roleGuard middleware in Express that checks req.user.role after JWT validation. Apply it to every shopkeeper route. The frontend check is just UX; the API check is security. |
| File | `src/middlewares/roleGuard.ts` |

```typescript
const requireShopkeeper = (req, res, next) => {
  if (req.user?.role !== 'SHOPKEEPER')
    return res.status(403).json({ error: 'Forbidden' });
  next();
};
router.post('/menu/items', authenticate, requireShopkeeper, menuController.addItem);
```

#### RISK-03 — Design Patterns Invisible to Evaluator

| Attribute | Detail |
|-----------|--------|
| Severity | Critical for academic submission |
| Description | All 7 patterns implemented perfectly but if they are not labelled in code and referenced in the README, the evaluator will not see them and mark them missing. This is a pure presentation risk, not a technical one. |
| When it happens | At evaluation — you lose marks for work you already did |
| Fix | Every pattern file must begin with a block comment: pattern name, problem it solves, participants, and where it is called from. The README patterns table must link to the exact file and line. |
| File | Top of every file in `src/patterns/` |

```typescript
/**
 * PATTERN: Singleton
 * PROBLEM: PrismaClient is expensive to instantiate — one instance must be shared app-wide.
 * PARTICIPANTS: DatabaseConnection (Singleton class)
 * USED BY: All service classes via DatabaseConnection.getInstance()
 */
```

### 17.2 High Risks (fix during Sprint 1–2)

#### RISK-04 — No Global Error Handling

| Attribute | Detail |
|-----------|--------|
| Severity | High |
| Description | Without a central error handler, unhandled Prisma errors will either crash the Express process or return a raw stack trace to the client exposing table names, file paths, and query details. |
| Fix | Add a global error middleware as the last `app.use()` call in Express. It should catch PrismaClientKnownRequestError separately (e.g. P2002 = unique constraint = 409 Conflict) and return clean JSON error responses. |
| File | `src/middlewares/errorHandler.ts` |

#### RISK-05 — CORS Not Configured

| Attribute | Detail |
|-----------|--------|
| Severity | High — blocks all frontend requests in development |
| Description | Next.js runs on port 3000, Express on port 3001. Browser enforces CORS — all API calls from the frontend will be blocked with a CORS error unless the API explicitly allows the frontend origin. |
| Fix | `npm install cors @types/cors`. In Express app.ts, add: `app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));` Add FRONTEND_URL to .env. |
| File | `src/app.ts` — add before route registration |

#### RISK-06 — No Database Seed for Demo

| Attribute | Detail |
|-----------|--------|
| Severity | High — demo looks empty and unprofessional |
| Description | Demonstrating an empty system to an evaluator is a missed opportunity. A live demo with realistic Chai Adda menu items, a few placed orders, and varied stock levels takes 10 minutes to build and makes the entire project look production-ready. |
| Fix | Create `prisma/seed.ts` with: 2–3 menu categories, 8–10 realistic menu items with prices matching the actual Chai Adda menu, 1 shopkeeper account, 2–3 customer accounts, a few orders in different statuses (PENDING, READY, PICKED_UP), some reviews. |
| File | `prisma/seed.ts` |

### 17.3 Medium Risks (fix during Sprint 3–4)

#### RISK-07 — Review Duplicate Guard Missing

| Attribute | Detail |
|-----------|--------|
| Severity | Medium |
| Description | Nothing prevents a customer from submitting multiple reviews for the same menu item from the same order. |
| Fix | Add a unique constraint in Prisma schema: `@@unique([customerId, menuItemId, orderId])` on the Review model. |
| File | `prisma/schema.prisma` — Review model |

#### RISK-08 — Cart Broken When Item Deleted

| Attribute | Detail |
|-----------|--------|
| Severity | Medium |
| Description | If shopkeeper deletes a MenuItem that is currently in a customer's Cart, the CartItem has a dangling foreign key. |
| Fix (recommended) | Add `onDelete: Cascade` to the CartItem.menuItem relation in Prisma schema. When MenuItem is deleted, all CartItems referencing it are automatically removed. |
| File | `prisma/schema.prisma` — CartItem model relation |

#### RISK-09 — Order + Inventory Not in One Transaction

| Attribute | Detail |
|-----------|--------|
| Severity | Medium — data consistency issue |
| Description | If the Order is created successfully but the inventory decrement fails, you have a confirmed order for an item that still shows full stock. |
| Fix | Same `prisma.$transaction()` fix as RISK-01. Both must succeed or both must roll back. |
| File | `src/patterns/OrderTemplate.ts` |

#### RISK-10 — No Input Validation

| Attribute | Detail |
|-----------|--------|
| Severity | Medium |
| Description | Without validation, a customer can POST /cart/items with quantity: -5 or POST /reviews with rating: 999. |
| Fix | Use zod for schema validation. Create a validator for each request body. `npm install zod` |
| File | `src/validators/` — one file per module |

### 17.4 Low / Watch Risks

| Risk | Description | Simple Fix |
|------|-------------|-----------|
| RISK-11 — No pagination | GET /orders returns all orders — fine for demo, will time out with real usage | Add ?page=1&limit=20 query params using Prisma skip/take |
| RISK-12 — Price changes corrupt history | If shopkeeper edits a MenuItem price, all old OrderItems show the new price retroactively | Already handled — OrderItem.priceAtTime snapshot. Just make sure it's populated on order creation. |
| RISK-13 — No .env.example | Team members have no idea what env vars are needed | Commit a .env.example with all keys but no values. |
| RISK-14 — JWT secret in code | If JWT_SECRET is accidentally hardcoded or committed, all tokens are compromised | Use dotenv, add .env to .gitignore, verify .gitignore before first push |
| RISK-15 — No loading / error states in UI | API calls that fail silently leave users staring at a blank screen during demo | Add try/catch to every API call in Next.js, show a toast or error message on failure |

---

## 18. Suggested Improvements

These improvements go beyond the minimum submission requirements. They strengthen the academic submission and make CAMS genuinely pitch-ready for the Chai Adda owner.

> **Note:** No additional design patterns beyond the 7 listed (Singleton, Factory, Adapter, Composite, Observer, Strategy, Template Method) will be used. Existing patterns may be reused in multiple places. Only the 4 UML diagram types (Class, Use Case, Sequence, ER) are used — additional instances of the same type are allowed.

### 18.1 Improvements for Academic Submission

#### IMP-01 — TypeScript Strict Mode

| Attribute | Detail |
|-----------|--------|
| What | Enable `strict: true` in tsconfig.json |
| Why | Forces explicit null checks, no implicit any, strict function types. Every line of code becomes demonstrably type-safe — directly shows OOP + TypeScript mastery to evaluator. |
| Impact | You will catch potential runtime bugs at compile time. Prisma's generated types already align with strict mode — minimal extra work. |

```json
{ "compilerOptions": { "strict": true, "noImplicitAny": true, "strictNullChecks": true } }
```

#### IMP-02 — Add Swagger / OpenAPI Documentation

| Attribute | Detail |
|-----------|--------|
| What | Auto-generate interactive API documentation from your Express routes |
| Why | Evaluator can see and test every endpoint at /api/docs without running the frontend. Demonstrates professional engineering practice. |
| Install | `npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express` |
| File | `src/config/swagger.ts` |

#### IMP-03 — Enum-driven Order Status with State Machine Logic

| Attribute | Detail |
|-----------|--------|
| What | Enforce valid order status transitions — PENDING can only go to READY, READY can only go to PICKED_UP. Reverse transitions should be rejected. |
| Why | Currently nothing stops a shopkeeper from marking a PICKED_UP order back to PENDING. Adding transition validation shows State Machine understanding. |
| File | `src/services/OrderService.ts` — updateStatus() method |

```typescript
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['READY'],
  READY: ['PICKED_UP'],
  PICKED_UP: []
};
if (!validTransitions[current].includes(next))
  throw new Error('Invalid status transition');
```

#### IMP-04 — Centralized Error Hierarchy using OOP Inheritance

| Attribute | Detail |
|-----------|--------|
| What | Create a custom error class hierarchy: `AppError` (abstract base) → `ValidationError`, `AuthError`, `NotFoundError`, `StockError` |
| Why | Demonstrates Inheritance (OOP) and SRP (SOLID) in error handling. The global error handler can use `instanceof` checks (Polymorphism) to return the right HTTP status code. |
| Pattern reuse | Factory pattern — `ErrorFactory.create(type, message)` to construct the right error subclass |
| File | `src/utils/errors.ts` |

```typescript
abstract class AppError extends Error {
  abstract statusCode: number;
  abstract toJSON(): { error: string; details?: any };
}
class ValidationError extends AppError { statusCode = 400; }
class NotFoundError extends AppError { statusCode = 404; }
class StockError extends AppError { statusCode = 409; }
```

#### IMP-05 — Observer Pattern for Real-time Dashboard Updates

| Attribute | Detail |
|-----------|--------|
| What | Reuse the Observer pattern for SSE (Server-Sent Events) — when order status changes, push updates to connected shopkeeper dashboards in real time |
| Why | Shows Observer pattern used a third time for a genuinely different purpose (real-time push), demonstrating deep understanding of the pattern |
| Pattern reuse | Observer (same IObserver interface, new DashboardUpdater observer) |
| File | `src/patterns/OrderObserver.ts` — add `DashboardUpdater` class |

### 18.2 Improvements for Real-World Pitch

#### IMP-06 — Order Queue Display (Kitchen View)

| Attribute | Detail |
|-----------|--------|
| What | A simplified read-only screen the shopkeeper can put on a tablet at the counter showing all PENDING orders in real time |
| Why | This is the most visually impactful feature for the pitch. The owner sees his counter digitised in one demo. |
| Tech | Uses the Observer-based SSE from IMP-05. No new backend needed — just a new view consuming the event stream. |

#### IMP-07 — QR Code for Menu

| Attribute | Detail |
|-----------|--------|
| What | Generate a QR code that links directly to the CAMS customer menu. Print it and stick it on every table at Chai Adda. |
| Why | Removes friction completely — students don't need to know the URL. Scan → menu → order. |
| Tech | `npm install qrcode`. One endpoint: GET /qr returns a PNG of the QR code pointing to the frontend URL. |

#### IMP-08 — Estimated Wait Time

| Attribute | Detail |
|-----------|--------|
| What | Show customers a rough estimated wait time based on the number of PENDING orders ahead of them |
| Why | The most common frustration with manual ordering is not knowing how long to wait. |
| Simple version | Count PENDING orders × average prep time (configurable by shopkeeper, e.g. 3 minutes per order). Show: 'Est. wait: ~12 minutes' |
| File | `src/services/OrderService.ts` — add getEstimatedWait() method |

#### IMP-09 — Favourite Items for Repeat Customers

| Attribute | Detail |
|-----------|--------|
| What | Let customers mark items as favourites and show a 'Quick Reorder' section at the top of their menu |
| Why | Chai Adda has regular customers who order the same thing daily. This saves them time and increases engagement. |
| DB change | New `Favourite` entity: customerId (FK) + menuItemId (FK), `@@unique([customerId, menuItemId])` |
| Endpoints | POST /favourites, DELETE /favourites/:itemId, GET /favourites |

### 18.3 Code Quality Improvements

| Improvement | What to do | Why it matters |
|------------|-----------|---------------|
| Add ESLint + Prettier | `npm install eslint prettier eslint-config-prettier`. Add .eslintrc and .prettierrc. | Consistent code style across the project. Evaluator sees professional tooling. |
| Add Jest unit tests | Write tests for at least OrderService and InventoryService using Jest + ts-jest. Mock Prisma with jest-mock-extended. | Test cases in Section 15 need actual results. Even 5–6 passing tests is strong evidence of quality. |
| Use environment-based config | Create `src/config/env.ts` that reads and validates all env vars at startup using zod (Singleton pattern reuse). App fails fast with a clear message if JWT_SECRET is missing. | Prevents mysterious runtime failures from missing config. Shows defensive programming. |
| Add request logging | Use morgan middleware for HTTP request logging in development. `npm install morgan @types/morgan` — two lines of code. | Helps debug issues during live demo. |
| Git commit hygiene | Use conventional commits: feat:, fix:, refactor:, docs:. Since individual commits are verified by faculty, message quality matters. | Each commit tells a story of structured development — directly evaluated by faculty. |
| DTOs with TypeScript interfaces | Create `src/models/dtos.ts` with typed request/response interfaces for every endpoint. | Shows Abstraction (OOP) and type safety. Controllers and services communicate through well-defined contracts. |
