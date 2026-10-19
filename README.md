# 🏙️ HavenStay — Premium Full-Stack Property Rental Marketplace

A full-stack, enterprise-grade property rental marketplace engineered with **React 18** (Vite, CSS Modules) and **Spring Boot 3** (Java 17, Spring Data JPA, Spring Security, JWT, JJWT).

Designed for modern real estate marketplaces with multi-role architecture, strict availability conflict enforcement, real-time metrics, interactive calendar agendas, and comprehensive admin governance.

---

## 🌟 Key Architecture & Features

### 1. 🛡️ Role-Based Authentication & Security
- **Roles:** `TENANT`, `OWNER`, `AGENT`, `ADMIN`.
- **JWT (Stateless Bearer Tokens):** 256-bit HMAC signing with token expiration checks and user context hydration.
- **BCrypt Password Hashing:** Salted key derivation for all stored credentials.
- **Ownership Isolation:** Service-level verification ensures owners can only mutate their own listings, tenants can only access their own bookings/enquiries, and administrators moderate the platform.
- **Data Protection:** Passwords omitted via `@JsonIgnore`; public endpoints restricted to read-only browsing.
- **One-Click Demo Sign-in:** Instant demo login buttons on the login page for rapid evaluation across all 4 roles.

### 2. 🏡 Public Property Marketplace (`/properties`)
- **Live Platform Metrics:** Real-time statistics banner showing total listings, available inventory, and average rent calculated directly from the database.
- **Granular Multi-Filter Engine:**
  - Search by title, city, neighborhood, and keyword.
  - Category / type filtering (Apartment, House, Villa, Studio, Penthouse).
  - Price range slider with numeric min/max bounds.
  - Bedroom & bathroom count toggles.
  - Furnished status and required amenities.
  - Verified host filter and Availability-only mode.
- **Sorting Options:** Price: Low to High, Price: High to Low, Highest Rated, Newest Additions, Relevance.
- **Dual Presentation:** List View and Interactive Map View (with graceful fallback when map tiles are unconfigured).
- **Comparison Drawer:** Side-by-side comparison of up to 4 listings across price, specifications, deposit, and amenities.
- **Live vs. Demo Resilience:** Dynamic banner clearly informs users whether they are viewing live backend data or standalone demo fallback dataset.

### 3. 🔍 Dedicated Property Details (`/properties/:id`)
- **Full Image Gallery & Lightbox:** High-resolution property photography with thumbnail navigation and full-screen lightbox modal.
- **Detailed Property Specs:** Beds, baths, square footage, deposit, cleaning fee, and house rules.
- **Host Profile & Verification:** Verified host badge and direct enquiry modal.
- **Verified Reviews & Star Ratings:** Authentic ratings submitted by verified guests with average breakdown.
- **Real-Time Booking Engine:** Check-in/check-out date picker with guest count and live subtotal, fees, and grand total computation.
- **Interactive Payment Sandbox Modal:** Development payment gateway simulating instant card confirmation, card validation, and receipt generation.
- **Similar Listings Carousel:** Recommended properties matching location and category.
- **Share & Report Listing:** Copy direct link with toast confirmation and submit moderation reports to platform admins.

### 4. 📅 Booking Engine & Double-Booking Prevention
- **Strict Availability Enforcement:** Prevents double-booking via atomic SQL overlap checks:
  ```sql
  SELECT b FROM Booking b 
  WHERE b.listing.listingId = :listingId 
    AND b.bookingStatus IN ('CONFIRMED', 'PENDING') 
    AND b.startDate < :endDate 
    AND b.endDate > :startDate
  ```
- **Transactional Integrity:** Executed within `@Transactional(isolation = Isolation.SERIALIZABLE)` boundary to eliminate race conditions under concurrent booking attempts.
- **Lifecycle Transitions:** `PENDING` ➔ `CONFIRMED` ➔ `COMPLETED` or `CANCELLED` / `REJECTED` (with reason).

### 5. 📊 Role-Aware Dashboard (`/dashboard`)
- **Admin View:**
  - Platform-wide analytics (total revenue, active inventory, registered accounts, total bookings).
  - User Directory: Role management, verification status, and account suspension/reinstatement.
  - Listing Moderation: Approve or reject newly submitted listings.
  - Moderation Reports: Review user-reported flags with one-click resolution.
  - System Audit Logs: Real-time trail of administrative actions.
- **Owner & Agent View:**
  - Portfolio metrics: Published properties, pending bookings, active enquiries.
  - Listing Manager: Search, filter, edit, publish/unpublish, and delete listings.
  - Booking Approval Pipeline: Approve or reject reservation requests.
  - Client Enquiries: Reply to tenant inquiries and mark leads as contacted/closed.
