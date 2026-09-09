# CommunityConnect

> A community-driven platform that connects people who need help with people who are willing to provide it.

CommunityConnect is a MERN-stack web application designed to make local community support easier, faster, and more reliable.

The platform currently focuses on two major areas:

- Blood Donation & Blood Requests
- Local Services & Community Assistance

Instead of depending on scattered WhatsApp groups, social media posts, or word-of-mouth communication, CommunityConnect provides a centralized platform where users can find the right people, send requests, communicate through email actions, and manage their connections.

---

## Features

### Authentication & User Management

- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Email OTP verification
- Phone verification
- Protected routes
- User profile management
- Profile image support

### Blood Donation

Users can register as blood donors and help people looking for specific blood groups.

Features include:

- Donate Blood registration
- Find Blood
- Blood group-based matching
- Location-based matching
- Donor profile information
- Send connection requests to suitable donors
- Manage blood-related requests

### Local Services

CommunityConnect also helps users find people who can provide useful local services.

Users can:

- Register as a service provider
- Search for required services
- View suitable service providers
- Send connection requests
- Accept service requests
- Complete accepted requests

### Connection Request System

The platform provides a complete request workflow.

Users can:

- Send connection requests
- Accept requests
- Reject requests
- Mark accepted requests as completed
- Report accepted requests as incomplete
- View sent requests
- View received requests
- Prevent duplicate active requests

### Email-Based Request Actions

CommunityConnect integrates email actions into the request workflow.

When a provider receives a connection request, they receive an email notification with options to:

- Accept the request directly from email
- Reject the request directly from email

This reduces the need to constantly open the application to manage requests.

### Smart Matching

CommunityConnect provides matching based on relevant requirements such as:

- Blood group
- Location
- Service type
- User requirements

Example:

```text
Blood Type: O+
Location: Pune
Requirement: Blood Donor

        ↓

Find matching users

        ↓

Display suitable donors

        ↓

Send Connection Request
````

---

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* Axios
* React Router
* GSAP
* ReactBits

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Nodemailer

### Development Tools

* Git
* GitHub
* VS Code
* Postman
* MongoDB Atlas

---

## System Architecture

```text
                    CommunityConnect
                           |
              +------------+------------+
              |                         |
           Frontend                  Backend
              |                         |
        React + Vite              Node + Express
              |                         |
           Axios API                  REST API
              |                         |
              +------------+------------+
                           |
                        MongoDB
                           |
                    MongoDB Atlas
```

---

## Project Structure

```text
CommunityConnect/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Application Routes

### Authentication

```text
/login
/register
```

### Main Application

```text
/home
/profile
/requests
```

### Blood Donation

```text
/blood
/blood/donor
```

### Local Services

```text
/services
/services/provider
/services/acceptor
```

---

## Request Workflow

```text
User searches for help
        |
        ↓
Matching users are displayed
        |
        ↓
User sends connection request
        |
        ↓
Provider receives request
        |
        +-------------------+
        |                   |
        ↓                   ↓
     Accept               Reject
        |
        ↓
   Connection Active
        |
        +-------------------+
        |                   |
        ↓                   ↓
   Completed          Report Incomplete
```

---

## Authentication Flow

```text
User Registration
       |
       ↓
Enter User Details
       |
       ↓
Email OTP Verification
       |
       ↓
Phone Verification
       |
       ↓
Account Created
       |
       ↓
Login
       |
       ↓
JWT Token
       |
       ↓
Protected Application
```

---

## API Structure

The backend follows a RESTful API architecture.

Example API structure:

```text
/api/auth
/api/users
/api/connections
/api/blood
/api/services
```

### Example Matching Endpoint

```text
GET /api/connections/matches
```

Example query:

```text
/api/connections/matches?type=BLOOD&requirement=O%2B&location=Pune
```

This endpoint finds suitable users based on the requested type, requirement, and location.

---

## Database Models

### User

```text
User
├── name
├── email
├── phone
├── location
├── password
├── emailVerified
├── phoneVerified
└── profileImage
```

### Connection Request

```text
ConnectionRequest
├── sender
├── receiver
├── type
├── status
├── requirement
├── createdAt
└── updatedAt
```

Request statuses include:

```text
PENDING
ACCEPTED
REJECTED
COMPLETED
```

---

## Security

CommunityConnect implements several security practices:

* Password hashing using bcrypt
* JWT-based authentication
* Protected API routes
* Protected frontend routes
* OTP-based verification
* Environment variables for sensitive credentials
* Prevention of duplicate active requests
* Authentication middleware for protected resources

