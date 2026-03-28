# 🚀 Internship Portal v2 — Production Ready

Full-stack internship portal with JWT auth, role-based access, AI chatbot, admin dashboard, and PostgreSQL.

## 🏗️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Spring Boot 3.2, Java 17            |
| Frontend  | React 18, Vite, Tailwind CSS        |
| Database  | PostgreSQL (Render Cloud)           |
| Auth      | JWT (role-based: USER / ADMIN)      |
| Deployment| Backend: Render / Docker            |
|           | Frontend: Vercel                    |

## ✨ New in v2

- 🤖 **AI Chatbot** — floating widget with real-time user data queries
- 🛡️ **Separate Admin Login** — `/admin/login` route, isolated from user auth
- 📊 **Full Admin Dashboard** — stats, users list, all applications, status management
- 🐘 **PostgreSQL** — replaces MySQL, ready for Render cloud
- 🐳 **Docker** — Dockerfile included for backend
- ⚙️ **Env Variables** — all secrets externalized via `.env`
- 🌐 **Vercel Ready** — `vercel.json` included for SPA routing

## 🚀 Quick Start (Local)

### Backend

```bash
cd backend
cp .env.example .env       # Fill in your values
./mvnw clean package -DskipTests
java -jar target/internship-portal-backend-2.0.0.jar
# Runs on http://localhost:8080
```

### Frontend

```bash
cd frontend
cp .env.example .env       # Set VITE_API_BASE_URL
npm install
npm run dev
# Runs on http://localhost:5173
```

## 🔑 Default Credentials

| Role  | Email               | Password  | Login URL      |
|-------|---------------------|-----------|----------------|
| User  | user@portal.com     | user123   | /login         |
| Admin | admin@portal.com    | admin123  | /admin/login   |

## 🤖 Chatbot Commands

After logging in, the chatbot widget appears (bottom-right). Try:
- "What is my application status?"
- "Show my last application"
- "How many applications do I have?"
- "Am I shortlisted anywhere?"

## 🐳 Docker

```bash
cd backend
docker build -t internship-portal-backend .
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://... \
  -e JWT_SECRET=your-secret \
  internship-portal-backend
```

## 📁 Project Structure

```
internship-portal/
├── backend/
│   ├── src/main/java/com/internshipportal/
│   │   ├── controller/   # REST endpoints
│   │   ├── service/      # Business logic
│   │   ├── model/        # JPA entities
│   │   ├── repository/   # Data access
│   │   ├── security/     # JWT + Spring Security
│   │   ├── dto/          # Request/Response DTOs
│   │   └── config/       # Security, CORS, Exception handler
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Chatbot, Cards
│   │   ├── pages/        # All page components
│   │   ├── hooks/        # useAuth
│   │   └── services/     # API layer
│   ├── vercel.json
│   └── .env.example
└── schema.sql            # PostgreSQL schema + seed data
```