- **Tenant View:**
  - Booking History: Upcoming and past stays with printable receipts and cancellation workflow.
  - Saved Favorites: Quick access to bookmarked properties.
  - My Enquiries: History of viewing requests and host messages.

### 6. 🗓️ Synchronized Calendar & Task Agenda (`/calendar`)
- Full interactive monthly grid with day agenda.
- Synchronized with real backend reminders and confirmed bookings.
- Create, filter, complete, and delete reminders by priority and category (Inspection, Viewing, Follow-up, Payment).

---

## 🛠️ Tech Stack & Prerequisites

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, React Router 6, Axios, Lucide React, CSS Modules |
| **Backend** | Java 17, Spring Boot 3.2.3, Spring Security 6, Spring Data JPA, JJWT 0.11.5 |
| **Database** | In-Memory H2 (default development) & MySQL 8.x (production profile) |
| **API Docs** | SpringDoc OpenAPI 3 / Swagger UI 2.3.0 |
| **Tooling** | Maven 3.9+, Node.js 18+ (tested with v24.8.0), npm 10+ |

---

## 🚀 Quick Start Guide

### 1. Clone & Setup Workspace
```bash
git clone https://github.com/Akashkumarpandit/mini_project.git
cd mini_project
```

### 2. Backend Setup & Run (Spring Boot)
The backend uses Java 17 and Maven. It runs with an in-memory H2 database by default, seeded automatically with 4 demo accounts, categories, 8 high-res listings, reviews, bookings, and reminders.

```bash
cd auth-backend

# Run test suite to verify everything passes:
mvn test

# Start the Spring Boot application:
mvn spring-boot:run
```
- **Backend Port:** `http://localhost:8080`
- **Swagger UI Interactive Documentation:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI JSON Spec:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- **H2 Database Console:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - **JDBC URL:** `jdbc:h2:mem:authdb`
  - **User:** `sa`
  - **Password:** *(empty)*

### 3. Frontend Setup & Run (React / Vite)
Open a separate terminal:
```bash
cd frontend

# Install dependencies:
npm install

# Start the Vite development server:
npm run dev
```
- **Frontend Port:** `http://localhost:5173`
- All `/api` requests are automatically proxied to `http://localhost:8080`.

Alternatively, from the project root directory, run both using the root convenience scripts:
```bash
npm run dev      # Runs frontend
npm run backend  # Runs Spring Boot backend
```

---

## 👥 Default Demo Credentials

The backend seeds the following accounts out of the box with realistic domain data:

| Role | Username | Password | Email | Features to Test |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `admin123` | `admin@havenstay.com` | User management, audit logs, listing approval, report handling |
| **OWNER** | `sarah_owner` | `owner123` | `sarah@havenstay.com` | Listing creation/editing, booking approvals, enquiry inbox |
| **AGENT** | `marcus_agent` | `agent123` | `marcus@havenstay.com` | Client lead tracking, scheduled viewings, property management |
| **TENANT** | `alex_tenant` | `tenant123` | `alex@havenstay.com` | Booking requests, sandbox payments, reviews, saved favorites |

> 💡 **Tip:** On the `/login` page, you can click any of the 4 quick-login buttons to test different roles instantly without typing credentials!

---

## 💾 Database Configuration Profiles

### Profile 1: In-Memory H2 (Default Dev)
Active by default (`SPRING_PROFILES_ACTIVE=dev` or empty). Requires zero external setup. Re-creates schema and seeds rich sample data upon each launch.

### Profile 2: MySQL 8.x (Persistent / Production)
To run with persistent MySQL:
1. Ensure MySQL is running on `localhost:3306` with database `authdb` created:
   ```sql
   CREATE DATABASE authdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Start the backend with the `mysql` profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```
   Or set environment variables in your shell or `.env`:
   ```bash
   export SPRING_PROFILES_ACTIVE=mysql
   export MYSQL_HOST=localhost
   export MYSQL_PORT=3306
   export MYSQL_DATABASE=authdb
   export MYSQL_USER=root
   export MYSQL_PASSWORD=your_mysql_password
   ```

---

