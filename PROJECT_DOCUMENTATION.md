# CommunityConnect Project Documentation

This document describes the actual code in this repository as it currently exists. It is the source-of-truth documentation for developers working on the project.

Important note: the project snapshot currently contains a real backend `.env` file with credentials and tokens. This file is not copied here. Environment variable names are documented, but their values are intentionally omitted.

Also, the repository currently does not contain a top-level README at the CommunityConnect project root. Where that documentation is missing or inconsistent with the code, the code takes priority.

---

## 1) Project Overview

### What CommunityConnect is
CommunityConnect is a local help-matching web app built around community support requests. The application allows users to:

- register as a community member
- find nearby blood donors by blood group and location
- register as a blood donor
- find local service providers by service type and location
- send connection requests to people who can help
- accept, reject, complete, or mark requests incomplete
- manage profile data
- receive email-driven actions for request updates

### What problem it solves
The platform is intended to connect people who need help with nearby people who can provide help. In practical terms, it is a lightweight local matching system for:

- emergency blood needs
- common service needs (plumbing, electricians, carpentry, etc.)
- direct community support requests

### Who uses it
The app is designed for:

- users looking for help
- people willing to donate blood
- service providers who want to advertise their availability
- local community members interacting within a geographic area

### Main purpose of the platform
The primary purpose is to make it easy to discover and contact the right people in the same locality, while giving a structured request flow that can be accepted or rejected and tracked over time.

### Current implemented features
The actual implementation includes:

- user registration with email and phone OTP flow
- login with JWT-based authentication
- protected frontend routes
- user profile fetch/update
- blood donor registration
- blood donor matching by blood group and location
- service provider registration
- service provider matching by service type and location
- connection request creation
- request status updates (ACCEPTED, REJECTED, COMPLETED, INCOMPLETED)
- email notifications using Nodemailer
- clickable email action links for accept/reject/complete/incomplete
- request tracking on the frontend for sent and received requests

### Features not currently implemented
These are not fully implemented or not exposed in the app as actual user-facing flows based on the current code:

- real geolocation / GPS distance calculation
- a proper job marketplace layer even though `Job` model exists
- actual SMS provider integration for phone OTP (development-only log placeholder exists)
- database-driven email verification flags being applied to the user record after OTP verification
- a full separation between user roles and permissions beyond request ownership checks
- a formal admin dashboard
- multi-step onboarding beyond local registration flow
- real payment or escrow system
- user deletion / account deactivation

### Overall architecture
Actual architecture in the code is:

User
  ↓
React frontend (Vite + React Router)
  ↓
Axios API client
  ↓
Express backend
  ↓
Routes
  ↓
Controllers
  ↓
Services
  ↓
Mongoose models
  ↓
MongoDB

Additional system pieces that exist in the code:

- JWT for authentication
- Nodemailer for email delivery
- OTP records for email and phone verification
- Email action tokens for accept/reject/complete/incomplete links

---

## 2) Complete Folder Structure

Actual structure from the repo snapshot:

CommunityConnect/
Directory structure:
└── parthmahajan1020-communityconnect/
    ├── README.md
    ├── Backend/
    │   ├── package.json
    │   └── src/
    │       ├── seed.js
    │       ├── server.js
    │       ├── controllers/
    │       │   ├── authController.js
    │       │   ├── bloodController.js
    │       │   ├── connectionController.js
    │       │   ├── emailActionController.js
    │       │   ├── otpController.js
    │       │   ├── serviceController.js
    │       │   └── userController.js
    │       ├── middleware/
    │       │   └── authMiddleware.js
    │       ├── models/
    │       │   ├── BloodDonor.js
    │       │   ├── ConnectionRequest.js
    │       │   ├── EmailActionToken.js
    │       │   ├── Job.js
    │       │   ├── OTP.js
    │       │   ├── PhoneOTP.js
    │       │   ├── ServiceProvider.js
    │       │   └── User.js
    │       ├── routes/
    │       │   ├── authRoutes.js
    │       │   ├── bloodRoutes.js
    │       │   ├── connectionRoutes.js
    │       │   ├── emailActionRoutes.js
    │       │   ├── otpRoutes.js
    │       │   ├── serviceRoutes.js
    │       │   └── userRoutes.js
    │       ├── services/
    │       │   ├── api.js
    │       │   ├── emailActionTokenService.js
    │       │   ├── emailService.js
    │       │   └── matchingService.js
    │       └── utils/
    │           └── locationHelper.js
    └── Frontend/
        ├── README.md
        ├── components.json
        ├── eslint.config.js
        ├── index.html
        ├── jsconfig.json
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── App.jsx
            ├── index.css
            ├── main.jsx
            ├── components/
            │   ├── CardNav.jsx
            │   ├── EntryRoute.jsx
            │   ├── HomeCard.jsx
            │   ├── MatchCard.jsx
            │   ├── Navbar.jsx
            │   ├── ProtectedRoute.jsx
            │   ├── RequestCard.jsx
            │   ├── SearchCard.jsx
            │   ├── SearchForm.jsx
            │   ├── SoftAurora.jsx
            │   └── ui/
            │       ├── badge.jsx
            │       ├── button.jsx
            │       ├── card.jsx
            │       └── input.jsx
            ├── lib/
            │   └── utils.js
            ├── pages/
            │   ├── BloodDonor.jsx
            │   ├── FindBlood.jsx
            │   ├── FindService.jsx
            │   ├── Home.jsx
            │   ├── Login.jsx
            │   ├── MyRequests.jsx
            │   ├── Profile.jsx
            │   ├── Register.jsx
            │   └── ServiceProvider.jsx
            └── services/
                └── api.js


---

## 3) File-by-File Analysis

### Backend

### Backend/src/server.js
Purpose:
- Express application entry point.
- Connects MongoDB.
- Configures CORS.
- Mounts all API routes.

Why it exists:
- All backend app configuration is centralized here.

Imports:
- express
- mongoose
- cors
- dotenv
- User model
- route modules

Used by:
- the app runtime (`node src/server.js`)

Important functions:
- global error handler
- API root endpoint (`/`)
- direct `/api/users` listing endpoint
- route mounting

Important inputs:
- `process.env.PORT`
- `process.env.MONGO_URI`
- `process.env.FRONTEND_URL`

Important outputs:
- HTTP responses from all API endpoints
- app startup logs

Flow:
- loads env values
- starts Express app
- allows CORS from configured frontend URL
- mounts routes
- connects to MongoDB
- starts listening on configured port

### Backend/src/middleware/authMiddleware.js
Purpose:
- Validates bearer tokens attached to protected requests.

Important logic:
- reads `Authorization` header
- expects `Bearer <token>`
- verifies token using JWT secret
- attaches `req.userId` for controllers

Important outcome:
- unauthorized requests return 401

### Backend/src/controllers/authController.js
Purpose:
- user registration and login logic

Functions:
- `registerUser(req, res)`
- `loginUser(req, res)`

Flow:
- validate required fields
- check for duplicate email/phone
- hash password using `bcryptjs`
- create `User`
- return minimal user details
- produce JWT on login

Notes:
- `emailVerified` and `phoneVerified` are set to `true` immediately during registration, even though the frontend OTP flow suggests verification is required.
- This is a real implementation detail and is important for the security/accuracy analysis.

