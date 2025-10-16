# Procurement Application

## Overview
A fullstack procurement management system built with React (frontend) and Go with Gin Gonic framework (backend). The application features a complete request and approval workflow with role-based access control, vendor management, and automated email notifications.

## Tech Stack

### Backend
- **Language**: Go 1.24
- **Framework**: Gin Gonic
- **ORM**: GORM
- **Database**: PostgreSQL (Replit-managed)
- **Authentication**: JWT tokens
- **Email Service**: Gmail API (via Replit Gmail connector)

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS with modern design system
- **Typography**: Google Fonts (Inter)

## Project Structure

```
.
├── backend/
│   ├── main.go              # Application entry point
│   ├── models/              # Database models (User, Request, Approval, Vendor)
│   ├── handlers/            # HTTP request handlers
│   ├── middleware/          # JWT authentication middleware
│   ├── services/            # Email notification service
│   └── database/            # Database initialization and seeding
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API client configuration
│   │   ├── components/     # Reusable components (Layout, ProtectedRoute)
│   │   ├── context/        # Authentication context
│   │   ├── pages/          # Page components (Login, Dashboard, etc.)
│   │   ├── App.jsx         # Main app component with routing
│   │   └── App.css         # Global styles
│   └── vite.config.js      # Vite configuration with proxy
│
└── replit.md               # This file
```

## Features

### Authentication
- JWT-based authentication
- 4 hardcoded user roles: user, superuser, manager, director
- Protected routes requiring authentication

### Request Management
- Create procurement requests with item details, quantity, pricing, and justification
- Optional vendor selection for requests
- View all requests with role-based filtering
- Status filtering (pending, approved, rejected)
- Detailed request view with vendor information

### Vendor Management
- Complete CRUD operations for vendors
- Vendor information: name, contact person, email, phone, category, rating, status
- Vendor filtering by category, status, and search
- Track vendor orders and total spending
- Vendor analytics on dashboard with top vendors by spending
- Role-based access: All users can view vendors, only managers/directors can manage

### Approval Workflow
- Multi-level approval system
- Only managers and directors can approve/reject requests
- Approval history tracking with comments
- Automatic status updates

### Email Notifications
- Automated emails via Gmail API integration
- Sends from your connected Gmail account to any recipient addresses
- Request creation: Notifies requestor and all approvers (managers/directors)
- Approval/Rejection: Notifies requestor with approval details
- Asynchronous email sending with error logging
- No domain verification required - works with any email addresses

### Role-Based Access Control
- **User/Superuser**: Can view their own requests, view all vendors, create requests
- **Manager/Director**: Can view all requests, approve/reject, manage vendors

## Hardcoded Users

All users use the password: `password123`