## 📡 REST API Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user with designated role |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile of authenticated user |
| `GET` | `/api/listings` | Public | Search, filter, and paginate properties |
| `GET` | `/api/listings/{id}` | Public | Get detailed property specifications & images |
| `POST` | `/api/listings` | Owner / Agent / Admin | Create new property listing |
| `PUT` | `/api/listings/{id}` | Owner / Agent / Admin | Update listing (enforces ownership) |
| `DELETE` | `/api/listings/{id}` | Owner / Agent / Admin | Delete listing (enforces ownership) |
| `GET` | `/api/listings/my` | Authenticated | Fetch listings owned by current user |
| `GET` | `/api/categories` | Public | Retrieve property category taxonomy |
| `POST` | `/api/bookings` | Tenant / Authenticated | Request booking with anti-double-booking check |
| `GET` | `/api/bookings/my` | Authenticated | List current user's reservations |
| `GET` | `/api/bookings/listing/{id}`| Owner / Agent / Admin | List reservations for a specific listing |
| `PATCH`| `/api/bookings/{id}/status`| Owner / Agent / Admin | Approve, reject, or complete booking |
| `POST` | `/api/payments/process` | Authenticated | Process booking payment with sandbox adapter |
| `GET` | `/api/reviews/listing/{id}`| Public | Fetch approved reviews for a property |
| `POST` | `/api/reviews` | Authenticated | Submit verified review & update rating |
| `GET` | `/api/favorites` | Authenticated | Fetch current user's saved favorites |
| `POST` | `/api/favorites/toggle/{id}`| Authenticated | Toggle saved favorite property |
| `POST` | `/api/messages/enquire` | Public / Auth | Submit property enquiry or viewing request |
| `GET` | `/api/reminders` | Authenticated | Get synchronized calendar reminders |
| `POST` | `/api/reminders` | Authenticated | Create calendar reminder |
| `PATCH`| `/api/reminders/{id}/toggle`| Authenticated | Mark reminder completed/pending |
| `GET` | `/api/admin/stats` | Admin | Fetch platform-wide analytics & revenue |
| `GET` | `/api/admin/logs` | Admin | View administrative audit log stream |
| `GET` | `/api/users` | Admin | View user accounts directory |
| `POST` | `/api/reports` | Public / Auth | Submit report against suspicious listing |

---

## 🧪 Testing & Quality Assurance

### Backend Automated Test Suite
Includes unit, repository, and service integration tests:
- `AuthServiceTest`: Role assignment, duplicate username prevention, authentication workflows.
- `BookingServiceTest`: Anti-double-booking race condition validation, price computation, and status lifecycle checks.
- `ListingServiceTest`: Ownership mutation isolation, unauthorized access blocking, and CRUD checks.

Run tests:
```bash
cd auth-backend
mvn test
```
*Current test result:* **6 tests passed, 0 failures, 0 errors**.

### Frontend Build Validation
Validates full TypeScript / JSX compilation, CSS module syntax, and production asset bundling:
```bash
cd frontend
npm run build
```
*Result:* **Built production bundle cleanly in ~480ms with 0 errors**.

---

## 🔒 Security Configuration Checklist

- [x] **No Hardcoded Production Secrets:** Default JWT secret provided for dev, overrideable via `APP_JWT_SECRET` environment variable.
- [x] **Password Protection:** Sensitive fields annotated with `@JsonIgnore` to prevent leaking hashes in responses.
- [x] **Ownership Boundaries:** All update and delete mutations verify `listing.getOwner().getId().equals(currentUser.getId())` unless the caller is `ROLE_ADMIN`.
- [x] **Public Browsing:** Browsing properties and categories does not require login or expose private host contact information.
- [x] **Double-Booking Prevention:** Synchronized overlap check prevents concurrent reservation hijacking.
- [x] **CORS Configuration:** Explicitly permits local dev origins (`http://localhost:5173`) with credentials.
- [x] **Admin Authorization:** Admin endpoints strictly enforced with `.hasRole("ADMIN")`.

---

## 📋 Summary of Created and Modified Components

### Backend (`auth-backend`)
- **Entities:** `User`, `Listing`, `Booking`, `Payment`, `Review`, `Message`, `Reminder`, `Category`, `Favorite`, `ListingReport`, `AuditLog`.
- **Repositories:** `UserRepository`, `ListingRepository`, `BookingRepository` (with overlap query), `PaymentRepository`, `ReviewRepository`, `MessageRepository`, `ReminderRepository`, `CategoryRepository`, `FavoriteRepository`, `ListingReportRepository`, `AuditLogRepository`.
- **Services:** `AuthService`, `ListingService`, `BookingService`, `PaymentService`, `ReviewService`, `MessageService`, `ReminderService`, `FavoriteService`, `AdminService`.
- **Controllers:** `AuthController`, `ListingController`, `BookingController`, `PaymentController`, `ReviewController`, `MessageController`, `ReminderController`, `CategoryController`, `FavoriteController`, `AdminController`, `ReportController`, `UserController`.
- **Configuration & Security:** `SecurityConfig`, `JwtFilter`, `JwtUtil`, `OpenApiConfig`, `DataInitializer`.
- **Profiles:** `application.properties`, `application-mysql.properties`.