### Backend/src/controllers/userController.js
Purpose:
- profile read and profile update

Functions:
- `getProfile`
- `updateProfile`

Flow:
- load user by `req.userId`
- exclude password from response
- allow updating `name`, `phone`, `location`, `profileImage`

### Backend/src/controllers/bloodController.js
Purpose:
- register a user as a blood donor

Functions:
- `registerBloodDonor`

Flow:
- validate blood group and location
- ensure user exists
- prevent duplicate donor registration for same user
- normalize blood group to uppercase
- create `BloodDonor` document with `userId`, `bloodGroup`, `location`, `availability`, and `contact`

### Backend/src/controllers/serviceController.js
Purpose:
- register a user as a local service provider

Functions:
- `registerServiceProvider`

Flow:
- validate service type and location
- ensure user exists
- prevent duplicate service provider registration
- create `ServiceProvider` document

### Backend/src/controllers/connectionController.js
Purpose:
- search matching people
- create new connection requests
- fetch sent/received requests
- update request status

Functions:
- `getMatches`
- `createConnectionRequest`
- `getProviderRequests`
- `getRequesterRequests`
- `updateRequestStatus`

Important logic:
- valid types: `BLOOD` and `SERVICE`
- `type` uses uppercase normalized values
- request creation checks:
  - valid providerId
  - non-empty description and location
  - type validity
  - requester cannot request themselves
  - requester/provider must exist
  - only one active request with same provider and type is allowed
- request records are created on `ConnectionRequest`
- provider receives an email with click-action tokens created via `createActionUrls`

`updateRequestStatus` logic:
- provider can accept/reject only if request is `PENDING`
- requester can complete/incomplete only if request is `ACCEPTED`
- this logic is enforced by query filters, not only by frontend UI

### Backend/src/controllers/otpController.js
Purpose:
- email and phone OTP generation and verification

Functions:
- `sendEmailOTP`
- `verifyEmailOTP`
- `sendPhoneOTP`
- `verifyPhoneOTP`

Flow:
- generate random 6-digit OTP
- store OTP document with expiration date
- send email via `sendOTPEmail`
- verify against database record
- delete record after successful verification

Important note:
- `sendPhoneOTP` only logs to server console in non-production mode. No real SMS provider is configured.
- This is clearly marked as a development placeholder in the code.

### Backend/src/controllers/emailActionController.js
Purpose:
- processes email action links

Functions:
- `handleRequestAction`

Flow:
- token must be 64-character hex string
- looks up matching unhashed token by hashed value
- ensures token not already used and not expired
- determines action type: accept/reject/complete/incomplete
- updates `ConnectionRequest.status` accordingly
- invalidates competing tokens for the same request and actor
- sends follow-up emails via notification sends

Important note:
- this is not a secure signing system; it is a hash-based token system with a raw token embedded in a URL. It is better than plain ID values, but it is not a hardened cryptographic authorization system and is not ideal for production security.

### Backend/src/routes/*
Actual routing modules:

- `authRoutes.js` -> `POST /register`, `POST /login`
- `bloodRoutes.js` -> `POST /register` (protected)
- `connectionRoutes.js` -> `GET /matches`, `POST /request`, `GET /requests/sent`, `GET /requests/received`, `PATCH /requests/:requestId/status`
- `emailActionRoutes.js` -> `GET /:token`
- `otpRoutes.js` -> `POST /send-email`, `POST /verify-email`, `POST /send-phone`, `POST /verify-phone`
- `serviceRoutes.js` -> `POST /register` (protected)
- `userRoutes.js` -> `GET /me`, `PUT /me`

### Backend/src/services/matchingService.js
Purpose:
- the core matching logic for blood donors, service providers, and job-type search

Functions:
- `findMatches(type, requirement, location)`

Important logic:
- for `BLOOD`, it searches for donors with matching blood group and `availability: true`
- first tries exact location match case-insensitive
- if none are found, tries `getNearbyLocations(location)`
- if still none are found, returns all donors of the same group with availability true
- same pattern applies for `SERVICE`
- `JOB` logic exists, but there is no real user workflow for it in the current frontend

### Backend/src/services/emailService.js
Purpose:
- all email messages sent by the application

Functions:
- `sendOTPEmail`
- `sendConnectionRequestEmail`
- `sendProviderStatusEmail`
- `sendRequestAcceptedEmail`
- `sendRequestRejectedEmail`
- `sendRequesterFinalStatusEmail`

Important details:
- uses `nodemailer.createTransport({ service: "gmail", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD } })`
- escapes HTML content with `escapeHtml`
- sends HTML email templates with styled buttons
- email action links point to backend action URLs created via `BACKEND_URL`

### Backend/src/services/emailActionTokenService.js
Purpose:
- generates hashed email action tokens and invalidates related tokens

Functions:
- `createActionUrl`
- `createActionUrls`
- `invalidateActionTokens`

Important logic:
- raw token is stored only as a random 32-byte hex string in the URL
- database stores SHA-256 hashed token via `hashToken`
- token expiry is 24 hours by default

### Backend/src/services/api.js
This is a backend helper file that appears to be unused in the current app flow, but it exists in the backend.

Purpose:
- shared API helper, likely a convenience wrapper for backend-internal usage

Important note:
- This file is not the same as the frontend `src/services/api.js`.
- It is an Express/Node-side utility and does not define application routes.

### Backend/src/utils/locationHelper.js
Purpose:
- maps local area names to nearby area names for fallback search behavior

Data:
- Akurdi → Nigdi, Chinchwad, Pimpri, Ravet
- Nigdi → Akurdi, Chinchwad, Pimpri
- etc.

Important note:
- This is not actual GPS geolocation logic.
- It is a hardcoded string-name matching fallback layer.

### Backend/src/models/User.js
Fields:
- `name` (String, required, trimmed)
- `email` (String, required, unique, lowercase, trimmed)
- `phone` (String, required, unique)
- `location` (String, required)
- `password` (String, required)
- `emailVerified` (Boolean, default false)
- `phoneVerified` (Boolean, default false)
- `profileImage` (String, default empty)
- timestamps enabled

