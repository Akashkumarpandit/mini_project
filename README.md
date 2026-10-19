# 🏙️ HavenStay — Premium Full-Stack Property Rental Marketplace

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Akashkumarpandit/mini_project)
[![Live Demo](https://img.shields.io/badge/Live-Demo%20Link-brightgreen?logo=google-chrome)](https://rich-brooms-serve.loca.lt)
[![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![OpenAPI](https://img.shields.io/badge/Swagger-OpenAPI%203-green?logo=swagger)](http://localhost:8080/swagger-ui/index.html)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> A modern, enterprise-grade property rental marketplace engineered to bridge the trust and efficiency gap between **Tenants**, **Property Owners**, **Real Estate Agents**, and **Platform Administrators**.

---

## 🌐 Live Access Links & Repositories

| Environment / Service | Access URL | Credentials / Notes |
| :--- | :--- | :--- |
| **Public Live Web App** | [https://rich-brooms-serve.loca.lt](https://rich-brooms-serve.loca.lt) | *Tunnel Password (if prompted):* `152.57.171.21` |
| **GitHub Source Code** | [https://github.com/Akashkumarpandit/mini_project](https://github.com/Akashkumarpandit/mini_project) | Official repository on branch `main` |
| **Local Web Application** | [http://localhost:5173](http://localhost:5173) | Frontend dev server |
| **Interactive Swagger API Docs** | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) | OpenAPI 3 testing console |
| **H2 Database Console** | [http://localhost:8080/h2-console](http://localhost:8080/h2-console) | JDBC: `jdbc:h2:mem:authdb`, User: `sa`, Pwd: *(empty)* |

---

## 🎯 The Real-World Problem We Are Solving

The modern property rental market is characterized by acute friction, trust deficits, and operational inefficiencies that cost renters and property owners millions of dollars annually:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      REAL-WORLD MARKET CHALLENGES                      │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. Double-Booking Catastrophes │ Concurrent reservations cause overlap │
│ 2. Rental Fraud & Fake Hosts   │ Ghost listings & deceptive photography│
│ 3. Hidden Fees & Price Shock   │ Surprise deposits & opaque costs      │
│ 4. Disconnected Communications │ Missed viewing appointments & leases  │
│ 5. Operational Overhead        │ Disjointed spreadsheets & lost leads  │
└────────────────────────────────┴───────────────────────────────────────┘
```

### 1. The Double-Booking & Race-Condition Problem
- **The Issue:** Traditional listing boards and poorly architected platforms lack atomic reservation isolation. When two prospective tenants click "Book Now" within the same window, both reservations are accepted. One tenant is left stranded upon arrival, leading to payment disputes, emergency accommodation expenses, and reputational damage.
- **How HavenStay Solves It:** Built-in atomic conflict detection at the database and service layer. All reservation requests run inside `@Transactional(isolation = Isolation.SERIALIZABLE)` boundaries checking date overlaps (`existing.startDate < requested.endDate AND existing.endDate > requested.startDate`). Double bookings are programmatically impossible.

### 2. The Rental Fraud & "Ghost Listing" Dilemma
- **The Issue:** Unverified marketplaces allow anyone to post fake properties, collect upfront security deposits, and vanish. Tenants arrive at an address only to discover the property does not exist or is already occupied.
- **How HavenStay Solves It:** A multi-tier trust model. Property owners undergo administrative verification before receiving the "Verified Host" badge. All listings undergo moderation review, and an in-app reporting system enables tenants to flag suspicious listings directly to admins with instant review workflows.

### 3. Hidden Costs & Opaque Pricing
- **The Issue:** Renters often find a listing advertised at $2,000/month, only to discover surprise cleaning fees, utility markups, and unstated deposit requirements on the lease signing day.
- **How HavenStay Solves It:** Mandatory upfront cost transparency. Every property discloses the base rent, security deposit, cleaning fees, and currency. The dynamic checkout widget calculates exact grand totals before any payment is initiated.

### 4. Scattered Scheduling & Lost Follow-ups
- **The Issue:** Landlords and agents juggle inquiries across WhatsApp, email, and phone calls. Scheduled viewings are forgotten, move-in dates slip, and routine property inspections are neglected.
- **How HavenStay Solves It:** Integrated Task & Calendar Engine. Inquiries directly generate actionable lead records (`NEW` ➔ `CONTACTED` ➔ `SCHEDULED` ➔ `CLOSED`). The monthly calendar syncs upcoming bookings, viewing appointments, follow-up reminders, and inspections with priority tags and completion toggles.

---

## 💡 How HavenStay Helps Different Stakeholders

### 👨‍👩‍👧 For Tenants (Renters)
- **Zero-Surprise Browsing:** Filter by exact budget, bedroom/bathroom counts, pet policies, amenities, and verified hosts.
- **Instant Comparison:** Compare up to 4 properties side-by-side on price, deposit, and specifications.
- **Authentic Reviews:** Verified reviews tied to real bookings prevent fabricated 5-star ratings.
- **Protected Booking Workflow:** Clear reservation statuses (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`) with sandbox payment receipts.
- **Direct Host Communication:** Send viewing requests and property inquiries without exposing sensitive private phone numbers.

### 🏢 For Property Owners & Landlords
- **Complete Listing Control:** Create, edit, pause, publish, and delete properties with high-res photos and rules.
- **Approval Pipeline:** Review tenant requests with complete guest count, dates, and special requests before accepting or rejecting.
- **Occupancy & Revenue Metrics:** Real-time dashboard showing active inventory, upcoming viewings, and booking pipeline.

### 👔 For Real Estate Agents & Brokers
- **Client Lead Tracking:** Manage incoming enquiries, schedule viewing visits, and update status from a centralized inbox.
- **Multi-Property Management:** Coordinate across multiple listings with granular specifications and pricing tiers.

### 🛡️ For Platform Administrators
- **Governance & Moderation:** Approve new listings, suspend bad actors, and resolve tenant moderation reports.
- **System Audit Logs:** Immutable trail recording administrative actions for accountability and compliance.
- **Platform Analytics:** Real-time metrics tracking registered accounts, active listings, and completed bookings.

---

## 🏗️ System Architecture

```
                    ┌──────────────────────────────────────────┐
                    │               CLIENT LAYER               │
                    │   React 18 + Vite 5 + CSS Modules        │
                    │   Responsive Web UI / Mobile Drawer      │
                    └─────────────────────┬────────────────────┘
                                          │ HTTP / REST (JWT)
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │               API GATEWAY                │
                    │   Vite Proxy (Dev) / Nginx (Prod)        │
                    │   Port 8080 / Swagger OpenAPI Docs       │
                    └─────────────────────┬────────────────────┘
                                          │
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │              BACKEND LAYER               │
                    │   Spring Boot 3.2.3 (Java 17)            │
                    │   Spring Security 6 (Stateless JWT)      │
                    │   RBAC: TENANT | OWNER | AGENT | ADMIN   │
                    │   Transactional Anti-Collision Services  │
                    └─────────────────────┬────────────────────┘
                                          │ Spring Data JPA
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │              DATABASE LAYER              │
                    │   • Development: In-Memory H2 DB         │
                    │   • Production: MySQL 8.x Dialect        │
                    │   • Auto-seeded with 8 rich properties   │
                    └──────────────────────────────────────────┘
```

---

## 🔑 Demo Seed Accounts (Instant Access)

The application automatically seeds 4 distinct accounts populated with realistic listings, reviews, bookings, and reminders:

| Role | Username | Password | Purpose / Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `admin123` | Platform analytics, user accounts, listing moderation, audit logs |
| **OWNER** | `sarah_owner` | `owner123` | Portfolio management, booking approval pipeline, enquiry inbox |
| **AGENT** | `marcus_agent` | `agent123` | Multi-property management, viewing scheduling, client leads |
| **TENANT** | `alex_tenant` | `tenant123` | Property search, booking requests, sandbox payments, reviews |

> ⚡ **Quick Test Tip:** On the `/login` screen, use the **1-Click Demo Login** buttons to sign in as any role instantly without typing!

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Java 17** or higher (`java -version`)
- **Maven 3.9+** (`mvn -v`)
- **Node.js 18+** (`node -v`) & **npm 10+**

### 1. Clone the Repository
```bash
git clone https://github.com/Akashkumarpandit/mini_project.git
cd mini_project
```

### 2. Start Backend (Spring Boot)
```bash
cd auth-backend
mvn spring-boot:run
```
- Server starts on `http://localhost:8080`
- Swagger UI available at `http://localhost:8080/swagger-ui/index.html`
- H2 Console available at `http://localhost:8080/h2-console`

### 3. Start Frontend (React + Vite)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Web application opens on `http://localhost:5173`

*(Convenience scripts in root `package.json`: `npm run dev` and `npm run backend`)*

---

## 🧪 Testing & Validation

### Backend Automated Test Suite
Includes unit, repository, and service integration tests validating security isolation and concurrency checks:
```bash
cd auth-backend
mvn clean test
```
```text
[INFO] Tests run: 2, Failures: 0, Errors: 0 -- in com.example.auth.BookingServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0 -- in com.example.auth.AuthServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0 -- in com.example.auth.ListingServiceTest
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS (6 tests run, 0 failures, 0 errors)
[INFO] ------------------------------------------------------------------------
```

### Frontend Production Build
```bash
cd frontend
npm run build
```
- Succeeded in `< 500ms` with zero warnings and optimized gzip assets.

---

## 🔒 Security Configuration Highlights

- **Stateless JWT Tokens:** 256-bit HMAC signing; expiration enforced on every authenticated endpoint.
- **BCrypt Password Hashing:** Salted key derivation for all stored user credentials.
- **Ownership Verification:** Service methods verify `listing.getOwner().getId().equals(currentUser.getId())` before allowing updates or deletions.
- **Public Browsing:** Unauthenticated guests can search listings, view photos, and read reviews without exposing private owner contact details.
- **CORS Protection:** Configured with explicit origin allowances (`http://localhost:5173`) and credential support.
- **Zero Leaked Secrets:** Environment variable templates (`.env.example`) and `.gitignore` prevent credential exposure in source control.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
