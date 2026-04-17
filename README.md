# Smart Campus Hub

Smart Campus Hub is a full-stack campus operations platform for resource booking, maintenance ticketing, notifications, and role-based administration.

## Overview

The project includes:
- A Spring Boot backend (Java 21, MongoDB, JWT + OAuth2)
- A React frontend (Vite + Tailwind CSS)
- Integrated chatbot actions for booking resources and creating tickets

Core capabilities:
- Authentication (email/password + Google OAuth2)
- Role-aware access (USER, TECHNICIAN, ADMIN)
- Resource management and booking workflows
- Ticket lifecycle with comments and assignment
- In-app notifications and preferences
- Chat assistant for guided operations

## Tech Stack

Backend:
- Java 21
- Spring Boot 3.5.11
- Spring Security
- Spring Data MongoDB
- JWT (jjwt)

Frontend:
- React 18
- Vite 5
- Tailwind CSS
- Axios
- React Router

Infrastructure:
- Docker (multi-stage build)
- Railway config for backend deployment
- Vercel config for frontend deployment

## Repository Structure

```text
Smart_Campus_Hub/
|- src/main/java/com/smartcampus/      # Spring Boot backend
|- src/main/resources/                  # Backend properties and metadata
|- frontend/                            # React frontend app
|- uploads/                             # Runtime upload directory (ignored in git)
|- Dockerfile                           # Backend container image
|- railway.json                         # Railway deployment config
|- pom.xml                              # Maven build config
```

## Prerequisites

Install these before running locally:
- Java 21
- Maven 3.9+
- Node.js 18+ and npm
- MongoDB 6+ (local or remote)

macOS helpers:
```bash
java -version
mvn -version
node -v
npm -v
```

## Environment Variables

Create a root `.env` file (already gitignored) with values like:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGODB_URI=mongodb://localhost:27017/smart_campus_db
JWT_SECRET=your_strong_jwt_secret
PORT=8080
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
OAUTH2_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
ADMIN_EMAIL_REGEX=^(?i)admin[0-9]*@smartcampus\.edu$
TECHNICIAN_EMAIL_REGEX=^(?i)(tech|technician)[0-9]*@smartcampus\.edu$
```

Optional frontend environment file (`frontend/.env.local`):

```env
VITE_API_URL=http://localhost:8080
```

If `VITE_API_URL` is not set, frontend defaults to Vite proxy `/api`.

## Run Locally (Step by Step)

### 1. Start MongoDB

If using Homebrew on macOS:
```bash
brew services start mongodb-community
```

### 2. Start backend (Terminal 1)

From project root:

```bash
cd /Users/vihagaviboshana/Desktop/Smart_Campus_Hub
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export PATH="$JAVA_HOME/bin:$PATH"
set -a
source .env
set +a
mvn spring-boot:run
```

Backend URL:
- http://localhost:8080
- Health: http://localhost:8080/api/health

### 3. Start frontend (Terminal 2)

```bash
cd /Users/vihagaviboshana/Desktop/Smart_Campus_Hub/frontend
npm install
npm run dev
```

Frontend URL:
- http://localhost:5173

### 4. Verify services

```bash
curl -sS http://localhost:8080/api/health
```

Expected:
```json
{"status":"UP"}
```

## Build Commands

Backend:
```bash
cd /Users/vihagaviboshana/Desktop/Smart_Campus_Hub
mvn clean package
mvn test
```

Frontend:
```bash
cd /Users/vihagaviboshana/Desktop/Smart_Campus_Hub/frontend
npm run build
npm run preview
```

## Docker (Backend)

Build and run backend container:

```bash
cd /Users/vihagaviboshana/Desktop/Smart_Campus_Hub
docker build -t smart-campus-hub .
docker run --rm -p 8080:8080 \
  -e MONGODB_URI="mongodb://host.docker.internal:27017/smart_campus_db" \
  -e GOOGLE_CLIENT_ID="your_google_client_id" \
  -e GOOGLE_CLIENT_SECRET="your_google_client_secret" \
  -e JWT_SECRET="your_strong_jwt_secret" \
  smart-campus-hub
```

## API Route Groups

Main backend route groups:
- `/api/health`
- `/api/auth`
- `/api/resources`
- `/api/bookings`
- `/api/tickets`
- `/api/tickets/{ticketId}/comments`
- `/api/notifications`
- `/api/admin`
- `/api/chat`

Examples:
- `POST /api/auth/login`
- `GET /api/resources`
- `POST /api/bookings`
- `POST /api/tickets` (multipart form data)
- `PATCH /api/notifications/{id}/read`

## Role Auto-Assignment by Email

During signup, roles can be auto-assigned using email regex rules from backend properties:
- Admin: `admin@smartcampus.edu`, `admin1@smartcampus.edu`, etc.
- Technician: `tech@smartcampus.edu`, `technician2@smartcampus.edu`, etc.

Configured via:
- `app.auth.admin-email-regex`
- `app.auth.technician-email-regex`

## Deployment Notes

Backend:
- `railway.json` is configured to build from `Dockerfile`
- Healthcheck path is `/api/health`

Frontend:
- `frontend/vercel.json` is configured for Vite output and SPA rewrites

## Troubleshooting

### JAVA_HOME not defined correctly

Set Java 21 explicitly before running Maven:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export PATH="$JAVA_HOME/bin:$PATH"
```

### Backend cannot connect to MongoDB

- Ensure MongoDB is running
- Verify `MONGODB_URI` in `.env`

### Frontend cannot call backend

- Confirm backend is running on `http://localhost:8080`
- Check `VITE_API_URL` (if used) and Vite proxy settings
- Confirm CORS origins include frontend URL

### Port already in use

Check and kill process:

```bash
lsof -i :8080
lsof -i :5173
```

## Security Notes

- Do not commit real secrets to git.
- Keep `.env` local and rotate any exposed credentials.
- Replace default JWT secret in production.

## Contributing

1. Create a feature branch.
2. Make focused changes with tests where possible.
3. Run backend and frontend build checks before opening a PR.

## License

This project is currently for academic and internal use. Add a formal license file if you plan public distribution.