### Backend/src/models/BloodDonor.js
Fields:
- `userId` → `User` reference
- `bloodGroup` → enum: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`
- `location` → required string
- `availability` → Boolean, default true
- `contact` → required string
- timestamps enabled

Index:
- `bloodGroup`, `location`, `availability`

### Backend/src/models/ServiceProvider.js
Fields:
- `userId` → `User` reference
- `serviceType` → required string
- `location` → required string
- `availability` → Boolean, default true
- `contact` → required string
- timestamps enabled

Index:
- `serviceType`, `location`, `availability`

### Backend/src/models/ConnectionRequest.js
Fields:
- `requesterId` → `User` reference
- `providerId` → `User` reference
- `type` → enum `BLOOD`, `SERVICE`, `JOB`
- `description` → required string
- `location` → required string
- `status` → enum `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`, `INCOMPLETED`
- timestamps enabled

Indexes:
- requester/provider/type/status
- provider/status/date
- requester/status/date

### Backend/src/models/OTP.js
Purpose:
- stores email OTP values for verification

Fields:
- `email`
- `otp`
- `expiresAt`

### Backend/src/models/PhoneOTP.js
Purpose:
- stores phone OTP values for verification

Fields:
- `phone`
- `otp`
- `expiresAt`

### Backend/src/models/EmailActionToken.js
Purpose:
- stores email action tokens used for accept/reject/complete/incomplete actions

Fields:
- `requestId`
- `actorId`
- `action`
- `tokenHash`
- `expiresAt`
- `usedAt`

### Backend/src/models/Job.js
Purpose:
- a job-related dataset for potential work matching

Fields:
- `userId`
- `jobType`
- `location`
- `availability`
- `contact`

Important note:
- this model exists, and `matchingService.js` handles `JOB` search, but there is no active user-facing feature or route exposing job registration in the current frontend/backend flow.

### Backend/src/seed.js
Purpose:
- likely a seeding script for database initialization.

Important note:
- not part of the runtime app flow used by the UI.

---

### Frontend

### Frontend/src/App.jsx
Purpose:
- top-level application router and protected layout

Routes:
- `/` → redirect to `/login`
- `/login` → public login route
- `/register` → public register route
- `/home` → protected home page
- `/blood` → protected blood search page
- `/blood/donor` → protected donor registration page
- `/services/provider` → protected service provider registration page
- `/services` → protected local service search page
- `/requests` → protected request dashboard
- `/profile` → protected profile editing page
- fallback route redirects to `/home`

Important design:
- `ProtectedLayout` wraps all authenticated pages with `Navbar`
- `ProtectedRoute` checks for a JWT in `localStorage`
- Soft aurora background is included globally

### Frontend/src/main.jsx
Purpose:
- React root mount

### Frontend/src/services/api.js
Purpose:
- all frontend HTTP calls to the backend

Important exported functions:
- `registerUser`
- `loginUser`
- `sendEmailOTP`
- `verifyEmailOTP`
- `sendPhoneOTP`
- `verifyPhoneOTP`
- `getProfile`
- `updateProfile`
- `findBloodDonors`
- `sendConnectionRequest`
- `getReceivedRequests`
- `getSentRequests`
- `updateConnectionRequestStatus`
- `registerBloodDonor`
- `registerServiceProvider`
- `findServiceProviders`
- `logoutUser`

Important storage behavior:
- `loginUser` stores `token` and `user` in `localStorage`
- `updateProfile` updates user object in storage
- JWT is sent in `Authorization: Bearer <token>` for protected endpoints

### Frontend/src/components/ProtectedRoute.jsx
Purpose:
- route guard for authenticated pages

Logic:
- if no token in localStorage, redirect to `/login`
- otherwise render the nested route

### Frontend/src/components/Navbar.jsx
Purpose:
- main navigation menu for logged-in users

Important behaviors:
- reads user data from `localStorage`
- displays menu groups for Explore, Community, and Account
- calls `logoutUser()` on logout and navigates to `/login`

### Frontend/src/components/CardNav.jsx
Purpose:
- animated navigation card component using GSAP

Important details:
- collapsible navigation menu
- handles mobile and desktop states
- uses GSAP for animation
- receives `items`, `onNavigate`, `onLogout`

### Frontend/src/components/SoftAurora.jsx
Purpose:
- decorative animated background used in app root

### Frontend/src/components/EntryRoute.jsx
Purpose:
- redirect helper for entry route

Logic:
- if token exists, redirect to `/home`
- else redirect to `/login`

### Frontend/src/components/SearchForm.jsx
Purpose:
- reusable input/search form UI for search flows

Notes:
- not heavily used by current pages but exists in the UI layer

### Frontend/src/components/HomeCard.jsx
Purpose:
- likely a reusable card-style home feature entry component

### Frontend/src/components/MatchCard.jsx
Purpose:
- likely a reusable match result card component, not heavily connected in current code paths

### Frontend/src/components/SearchCard.jsx
Purpose:
- likely generic search result card component

### Frontend/src/components/RequestCard.jsx
Purpose:
- likely a specialized request display card component, not heavily used in final forms

### Frontend/src/pages/Login.jsx
Purpose:
- user authentication page

Flow:
- user enters email/password
- calls `loginUser`
- if successful, navigates to `/home`

### Frontend/src/pages/Register.jsx
Purpose:
- multi-step account registration flow

Flow:
- Step 1: gather name, email, phone, location, password
- Step 2: send email OTP
- Step 3: verify email OTP
- Step 4: send phone OTP
- Step 5: verify phone OTP
- Step 6: create account with `registerUser`

Important note:
- frontend verification flow exists, but `authController.registerUser` sets `emailVerified` and `phoneVerified` to true regardless of verification result.

### Frontend/src/pages/Home.jsx
Purpose:
- landing/dashboard screen for major app features

Important UI:
- “Blood” section with donate and need blood actions
- “Services” section with provide service and find service actions
- navigation actions call react-router paths such as `/blood`, `/blood/donor`, `/services`, `/services/provider`

### Frontend/src/pages/BloodDonor.jsx
Purpose:
- donor registration form

Flow:
- loads profile data from backend via `getProfile`
- pre-populates location from profile
- user selects blood type and toggles availability
- calls `registerBloodDonor`

Important note:
- if the backend returns `409`, the page treats it as already registered and sets the success state.

### Frontend/src/pages/FindBlood.jsx
Purpose:
- find blood donor page

Flow:
- user selects blood group and enters location
- calls `findBloodDonors(bloodGroup, location)`
- receives donor cards
- user can send connection request to a donor using `sendConnectionRequest`

Important details:
- uses request status map keyed by donor id
- request description is generated as `I need <bloodGroup> blood in <location>.`

### Frontend/src/pages/ServiceProvider.jsx
Purpose:
- service provider registration form

Flow:
- user selects service type and location
- toggles availability
- sends `registerServiceProvider` request

### Frontend/src/pages/FindService.jsx
Purpose:
- find service provider page

Flow:
- user selects service type and location
- calls `findServiceProviders(serviceType, location)`
- renders provider cards
- sends connection request with type `SERVICE`

### Frontend/src/pages/MyRequests.jsx
Purpose:
- request dashboard for sent and received requests

Important behaviors:
- loads `getSentRequests` and `getReceivedRequests()`
- request cards display status and timeline
- received requests allow accept/reject
- sent requests allow complete/incomplete when accepted
- uses `updateConnectionRequestStatus` to update logic

### Frontend/src/pages/Profile.jsx
Purpose:
- user profile management page

Features:
- load user data from `getProfile`
- allow editing `name`, `phone`, `location`
- email is displayed but not editable
- profile completion meter
- `motion` library used for transitions

### Frontend/src/components/ui/*
Small UI primitives:
- `button.jsx` → button styling helper
- `input.jsx` → generic input component
- `card.jsx` → card set
- `badge.jsx` → badge style helper

These are used to maintain a consistent Tailwind-based interface, but they are not the core logic of the app.

---

## 4) Frontend Architecture

### React and Vite
The frontend is a Vite React app. The app entry point is `Frontend/src/main.jsx` and the app shell is `Frontend/src/App.jsx`.

### Tailwind CSS
The app uses Tailwind through Vite. Tailwind-related dependencies are present in `Frontend/package.json`, and many components use Tailwind classes heavily.

### React Router
The app uses `react-router-dom` and route definitions are in `App.jsx`.

Actual route tree:

| Route | Component/Page | Purpose | Authentication required |
|---|---|---|---|
| `/` | redirect | landing default redirect | No |
| `/login` | `Login` | sign in | No |
| `/register` | `Register` | sign up with OTP flow | No |
| `/home` | `Home` | dashboard landing page | Yes |
| `/blood` | `FindBlood` | find donors | Yes |
| `/blood/donor` | `BloodDonor` | register donor | Yes |
| `/services` | `FindService` | find service providers | Yes |
| `/services/provider` | `ServiceProvider` | register provider | Yes |
| `/requests` | `MyRequests` | request dashboard | Yes |
| `/profile` | `Profile` | profile management | Yes |

### Axios API layer
The API client is in `Frontend/src/services/api.js` and points to `http://localhost:5000/api`.

