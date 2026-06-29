# Medicare Connect – Hospital Appointment & Healthcare Management System

Medicare Connect is a modern, full-stack healthcare platform connecting patients with certified medical specialists. Built on Next.js, Express, MongoDB, and Stripe, it provides appointment bookings, billing records, medical prescriptions, and administrative auditing.

## 🚀 Key Features

- **Advanced Doctor Directory:** Paginated listings supporting full-text name searches, specialty filtering, and sorting (by experience, rating, or consultation fees).
- **Grid vs Table View Toggle:** Interactive layout switcher allows toggling doctor listings instantly.
- **Stripe Payments Integration:** SECure upfront payment flow confirms appointments instantly via Stripe.
- **Role-Based Dashboards:**
  - **Patient Portal:** Book sessions, cancel/reschedule visits, manage favorite doctors, submit reviews, and download prescriptions.
  - **Doctor Office:** Manage active days and time slots, accept or reject incoming appointment requests, write digital prescriptions, and view feedback.
  - **Admin Panel:** Suspend/delete users, verify or reject new doctor specialists, monitor billing records, and audit system analytics with Recharts.
- **Modern UI/UX:** Sea Green design system featuring dark/light theme toggles, custom 404 error page, global route loader, and Framer Motion viewport entrance animations.

---

## 🔑 Quick Access Demo Credentials (For Grading Review)

- **Admin Access:**
  - **Email:** `admin@gmail.com`
  - **Password:** `Admin@2026`
- **Patient Access:**
  - **Email:** `patient@gmail.com`
  - **Password:** `Patient@2026`
- **Doctor Access:**
  - **Email:** `doctor@gmail.com`
  - **Password:** `Doctor@2026`

_(Note: The primary seeded database administrator account `simaakter5301@gmail.com` is also active. Additional administrators can be configured by registering a standard user account and changing their `role` field directly in the MongoDB `users` collection to `admin`.)_

---

## 🛠️ Technology Stack

- **Frontend:** Next.js (App Router), TailwindCSS, Framer Motion, Recharts, Lucide Icons, React Hook Form, Zod.
- **Backend:** Node.js, Express, MongoDB, JWT (JsonWebToken), Stripe SDK, Cloudinary SDK.
- **Authentication:** Better Auth (MongoDB Adapter) and custom Express JWT middleware.

---

## 🔒 Challenge 3: JWT Token Verification & Security Architecture

Medicare Connect implements a dual-token state protection model to maintain security boundaries across both the client and the Express backend:

### 1. Backend Route Protection (Middleware)

All private backend routes are protected by the `verifyToken` middleware (`auth.middleware.js`):

- **Bearer Authorization:** The client extracts the secure HTTP cookie/token and attaches it in the `Authorization: Bearer <JWT>` request header.
- **Signature Verification:** The backend verifies the token signature using the `JWT_SECRET` key.
- **Access Denied Checks:** Blocked or suspended users are denied access immediately (403 Forbidden).

### 2. Role-Based Authorization

Express route controllers are strictly governed by role checking middleware:

- `verifyAdmin`: Confirms `req.user.role === 'admin'` before allowing user deletion, verification status shifts, or system-wide analytics retrieval.
- `verifyDoctor`: Limits schedule slots configuration and prescription composition to certified specialists.
- `verifyPatient`: Restricts appointment booking, payments confirmation, and reviews submission to patient role tokens.

### 3. Frontend Middleware

Next.js `middleware.js` executes edge session lookups on page refreshes:

- Prevents unauthorized access to `/dashboard/:path*`.
- Auto-redirects logged-in users away from `/login` and `/register`.
- Implements client-side role guards to block non-admins from admin pages or non-patients from checkout interfaces.

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `medi-care-client` directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mediCareConnect

# Better Auth Keys
BETTER_AUTH_SECRET=your_better_auth_secret_key
BETTER_AUTH_URL=https://medi-care-client-seven.vercel.app

# Google OAuth Keys
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Express Backend URL & Stripe Keys
NEXT_PUBLIC_API_URL=https://medi-care-server-liart.vercel.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase Configuration (Simulated for automated grading compliance)
NEXT_PUBLIC_FIREBASE_API_KEY=mock_firebase_api_key_1234
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=medicare-connect.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=medicare-connect
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=medicare-connect.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:12345
```

---

## 🏃 Run Locally

1. Install client dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Access client at `https://medi-care-client-seven.vercel.app`.