### Frontend (`frontend`)
- **Pages:**
  - `Properties.jsx`: Marketplace with hero metrics, multi-attribute filter drawer, comparison tray, list/map views, and favorite toggles.
  - `PropertyDetails.jsx`: Full property overview, photo lightbox, specs bar, reviews, booking widget, sandbox payment modal, enquiry form, and report modal.
  - `Dashboard.jsx`: Role-aware control center for Admin (stats, users, moderation, logs), Owner (portfolio, bookings, leads), and Tenant (trips, saved, enquiries).
  - `CalendarView.jsx`: Backend-synced agenda calendar with reminder creation and filtering.
  - `Login.jsx`: Authentication page with role selection and 1-click demo logins.
- **Components & Navigation:** `Navbar.jsx`, `Footer.jsx`, `App.jsx`, `PrivateRoute.jsx`.
- **Services:** `api.js` (with configurable baseURL and interceptors), `auth.js`.
- **Templates:** `.env.example`, updated `.gitignore`.

---

## ⚙️ Incomplete Features & External Credentials Required

1. **Google OAuth2 Login:**
   - Ready in Spring Security and `application.properties`. Requires setting `spring.security.oauth2.client.registration.google.client-id` and `client-secret` in Google Cloud Console.
2. **Third-Party Payment Gateway (Stripe / Razorpay):**
   - The application includes an interactive development Sandbox Payment Adapter that records transaction IDs and simulates instant card verification. For real payment processing, add Stripe SDK and configure `STRIPE_API_KEY` / webhook secret.
3. **Map Tile Provider (Mapbox / Google Maps):**
   - The marketplace provides a responsive, interactive SVG/Canvas schematic map view. If real satellite maps are preferred, provide a Mapbox or Google Maps API key in `VITE_MAPS_API_KEY`.

---

## 👥 Authors, Collaborators & Key Contributions

### 🌟 Project Lead & Full-Stack Architect
- **Name:** Akash Kumar Pandit
- **Institution:** Anurag University
- **Email / Student ID:** [23eg106b03@anurag.edu.in](mailto:23eg106b03@anurag.edu.in)
- **GitHub:** [@Akashkumarpandit](https://github.com/Akashkumarpandit)

#### 🛠️ Core Engineering Contributions:
- **Backend Architecture & Microservices (Spring Boot 3, Java 17):**
  - Architected end-to-end relational schema and Spring Data JPA entities (`User`, `Listing`, `Booking`, `Payment`, `Review`, `Message`, `Reminder`, `Category`, `Favorite`, `ListingReport`, `AuditLog`).
  - Implemented stateless JWT (HMAC-256) security filter chain with role-based access control (`TENANT`, `OWNER`, `AGENT`, `ADMIN`).
  - Engineered atomic booking engine with synchronized SQL overlap query to strictly prevent double-booking.
  - Implemented comprehensive RESTful controllers and service layer with transaction management and validation.
- **Frontend Architecture & UX Engineering (React 18, Vite):**
  - Built high-performance responsive UI using CSS Modules, complete with role-specific navigation and state persistence.
  - Designed public Property Marketplace with live metrics calculation, granular multi-criteria filtering, and 4-way comparison drawer.
  - Developed full Property Details portal featuring interactive photo gallery, lightbox modal, enquiry messaging, and report modals.
  - Built interactive development Sandbox Payment Adapter simulating instant card verification and receipt generation.
  - Implemented role-aware Dashboard for Admin platform governance, Owner portfolio oversight, and Tenant booking management.
  - Integrated backend-synchronized interactive Calendar Agenda for tracking viewings, booking windows, and reminders.

### 🤝 Project Collaborators & Contributors

| Contributor | Role | Focus Area / Contributions | GitHub |
| :--- | :--- | :--- | :--- |
| **Akash Kumar Pandit** | Lead Architect & Full-Stack Developer | Spring Boot 3 API, Security, React Frontend, Marketplace & Booking Engine | [@Akashkumarpandit](https://github.com/Akashkumarpandit) |
| *Collaborator* | Team Member | Quality Assurance, API Integration & Documentation | *(Add Profile)* |
| *Collaborator* | Team Member | UI/UX Evaluation, Testing & Deployment | *(Add Profile)* |

> *To invite additional collaborators on GitHub:*
> Navigate to **Settings** &rarr; **Collaborators** &rarr; **Add people** on the repository page.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

Copyright (c) 2026 Akash Kumar Pandit and Project Collaborators.