This is the main request client used by the app.

### State management
The app uses local component state using `useState` and `useEffect` for most UI state. It does not use Redux or a global context store.

Important state patterns:
- `localStorage` stores `token` and `user`
- `ProtectedRoute` checks the token on route render
- page-level states for loading, error, form data, search results, and status messages are stored in each component

### localStorage usage
The app stores:

- `token` → JWT
- `user` → user profile object returned after login

This is used for:
- authentication guard
- navigation decisions
- user profile hydration
- profile update behavior

Important limitation:
- `localStorage` is not secure storage for sensitive auth data, and there is no refresh-token flow.

### User navigation flow
Typical user journey:

1. open `/login`
2. sign in
3. route redirects to `/home`
4. user clicks blood/service cards or navbar items
5. calls API service functions
6. backend returns matches or resource creation results
7. frontend renders cards and request actions

---

## 5) Backend Architecture

### Runtime stack
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Nodemailer

### Request lifecycle
Actual lifecycle is:

Frontend
  ↓
Axios request in `Frontend/src/services/api.js`
  ↓
Express route in `Backend/src/routes/*.js`
  ↓
`authMiddleware` if route is protected
  ↓
Controller in `Backend/src/controllers/*.js`
  ↓
Service layer (`matchingService.js`, `emailService.js`, `emailActionTokenService.js`)
  ↓
Mongoose model
  ↓
MongoDB
  ↓
Controller response
  ↓
Frontend UI update

### Middleware and auth flow
Protected routes call `authMiddleware` before controller execution.

`authMiddleware`:
- checks `Authorization: Bearer <token>`
- validates JWT with `process.env.JWT_SECRET`
- sets `req.userId`
- forwards to route/controller

### Controllers and models
Controllers are the main orchestration layer. Models define the persistence layer. Services handle matching, email, and token generation.

### Authentication and authorization
Authentication is implemented by JWT and `bcryptjs`.

Authorization is implemented by checking `req.userId` and by filtering database queries using ownership conditions. For example:

- request actions only succeed if request belongs to the logged-in user or provider
- protected routes require bearer token

---

## 6) Database Analysis

### Model summary
| Model | Purpose | Notes |
|---|---|---|
| `User` | base user/account record | central identity |
| `BloodDonor` | blood donor availability | indexed by blood group + location |
| `ServiceProvider` | local service provider availability | indexed by service + location |
| `ConnectionRequest` | match request lifecycle | tracks status |
| `OTP` | email OTPs | generated and deleted after verification |
| `PhoneOTP` | phone OTPs | development placeholder |
| `EmailActionToken` | secure-ish clickable email actions | token hash + expiry |
| `Job` | job-type model | exists but not actively used in frontend |

### User model table
| Model | Field | Type | Required | Default | Purpose |
|---|---|---|---|---|---|
| `User` | `name` | String | Yes | — | user display name |
| `User` | `email` | String | Yes | — | unique login and contact key |
| `User` | `phone` | String | Yes | — | unique contact field |
| `User` | `location` | String | Yes | — | user locality |
| `User` | `password` | String | Yes | — | bcrypt-hashed password |
| `User` | `emailVerified` | Boolean | No | false | verification flag |
| `User` | `phoneVerified` | Boolean | No | false | verification flag |
| `User` | `profileImage` | String | No | empty string | profile image URL |
| `User` | `timestamps` | Mongoose timestamps | — | — | createdAt/updatedAt |

### BloodDonor model table
| Model | Field | Type | Required | Default | Purpose |
|---|---|---|---|---|---|
| `BloodDonor` | `userId` | ObjectId | Yes | — | link to user |
| `BloodDonor` | `bloodGroup` | String enum | Yes | — | allowed blood types |
| `BloodDonor` | `location` | String | Yes | — | donor location |
| `BloodDonor` | `availability` | Boolean | No | true | donor is available |
| `BloodDonor` | `contact` | String | Yes | — | donor phone |

### ServiceProvider model table
| Model | Field | Type | Required | Default | Purpose |
|---|---|---|---|---|---|
| `ServiceProvider` | `userId` | ObjectId | Yes | — | link to user |
| `ServiceProvider` | `serviceType` | String | Yes | — | service category |
| `ServiceProvider` | `location` | String | Yes | — | service area |
| `ServiceProvider` | `availability` | Boolean | No | true | provider active |
| `ServiceProvider` | `contact` | String | Yes | — | phone contact |

### ConnectionRequest model table
| Model | Field | Type | Required | Default | Purpose |
|---|---|---|---|---|---|
| `ConnectionRequest` | `requesterId` | ObjectId | Yes | — | initiator |
| `ConnectionRequest` | `providerId` | ObjectId | Yes | — | target person |
| `ConnectionRequest` | `type` | String enum | Yes | — | BLOOD/SERVICE/JOB |
| `ConnectionRequest` | `description` | String | Yes | — | user request text |
| `ConnectionRequest` | `location` | String | Yes | — | request locality |
| `ConnectionRequest` | `status` | String enum | No | PENDING | lifecycle phase |

### Relationships
Actual relationships found in code:

- `User` → `BloodDonor` via `userId`
- `User` → `ServiceProvider` via `userId`
- `User` → `ConnectionRequest` as requester or provider
- `ConnectionRequest` → `EmailActionToken` via `requestId`

There is no explicit deep relational schema beyond object references and `populate` calls.

---

## 7) API Documentation

### Full API table
| Method | Endpoint | Purpose | Auth | Request body / params | Typical response |
|---|---|---|---|---|---|
| GET | `/` | health check | No | none | JSON message |
| GET | `/api/users` | list users | No | none | array of users |
| POST | `/api/auth/register` | register user | No | `name`, `email`, `phone`, `location`, `password` | 201 + user summary |
| POST | `/api/auth/login` | login | No | `email`, `password` | token + user |
| GET | `/api/users/me` | current profile | Yes | none | user object |
| PUT | `/api/users/me` | update profile | Yes | `name`, `phone`, `location`, `profileImage` | user object |
| POST | `/api/otp/send-email` | send email OTP | No | `email` | success message |
| POST | `/api/otp/verify-email` | verify email OTP | No | `email`, `otp` | verified true |
| POST | `/api/otp/send-phone` | generate phone OTP | No | `phone` | success message |
| POST | `/api/otp/verify-phone` | verify phone OTP | No | `phone`, `otp` | verified true |
| GET | `/api/connections/matches` | find blood/service matches | Yes | `type`, `requirement`, `location` | `{ count, matches }` |
| POST | `/api/connections/request` | create request | Yes | `providerId`, `type`, `description`, `location` | created `request` |
| GET | `/api/connections/requests/sent` | list sent requests | Yes | none | `{ count, requests }` |
| GET | `/api/connections/requests/received` | list received requests | Yes | none | `{ count, requests }` |
| PATCH | `/api/connections/requests/:requestId/status` | accept/reject/complete/incomplete | Yes | `{ status }` | updated request |
| POST | `/api/blood/register` | register as blood donor | Yes | `bloodGroup`, `location`, `availability` | donor record |
| POST | `/api/services/register` | register as service provider | Yes | `serviceType`, `location`, `availability` | provider record |
| GET | `/api/email-actions/:token` | email action processing | No | token in URL | HTML confirmation page |