Sensitive information such as database credentials, JWT secrets, and email credentials should never be committed to GitHub.

---

## Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

Never commit the `.env` file.

Make sure `.gitignore` contains:

```gitignore
node_modules/
.env
dist/
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ParthMahajan1020/CommunityConnect.git
```

### 2. Navigate to the Project

```bash
cd CommunityConnect
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Install Backend Dependencies

Open another terminal:

```bash
cd backend
npm install
```

### 5. Configure Environment Variables

Create:

```text
backend/.env
```

Add the required environment variables.

---

## Running the Project

### Start Backend

```bash
cd backend
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on the Vite development server, usually:

```text
http://localhost:5173
```

---

## How It Works

### Find Blood

```text
User selects required blood group
            |
            ↓
Enters/selects location
            |
            ↓
System searches matching donors
            |
            ↓
Suitable donors are displayed
            |
            ↓
User sends connection request
```

### Provide a Service

```text
Service Provider registers
            |
            ↓
Adds service information
            |
            ↓
User searches for required service
            |
            ↓
Matching providers are displayed
            |
            ↓
User sends request
            |
            ↓
Provider accepts/rejects request
```

---

## UI & Design

CommunityConnect uses a modern, responsive interface designed to make community interactions simple and accessible.

The frontend uses:

* Tailwind CSS
* ReactBits components and animations
* GSAP animations
* Responsive layouts
* Interactive navigation
* Modern cards and UI components

The goal is to maintain a clean interface while still providing an engaging user experience.

---

## Future Scope

The platform can be extended with several additional features.

### Planned Improvements

* Real-time chat
* Push notifications
* Advanced location-based matching
* Google Maps integration
* Service provider ratings and reviews
* User reputation system
* Emergency blood request alerts
* Admin dashboard
* Request analytics
* AI-powered matching
* Mobile application
* More community assistance categories

---

## Future Modules

CommunityConnect is designed as a scalable community platform.

Future versions can expand beyond blood donation and local services to support:

```text
Blood Donation
      |
      +── Find Blood
      +── Donate Blood
      |
Local Services
      |
      +── Find Service
      +── Provide Service
      |
Future
      |
      +── Jobs
      +── Emergency Assistance
      +── Education Support
      +── Community Events
      +── Volunteer Opportunities
```

---

## Advantages

* Centralized community assistance platform
* Faster connection between people
* Location-based matching
* Blood group-based matching
* Verified user accounts
* Structured request management
* Email-based request actions
* Secure authentication
* Scalable MERN architecture
* Responsive user interface

---

## Problem Statement

People often struggle to find reliable help during urgent or everyday situations.

For example:

* A person may urgently need a specific blood group.
* Someone may need a trusted local service provider.
* People willing to help may not know who needs assistance.
* Community requests are often scattered across WhatsApp groups, social media, and personal contacts.

CommunityConnect addresses this gap by providing a single digital platform that connects people who need help with people who can provide it.

---

## Proposed Solution

CommunityConnect creates a structured community network where users can:

```text
Register
   ↓
Verify
   ↓
Create Profile
   ↓
Find People
   ↓
Send Request
   ↓
Accept / Reject
   ↓
Connect
   ↓
Complete Assistance
```

This creates a more organized, transparent, and accessible way of providing community support.

---

## Project Goals

The main goals of CommunityConnect are:

1. Connect people who need help with suitable people nearby.
2. Simplify blood donor discovery.
3. Provide a platform for local community services.
4. Reduce dependency on scattered communication channels.
5. Create a secure and structured request system.
6. Build a scalable platform for future community-oriented modules.

---

## Contributors

This project is developed as a collaborative team project.

### Team

```text
CommunityConnect Development Team
```

---

## Project Status

```text
Status: Active Development
```

Current modules:

```text
Authentication        ✓
User Profiles         ✓
Blood Donation        ✓
Blood Matching        ✓
Local Services        ✓
Connection Requests   ✓
Email Actions         ✓
Request Management    ✓
```

More features and improvements are under development.

---

## License

This project is developed for educational and community-oriented purposes.

All rights reserved by the project contributors.

---

##Author

*Parth Mahajan*  
- BTech Student | Full-Stack Web Development & DSA
- LinkedIn: https://www.linkedin.com/in/parth-mahajan1020/
- GitHub: https://github.com/ParthMahajan1020  
- Email: parth.mahajan1020@example.com  
- Passionate about building console applications, learning new programming languages, and exploring software projects.