| Username  | Role       | Email                     | Capabilities                              |
|-----------|------------|---------------------------|-------------------------------------------|
| user      | user       | user@procurement.com      | Create and view own requests, view vendors|
| superuser | superuser  | superuser@procurement.com | Create and view own requests, view vendors|
| manager   | manager    | manager@procurement.com   | View all requests, approve/reject, manage vendors |
| director  | director   | director@procurement.com  | View all requests, approve/reject, manage vendors |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Requests
- `GET /api/requests` - Get all requests (filtered by role)
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id/status` - Update request status

### Approvals
- `POST /api/requests/:id/approvals` - Create approval/rejection
- `GET /api/requests/:id/approvals` - Get approval history

### Vendors
- `GET /api/vendors` - Get all vendors (all authenticated users)
- `POST /api/vendors` - Create new vendor (managers/directors only)
- `GET /api/vendors/:id` - Get vendor details (all authenticated users)
- `PUT /api/vendors/:id` - Update vendor (managers/directors only)
- `DELETE /api/vendors/:id` - Delete vendor (managers/directors only)

## Database Schema

### Users Table
- ID, CreatedAt, UpdatedAt, DeletedAt
- Username (unique)
- Password (plaintext - for demo only)
- FullName
- Email (for notifications)
- Role

### Procurement Requests Table
- ID, CreatedAt, UpdatedAt, DeletedAt
- ItemName
- Description
- Quantity
- UnitPrice
- TotalCost
- Justification
- Status (pending/approved/rejected)
- RequestorID (foreign key to Users)
- VendorID (optional foreign key to Vendors)

### Approvals Table
- ID, CreatedAt, UpdatedAt, DeletedAt
- RequestID (foreign key to Requests)
- ApproverID (foreign key to Users)
- Status (approved/rejected)
- Comments
- ApprovedAt

### Vendors Table
- ID, CreatedAt, UpdatedAt, DeletedAt
- Name
- ContactPerson
- Email
- Phone (optional)
- Category
- Rating (0-5)
- Address (optional)
- Status (active/inactive)
- Notes (optional)
- TotalOrders (computed from requests)
- TotalSpent (computed from requests)

## Development

### Running Locally
Both workflows are configured to start automatically:

**Backend** (Port 8080):
```bash
cd backend && go run main.go
```

**Frontend** (Port 5000):
```bash
cd frontend && npm run dev
```

### Vite Proxy Configuration
The frontend uses Vite's proxy feature to forward `/api` requests to the backend on port 8080 during development. This ensures seamless communication between frontend and backend without CORS issues.

### CORS Configuration
The backend is configured to accept requests from all origins (for development). In production, this should be restricted to specific domains.

## Recent Changes

### October 16, 2025 - Currency Localization to Indonesian Rupiah (IDR)

#### Currency Format Changes
- Changed all currency display from USD ($) to Indonesian Rupiah (Rp)
- Updated frontend pages with Indonesian locale formatting:
  - Dashboard.jsx: Statistics cards, vendor analytics, request cards
  - NewRequest.jsx: Unit price label and total cost display
  - RequestDetail.jsx: Unit price and total cost display
  - Vendors.jsx: Vendor spending display
- Updated backend email templates to use Rp currency
- Applied `toLocaleString('id-ID')` formatting with thousand separators for better readability
- Currency format: `Rp 1.000.000,00` (Indonesian standard with dots for thousands, commas for decimals)

### October 16, 2025 - Gmail API Integration

#### Email Service Migration
- Migrated from Resend to Gmail API for email notifications
- Integrated Gmail connector via Replit OAuth connection
- Updated Go backend to use Gmail API (google.golang.org/api/gmail/v1)
- Implemented OAuth2 access token management with Replit connector
- Email sending now works with any recipient addresses (Gmail, Yahoo, company emails, etc.)
- No domain verification required - uses authenticated Gmail account
- Benefits:
  - Send to any email address without restrictions
  - 500 emails/day limit (free Gmail) or 2,000/day (Google Workspace)
  - Secure OAuth authentication managed by Replit
  - RFC 2822 compliant HTML email formatting

### October 15, 2025 - Email Notifications & Vendor Management

#### Vendor Management System
- Created Vendor model with complete fields (name, contact, email, phone, category, rating, status, notes)
- Built vendor CRUD API endpoints with role-based authorization
- Implemented vendor management UI (Vendors.jsx page)
  - List, add, edit, delete functionality for managers/directors
  - Filtering by category, status, and search
  - View-only access for regular users (for vendor selection)
- Integrated vendor selection in request creation flow
- Added vendor analytics to dashboard:
  - Total vendors, active vendors, total orders, total spent
  - Top vendors by spending display
- Display vendor information in request details

#### Email Notification Service (Initially with Resend, migrated to Gmail on Oct 16)
- Implemented email service in Go (backend/services/email.go):
  - `SendRequestCreatedEmail`: Notifies requestor of new request
  - `SendApproverNotificationEmail`: Notifies managers/directors of pending requests
  - `SendApprovalEmail`: Notifies requestor of approval/rejection decisions
- Asynchronous email sending with error logging
- HTML-formatted email templates with request details
- Automatic email triggers on:
  - Request creation (to requestor and all approvers)
  - Request approval/rejection (to requestor)

#### Database Updates
- Added Email field to User model (nullable)
- Updated user seed data with email addresses
- Added VendorID field to ProcurementRequest model (optional)
- Created Vendor table with indexes
- Enhanced GORM preloading for vendor relationships

#### Previous Changes (October 15, 2025)

### Initial Implementation
- Set up Go backend with Gin Gonic and GORM
- Implemented all database models with proper relationships
- Created authentication system with JWT tokens
- Built complete CRUD operations for requests and approvals
- Set up React frontend with routing and authentication
- Created all UI pages (Login, Dashboard, New Request, Request Detail)
- Configured Vite proxy for API communication
- Fixed API URL handling to work in both development and production

### Architecture Review
- Verified GORM relationships and foreign keys
- Confirmed JWT authentication and middleware implementation
- Validated role-based access control
- Ensured API client uses relative URLs with proxy
- Removed all hardcoded localhost references

### Modern UI/UX Redesign
- Implemented modern design system with CSS variables for consistent theming
- Added Google Fonts (Inter) for clean, professional typography
- Enhanced Dashboard with statistics cards showing:
  - Total requests count
  - Pending, approved, and rejected counts
  - Total procurement value and approved spend
  - Enhanced filters with live counts
- Redesigned Login page with gradient background and quick-login functionality
- Updated all forms with modern card-based layouts and improved visual hierarchy
- Added smooth animations and transitions throughout the app
- Implemented iconography for better visual communication
- Enhanced request cards with complete information display
- Added empty states with helpful messages
- Improved responsive design across all breakpoints

### Database Performance Optimization
- Added database indexes to improve query performance:
  - `idx_procurement_requests_requestor_id` - for filtering requests by user
  - `idx_procurement_requests_status` - for filtering by status (pending/approved/rejected)
  - `idx_approvals_request_id` - for loading approval history
  - `idx_approvals_approver_id` - for tracking approver activity
  - `idx_approvals_status` - for filtering approval decisions
- Reduced slow SQL queries from 3+ seconds to index-backed lookups (milliseconds)
- GORM auto-migration automatically creates indexes on server startup

### Full-Screen Layout & UX Improvements
- Fixed full-screen width layout for all pages:
  - Removed all max-width constraints (was 1400px, now 100% width)
  - Updated navigation, main content, forms, and detail pages to use full screen
  - Fixed index.css centering issues that constrained layout
- Improved input visibility:
  - Changed input text color to dark (visible on white background)
  - Added visible placeholder text color
  - All form inputs now have proper contrast and readability
- Enhanced login page:
  - Added professional procurement-themed background image (business office workspace)
  - Gradient overlay for better visual appeal
  - Fixed attachment for smooth scrolling effect

## Security Notes
- **Passwords are stored in plaintext** - This is for demonstration only. In production, use proper password hashing (bcrypt).
- **JWT secret** is hardcoded - In production, use environment variables for secrets.
- **CORS allows all origins** - In production, restrict to specific domains.

## Future Enhancements
- Budget threshold rules for approval routing
- Advanced reporting dashboard with procurement analytics
- Request templates for common items
- File attachment support for quotes and documentation
- Password hashing and proper authentication
- Role-based approval chains (e.g., manager → director)
- Vendor performance tracking and ratings
- Purchase order generation
- Multi-currency support
- Audit trail for all changes