### Request creation flow example
`POST /api/connections/request`

Flow:
1. frontend collects `providerId`, `type`, `description`, `location`
2. backend checks authorization with JWT
3. validates provider id and request format
4. ensures requester and provider exist
5. prevents duplicate active request for same provider and type
6. creates `ConnectionRequest`
7. creates email action URLs for accept/reject
8. sends email to provider
9. returns 201 response with the created request

---

## 8) Authentication & Authorization

### Registration
Registration is in `authController.registerUser`.

Flow:
- validate `name`, `email`, `phone`, `location`, `password`
- detect duplicates on email or phone with `User.findOne({ $or: [...] })`
- hash password with `bcrypt.hash(password, 10)`
- create `User`
- return user summary without password

### Login
Login is in `authController.loginUser`.

Flow:
- find user by email
- compare submitted password to stored hash via `bcrypt.compare`
- sign JWT with `userId` and expiry `7d`
- return token + selected user info

### Password hashing
The app uses `bcryptjs`, not plain passwords.

### JWT generation
JWT is created with:

- payload: `{ userId: user._id }`
- secret: `process.env.JWT_SECRET`
- expiry: `7d`

### JWT storage
Frontend stores the token in `localStorage` under `token`.

### Protected routes
Protected backend routes call `authMiddleware` before controllers. Frontend also has `ProtectedRoute` to redirect unauthenticated users.

### Authorization model
This app does lightweight authorization based on ownership:

- only the logged-in user can read/update their own profile
- only the provider can accept/reject pending requests in `updateRequestStatus`
- only the requester can complete/incomplete accepted requests

### Email verification and phone verification
The OTP flow exists for both email and phone, but in the actual code:

- OTPs are stored transiently in MongoDB
- `verifyEmailOTP` and `verifyPhoneOTP` return success without mutating the `User` record
- `registerUser` then creates the user with both `emailVerified` and `phoneVerified` set to `true` immediately

This means the UI verification flow is partly present, but the actual user verification state is not consistently enforced.

### Important security distinction
Authentication = “Who are you?”
Authorization = “What are you allowed to do?”

The app handles both in a basic way, but not in a robust production-grade way.

---

## 9) Email System

### Email configuration
The project uses `nodemailer` with Gmail transport:

- service: `gmail`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

This is configured in `Backend/src/services/emailService.js`.

### OTP email
`sendOTPEmail` sends a six-digit verification code to the user email.

### Connection request email
When a request is created:

- provider is emailed with accept/reject buttons
- accept and reject links are generated using `createActionUrls`
- links contain raw tokens created by `crypto.randomBytes(32).toString("hex")`
- the backend stores only hash values and resolves the token on request to the route

### Accept/reject email actions
When user clicks an email action link, `GET /api/email-actions/:token` is called.

The backend then:
- validates token format
- loads matching token record
- checks expiration and used state
- updates the request status based on action
- sends status emails back to the affected users

### Completion/incompletion email actions
After a provider accepts a request, the request creator receives a second email with buttons to mark the request as either:

- `complete`
- `incomplete`

Those actions update the request to `COMPLETED` or `INCOMPLETED` and then send a final status email.

### Security limitation in email actions
Important: the implementation uses randomly generated tokens in URLs and stores SHA-256 hashes on the server, but it does not use strong signed JWTs or cryptographic authorization claims for action verification.

This approach is functional but not production-hardened, and it is best described as a tokenized action URL pattern, not a fully secure authorization system.

---

## 10) CommunityConnect Request System

### Core request lifecycle
Requester
  ↓
Find donor/provider
  ↓
Send connection request
  ↓
ConnectionRequest created in MongoDB
  ↓
Provider receives email with accept/reject actions
  ↓
Provider accepts or rejects
  ↓
Requester gets notified
  ↓
If accepted, requester can mark request as completed or incomplete

### Status state machine
The real statuses are:

- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `COMPLETED`
- `INCOMPLETED`

### Who can change status
Implementation rules from `connectionController.js`:

- Provider can change from `PENDING` to `ACCEPTED` or `REJECTED`
- Requester can change from `ACCEPTED` to `COMPLETED` or `INCOMPLETED`
- No transitions from rejected/completed/incomplete are allowed by current controller rules

### Email-driven transitions
Email action route updates request status when a user clicks a link.

Example transitions:

- accept action => `PENDING` -> `ACCEPTED`
- reject action => `PENDING` -> `REJECTED`
- complete action => `ACCEPTED` -> `COMPLETED`
- incomplete action => `ACCEPTED` -> `INCOMPLETED`

### Request ownership validation
The backend validates these actions using filters like:

- `providerId: req.userId` for provider actions
- `requesterId: req.userId` for requester actions

This is enforced in the database query, not just the UI.

---

## 11) Blood Donation Flow

### Full flow
1. User logs in
2. User visits `/blood/donor`
3. `BloodDonor.jsx` loads profile and pre-fills `location`
4. User selects blood group and availability
5. Frontend calls `registerBloodDonor()`
6. `POST /api/blood/register` receives request
7. `bloodController.registerBloodDonor()` validates the data
8. Creates `BloodDonor` document in MongoDB
9. Later user goes to `/blood`
10. User selects a blood group and enters location
11. Frontend calls `findBloodDonors()`
12. `GET /api/connections/matches?type=BLOOD&requirement=<bloodGroup>&location=<location>` is called
13. `matchingService.findMatches()` runs matching logic
14. Matching results are returned as donor cards
15. User clicks “Send Connection Request”
16. A `ConnectionRequest` is created
17. Provider receives email with accept/reject links
18. Provider acts, and request status changes

### Location matching logic for blood
Implementation is not geographical distance-based.

Actual logic:
- exact location match with case-insensitive regex against `location`
- if no exact match, `getNearbyLocations(location)` is used
- if still no match, it falls back to all available donors of that blood group

This means the code is doing string/location-name matching, not true GPS distance computation.

---

## 12) Local Service Flow

### Full flow
1. User logs in
2. User visits `/services/provider`
3. Fills service type and location
4. Calls `registerServiceProvider()`
5. Backend creates `ServiceProvider` document
6. User goes to `/services`
7. Selects service type and location
8. Calls `findServiceProviders()`
9. Backend runs `findMatches("SERVICE", requirement, location)`
10. Matches are returned by service type and location
11. User sends connection request with type `SERVICE`
12. Provider receives email and can accept or reject
13. Requester can later mark as completed/incomplete

### Matching logic for services
Similar to blood flow:

- exact service type match using case-insensitive regex
- exact location match first
- nearby location names by `locationHelper.getNearbyLocations()`
- no actual geographic distance

---

## 13) Location Matching

### Important distinction
This project does not compute actual geographic distance using coordinates.

What it does instead:
- compares strings like location names
- uses a hardcoded dictionary of nearby locality names

### Implementation source
- `Backend/src/utils/locationHelper.js`
- `Backend/src/services/matchingService.js`

### Exact match behavior
A search does this first:

- `location: { $regex: '^' + searchLocation + '$', $options: 'i' }`

This is a string match, not coordinate proximity.

### Nearby location logic
`getNearbyLocations(location)` returns a static list based on the chosen search location. This means the code is effectively using a manually maintained local-area name map.

### Fallback behavior
If an exact match is not found:

- it tries nearby locations from the constant map
- if still no results, returns all matching donors/providers of the same blood group or service type

### Important honesty note
This is not “distance-based matching.” It is a locality-name matching system with a small manual fallback map.

---

## 14) Complete User Journeys

### Journey 1 — New User Registration
User action
  → `Register.jsx`
  → `sendEmailOTP()`
  → `POST /api/otp/send-email`
  → `otpController.sendEmailOTP()`
  → creates `OTP` record and sends email
  → `verifyEmailOTP()`
  → `POST /api/otp/verify-email`
  → `sendPhoneOTP()`
  → `POST /api/otp/send-phone`
  → `verifyPhoneOTP()`
  → `registerUser()`
  → `POST /api/auth/register`
  → `authController.registerUser()`
  → `User` created in MongoDB
  → redirect to `/login`

### Journey 2 — Login
User action
  → `Login.jsx`
  → `loginUser()`
  → `POST /api/auth/login`
  → `authController.loginUser()`
  → creates JWT
  → stores token + user in localStorage
  → navigates to `/home`

### Journey 3 — Email Verification
User action
  → `Register.jsx`
  → OTP email is sent
  → OTP is verified against `OTP` collection
  → success returned to frontend
  → no actual user verification flag is written in the current code path

### Journey 4 — Register as Blood Donor
User action
  → `BloodDonor.jsx`
  → `registerBloodDonor()`
  → `POST /api/blood/register`
  → `bloodController.registerBloodDonor()`
  → `BloodDonor` created
  → frontend success state shown

### Journey 5 — Find Blood
User action
  → `FindBlood.jsx`
  → `findBloodDonors()`
  → `GET /api/connections/matches?type=BLOOD...`
  → `connectionController.getMatches()`
  → `matchingService.findMatches()`
  → `BloodDonor` documents returned
  → frontend renders donor cards

### Journey 6 — Send Blood Request
User action
  → choose donor card
  → `sendConnectionRequest()`
  → `POST /api/connections/request`
  → `connectionController.createConnectionRequest()`
  → `ConnectionRequest` created
  → provider email sent
  → frontend shows success message

### Journey 7 — Provider Accepts Request
Provider clicks email link
  → `GET /api/email-actions/:token`
  → `handleRequestAction()`
  → `ConnectionRequest.status = ACCEPTED`
  → email notifications sent to requester and provider

### Journey 8 — Provider Rejects Request
Same as above, but action is `reject`
  → `ConnectionRequest.status = REJECTED`
  → requester is informed via email

### Journey 9 — Requester Completes Request
Requester clicks email action link
  → `handleRequestAction()`
  → `ConnectionRequest.status = COMPLETED`
  → final status email sent to requester

### Journey 10 — Requester Marks Request Incomplete
Requester clicks email action link
  → `handleRequestAction()`
  → `ConnectionRequest.status = INCOMPLETED`

### Journey 11 — Service Provider Registration
User action
  → `ServiceProvider.jsx`
  → `registerServiceProvider()`
  → `POST /api/services/register`
  → `serviceController.registerServiceProvider()`
  → `ServiceProvider` created

### Journey 12 — Find Local Service
User action
  → `FindService.jsx`
  → `findServiceProviders()`
  → `GET /api/connections/matches?type=SERVICE...`
  → `matchingService.findMatches("SERVICE")`
  → provider cards shown

### Journey 13 — Send Service Request
Same path as blood request, but with `type: "SERVICE"`

---

## 15) Frontend ↔ Backend Connection Map

Examples from the actual code:

- `Frontend/src/pages/FindBlood.jsx` → `findBloodDonors()` in `Frontend/src/services/api.js` → `GET /api/connections/matches` → `connectionRoutes` → `getMatches()` → `matchingService` → `BloodDonor`
- `Frontend/src/pages/FindService.jsx` → `findServiceProviders()` → `GET /api/connections/matches` → `connectionRoutes` → `getMatches()` → `matchingService` → `ServiceProvider`
- `Frontend/src/pages/BloodDonor.jsx` → `registerBloodDonor()` → `POST /api/blood/register` → `bloodRoutes` → `registerBloodDonor()` → `BloodDonor`
- `Frontend/src/pages/ServiceProvider.jsx` → `registerServiceProvider()` → `POST /api/services/register` → `serviceRoutes` → `registerServiceProvider()` → `ServiceProvider`
- `Frontend/src/pages/Login.jsx` → `loginUser()` → `POST /api/auth/login` → `authRoutes` → `loginUser()` → `User`
- `Frontend/src/pages/Register.jsx` → `registerUser()` → `POST /api/auth/register` → `authRoutes` → `registerUser()` → `User`
- `Frontend/src/pages/MyRequests.jsx` → `getReceivedRequests()` / `getSentRequests()` → `GET /api/connections/requests/...` → `connectionRoutes` → `getProviderRequests` / `getRequesterRequests` → `ConnectionRequest`
- `Frontend/src/pages/Profile.jsx` → `getProfile()` / `updateProfile()` → `GET /api/users/me` / `PUT /api/users/me` → `userRoutes` → `getProfile` / `updateProfile` → `User`

---

## 16) Component Relationships

Actual React component tree roughly looks like this:

App
 ├── BrowserRouter
 ├── SoftAurora (fixed background)
 ├── Routes
 │   ├── Login
 │   ├── Register
 │   └── ProtectedRoute
 │       ├── ProtectedLayout
 │       │   ├── Navbar
 │       │   └── Outlet
 │       │       ├── Home
 │       │       ├── FindBlood
 │       │       ├── BloodDonor
 │       │       ├── FindService
 │       │       ├── ServiceProvider
 │       │       ├── MyRequests
 │       │       └── Profile
 └── fallback redirect

### Reusable components
From code, the reusable components are:

- `Navbar` for navigation
- `ProtectedRoute` for auth gating
- `CardNav` for animated menu UI
- `SearchForm` for generic search forms
- `ui/button`, `ui/input`, `ui/card`, `ui/badge` for design patterns

---

## 17) State Management

### Where state lives
The app mostly uses local state inside page components.

Examples:

- `Register.jsx` uses state for `step`, `formData`, `otp`, `loading`, `error`, `message`
- `FindBlood.jsx` uses state for `bloodGroup`, `location`, `donors`, `loading`, `searched`, `error`, `requestStatus`
- `MyRequests.jsx` uses state for `sent`, `received`, `loading`, `busy`, `error`
- `Profile.jsx` stores form and profile states, update states, editing states, message states

### localStorage state
- `token` is used for current JWT
- `user` is used for current user profile object

### authentication state
Authentication state is effectively derived from `localStorage.getItem("token")`.

### loading/error states
These are page-local states and are used consistently across forms and search functions.

### request states
Request states are held in component arrays or maps, especially in `FindBlood.jsx` and `MyRequests.jsx`.

---

## 18) Security Analysis

### Currently implemented security
- password hashing with `bcryptjs`
- JWT-based authentication
- bearer-token authorization on protected backend routes
- basic request ownership validation in status update queries
- hashed email action tokens stored in the database
- HTML escaping in outgoing email templates

### Potential security issues
The code is functional, but the current implementation has several weaknesses:

1. User registration sets `emailVerified` and `phoneVerified` to true immediately
   - this effectively bypasses the verification state intended by the OTP process

2. Phone OTP is not actually sent anywhere in production
   - there is no SMS provider integration

3. JWT is stored in localStorage
   - this is convenient but not the most secure storage strategy for production apps

4. No refresh token system exists
   - long-lived JWT tokens are stored in browser localStorage

5. No explicit role model for admin or moderator
   - authorization is not strongly separated by role

6. Email action links are tokenized but not hardened as a full authorization system
   - the raw token is exposed in a URL and the app matches it by hash

7. Input validation is present, but not broad in all layers
   - there are some checks, but there is no full schema-validation layer like Zod or Joi

8. Basic CORS is configured, but this is not a full production security model

9. No API rate limiting is implemented

10. No custom audit logs for sensitive actions beyond basic console logging

### Recommended improvements
- move JWT storage to secure HTTP-only cookies
- integrate a real SMS provider for phone verification
- enforce actual user verification before account creation or before key actions
- add a formal role system
- use stricter validation and sanitization libraries
- add rate limiting and abuse protection
- replace raw email action token URLs with signed actions or short-lived, signed JWT-based action links

---

## 19) Error Handling

### Frontend errors
The frontend mostly uses try/catch blocks and surfaces `error.response?.data?.message` when available.

Examples:
- `Register.jsx` catches OTP and registration errors
- `FindBlood.jsx` catches search and request errors
- `MyRequests.jsx` shows error banners for request loading and updates

### Backend errors
Controllers use catch blocks and return JSON messages such as:

- 400 for validation errors
- 401 for authentication problems
- 403 for forbidden actions
- 404 when entities are missing
- 409 for duplicate requests or conflicts
- 500 for unexpected server issues

### Weaknesses in error handling
- some catches suppress details (`catch { ... }`) and do not log the actual error object
- `createConnectionRequest` and `updateRequestStatus` catch blocks log minimal or partial error details
- email action route has some fallback logic but not full transaction rollback
- `handleRequestAction` prints to console on email and token errors but is not strongly transactional

### Empty result handling
Empty search results are handled with “No donors found” and “No service providers found” states in the UI.

---

## 20) Environment Variables

The project uses the following variables in the backend:

| Variable | Used By | Purpose | Required |
|---|---|---|---|
| `PORT` | `server.js` | app listen port | Yes |
| `MONGO_URI` | `server.js` | MongoDB connection string | Yes |
| `JWT_SECRET` | `authController.js`, `authMiddleware.js` | JWT signing and verification | Yes |
| `FRONTEND_URL` | `server.js` | CORS allowed frontend origin | Recommended |
| `EMAIL_USER` | `emailService.js` | Gmail sender account | Yes |
| `EMAIL_PASSWORD` | `emailService.js` | Gmail app password / account secret | Yes |
| `BACKEND_URL` | `emailActionTokenService.js` | base URL used in email action links | Recommended |
| `NODE_ENV` | `otpController.js` | development-only fallback logic for phone OTP logging | Optional |

Important: actual values should never be disclosed in project documentation.

---

## 21) Dependencies

### Backend dependencies
| Package | Why it is used in this project | Where it is used |
|---|---|---|
| `express` | main server framework | `server.js`, routes, controllers |
| `mongoose` | MongoDB ODM | all models and queries |
| `dotenv` | read environment variables | `server.js` |
| `cors` | enable frontend-backend requests | `server.js` |
| `bcryptjs` | password hashing | `authController.js` |
| `jsonwebtoken` | JWT creation and verification | `authController.js`, `authMiddleware.js` |
| `nodemailer` | send OTP and request emails | `emailService.js` |

### Backend dev dependency
| Package | Purpose |
|---|---|
| `nodemon` | local backend auto-restart |

### Frontend dependencies
| Package | Why it is used in this project | Where it is used |
|---|---|---|
| `react` | UI layer | app pages/components |
| `react-dom` | mount React app | `main.jsx` |
| `react-router-dom` | routing | `App.jsx`, pages |
| `axios` | HTTP client | `src/services/api.js` |
| `tailwindcss` | styling system | many components |
| `motion` | animation | `Profile.jsx` |
| `gsap` | animated navigation and effects | `CardNav.jsx` |
| `lucide-react` | icons | `Profile.jsx` |
| `@tailwindcss/vite` | Tailwind integration with Vite |
| `@base-ui/react` | UI primitives support |
| `@fontsource-variable/geist` | typography support |
| `ogl` | visual effect support |
| `react-icons` | extra icon set |
| `tw-animate-css` | animation utilities |

---

## 22) Complete Feature Map

| Feature | Frontend Files | API | Backend Files | Database Model |
|---|---|---|---|---|
| User registration | `Register.jsx` | `POST /api/auth/register` | `authController.js`, `authRoutes.js` | `User` |
| Login | `Login.jsx` | `POST /api/auth/login` | `authController.js`, `authRoutes.js` | `User` |
| Profile fetch/update | `Profile.jsx` | `GET /api/users/me`, `PUT /api/users/me` | `userController.js`, `userRoutes.js` | `User` |
| Email OTP | `Register.jsx` | `POST /api/otp/send-email`, `POST /api/otp/verify-email` | `otpController.js`, `otpRoutes.js` | `OTP` |
| Phone OTP | `Register.jsx` | `POST /api/otp/send-phone`, `POST /api/otp/verify-phone` | `otpController.js`, `otpRoutes.js` | `PhoneOTP` |
| Blood donor registration | `BloodDonor.jsx` | `POST /api/blood/register` | `bloodController.js`, `bloodRoutes.js` | `BloodDonor` |
| Blood search | `FindBlood.jsx` | `GET /api/connections/matches` | `connectionController.js`, `matchingService.js` | `BloodDonor` |
| Service registration | `ServiceProvider.jsx` | `POST /api/services/register` | `serviceController.js`, `serviceRoutes.js` | `ServiceProvider` |
| Service search | `FindService.jsx` | `GET /api/connections/matches` | `connectionController.js`, `matchingService.js` | `ServiceProvider` |
| Request create | `FindBlood.jsx`, `FindService.jsx` | `POST /api/connections/request` | `connectionController.js`, `connectionRoutes.js` | `ConnectionRequest` |
| Request tracking | `MyRequests.jsx` | `GET /api/connections/requests/sent`, `GET /api/connections/requests/received` | `connectionController.js`, `connectionRoutes.js` | `ConnectionRequest` |
| Request status update | `MyRequests.jsx` | `PATCH /api/connections/requests/:requestId/status` | `connectionController.js`, `connectionRoutes.js` | `ConnectionRequest` |
| Email action handling | email links | `GET /api/email-actions/:token` | `emailActionController.js`, `emailActionRoutes.js` | `EmailActionToken`, `ConnectionRequest` |
| Job-type model exists | not used in current frontend | not active | `matchingService.js`, `Job.js` | `Job` |

---

## 23) “If I Want to Change This…”

### If I want to change a blood donor field
Go to:
- `Backend/src/models/BloodDonor.js`
- `Backend/src/controllers/bloodController.js`
- `Frontend/src/pages/BloodDonor.jsx`
- `Frontend/src/pages/FindBlood.jsx`

### If I want to change blood matching behavior
Go to:
- `Backend/src/services/matchingService.js`
- `Backend/src/utils/locationHelper.js`
- `Backend/src/controllers/connectionController.js`

### If I want to change service matching behavior
Go to:
- `Backend/src/services/matchingService.js`
- `Backend/src/controllers/connectionController.js`
- `Frontend/src/pages/FindService.jsx`

### If I want to change request status logic
Go to:
- `Backend/src/controllers/connectionController.js`
- `Backend/src/models/ConnectionRequest.js`
- `Frontend/src/pages/MyRequests.jsx`
- `Backend/src/controllers/emailActionController.js`

### If I want to change email design
Go to:
- `Backend/src/services/emailService.js`

### If I want to change email action behavior
Go to:
- `Backend/src/services/emailActionTokenService.js`
- `Backend/src/controllers/emailActionController.js`
- `Backend/src/routes/emailActionRoutes.js`

### If I want to change login behavior
Go to:
- `Frontend/src/pages/Login.jsx`
- `Frontend/src/services/api.js`
- `Backend/src/controllers/authController.js`
- `Backend/src/middleware/authMiddleware.js`

### If I want to change registration validation
Go to:
- `Backend/src/controllers/authController.js`
- `Frontend/src/pages/Register.jsx`

### If I want to change navbar behavior
Go to:
- `Frontend/src/components/Navbar.jsx`
- `Frontend/src/components/CardNav.jsx`

### If I want to change API base URL
Go to:
- `Frontend/src/services/api.js`

### If I want to change the database schema
Go to:
- `Backend/src/models/*.js`

### If I want to change the profile page
Go to:
- `Frontend/src/pages/Profile.jsx`
- `Backend/src/controllers/userController.js`

---

## 24) Current Limitations

Based on the actual implementation, the current limitations include:

- The app does not calculate actual geographic distance; it does string-based location matching.
- Phone OTP is not connected to a real SMS service.
- User verification flags are set to true during registration without a hardened verification flow.
- JWT is stored in localStorage rather than a more secure cookie-based strategy.
- The `Job` model and matching logic exist, but there is no visible full job feature in the UI or routes.
- The project does not have centralized validation middleware or schema validation library.
- Email action links are functional, but not a production-grade secure authorization mechanism.
- There is no real admin, moderation, or role-based access control.
- `GET /api/users` exposes all users in the app without role restrictions.

---

## 25) Future Improvements

### Easy improvements
- add clearer empty-state messages on all pages
- add loading and retry patterns to more API calls
- standardize error handling across all frontend pages
- remove unused components or connectors that are not active
- add a backend health endpoint with consistent status codes

### Medium improvements
- add proper user email verification enforcement
- add real SMS provider for phone OTP
- add a global toast notification system
- improve location matching with actual coordinates and distance calculations
- add rate limiting and abuse prevention endpoints

### Major architecture improvements
- move auth storage to secure HTTP-only cookies
- add role-based access control and admin capabilities
- implement a proper service layer with business validation and statistics
- add strong request auditing and notification system
- split routes/controllers into more consistent domain modules
- add central validation layer and schema enforcement

---

## 26) How to Understand CommunityConnect Quickly

Recommended reading order for this project:

1. `Backend/src/server.js` — understand the app bootstrap, CORS, route registration, MongoDB connection.
2. `Backend/src/routes/*.js` — understand the API surface.
3. `Backend/src/controllers/*.js` — see the business logic and validations.
4. `Backend/src/models/*.js` — understand the database schema and relationships.
5. `Backend/src/services/matchingService.js` — understand the actual matching logic.
6. `Backend/src/services/emailService.js` and `emailActionController.js` — understand notifications and action workflows.
7. `Frontend/src/App.jsx` — understand the route tree and auth layout.
8. `Frontend/src/services/api.js` — understand all API calls.
9. `Frontend/src/pages/*.jsx` — understand the user flows.
10. `Frontend/src/components/*.jsx` — understand UI structure and animations.

If you only want the minimum mental model:

- Frontend pages call API helper functions.
- APIs are routed to controllers.
- Controllers validate input and manipulate models.
- Matching logic and email logic are implemented in services.
- Tokenized email links drive the request-status workflow.

---

## 27) Final Architecture Diagram

User
  ↓
React frontend (`Frontend/src/pages`, `components`, `App.jsx`)
  ↓
Router and protected pages (`react-router-dom`)
  ↓
API client (`Frontend/src/services/api.js`)
  ↓
Axios HTTP requests
  ↓
Express server (`Backend/src/server.js`)
  ↓
Routes (`Backend/src/routes/*.js`)
  ↓
Controllers (`Backend/src/controllers/*.js`)
  ↓
Services (`matchingService.js`, `emailService.js`, `emailActionTokenService.js`)
  ↓
Models (`User`, `BloodDonor`, `ServiceProvider`, `ConnectionRequest`, etc.)
  ↓
MongoDB

Additional paths in the current implementation:

- JWT -> `authMiddleware.js` and login flow
- OTP -> `OTP.js` and `PhoneOTP.js`
- Email actions -> `EmailActionToken.js` + `GET /api/email-actions/:token`
- Connection requests -> `ConnectionRequest.js`
- Blood donors -> `BloodDonor.js`
- Service providers -> `ServiceProvider.js`
- Email -> Nodemailer

---

## 28) Accuracy Rules Applied

This documentation follows the actual implementation in the code base and intentionally does not claim anything that is not present.

Examples of code-based truths:

- blood and service matching are location-name based, not coordinate-based
- OTP verification does not currently update user verification flags in a robust way
- phone OTP is a development log placeholder, not a real SMS integration
- the code includes a `Job` model and a `JOB` enum, but there is no active frontend job flow in the current app
- `CommunityConnect` does not currently have a root README in this snapshot

---

## 29) Final Summary

CommunityConnect is a community-help platform centered around blood donations and local service matching. The most important architecture is simple and clear:

- React frontend renders pages and handles local state
- Axios calls the backend API
- Express routes delegate to controllers
- controllers perform validation and database operations
- service modules handle matching and email workflows
- MongoDB stores users, donors, providers, requests, and OTP records

The most important business flow is the connection-request lifecycle: create request -> provider receives email -> provider accepts/rejects -> requester is notified -> if accepted, requester marks result as complete or incomplete.

This is the core of the platform’s internal logic.
