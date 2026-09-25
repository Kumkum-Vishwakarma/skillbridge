# SkillBridge

**Peer-to-peer skill exchange platform — teach what you know, learn what you need.**

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## Overview

SkillBridge connects people who want to trade skills directly — someone who can teach React but wants to learn UI design is automatically matched with someone who teaches design and wants to learn React. The platform handles the full lifecycle: authentication, profile and skill management, a custom matching engine, an exchange-request workflow, and an aggregated analytics dashboard.

## Features

- **Authentication** — JWT-based register/login, bcrypt password hashing, protected routes
- **Profile Management** — bio, location, experience level, profile picture
- **Skill Catalog** — shared, case-insensitive-deduplicated skill list; tag skills as taught or wanted
- **Smart Matching Engine** — classifies other users as perfect / partial / no match based on mutual skill overlap
- **Exchange Requests** — send, accept, reject, cancel, with full business-rule validation
- **Dashboard Analytics** — aggregated stats and recent activity in a single API call
- **Production Hardening** — Helmet, rate limiting, NoSQL-injection/XSS sanitization, strict CORS
- **Automated Tests** — Jest/Supertest (backend), Vitest/React Testing Library (frontend)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS, React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Security | Helmet, express-rate-limit, express-mongo-sanitize |
| Testing | Jest, Supertest, Vitest, React Testing Library |

## Folder Structure

```
skillbridge/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # authController, userController, skillController,
│   │   │                    # exchangeRequestController, matchController, dashboardController
│   │   ├── middleware/      # auth, validation, error handling, security (rate limit, sanitize)
│   │   ├── models/          # User, Skill, ExchangeRequest
│   │   ├── routes/          # one router per module
│   │   ├── utils/           # ApiError, asyncHandler, generateToken, validateEnv
│   │   ├── app.js           # Express app configuration
│   │   └── server.js        # entry point
│   ├── tests/                # Jest + Supertest integration tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/              # one service file per backend module
│   │   ├── components/       # common/, layout/, requests/
│   │   ├── context/          # AuthContext
│   │   ├── hooks/             # useAuth
│   │   ├── pages/             # Dashboard, Profile, Skills, Matches, ExchangeRequests, auth/
│   │   ├── routes/             # AppRoutes
│   │   ├── tests/              # Vitest + RTL component tests
│   │   └── utils/               # normalizeApiError, tokenStorage
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Installation

```bash
git clone https://github.com/<your-username>/skillbridge.git
cd skillbridge

# Backend
cd backend
npm install
cp .env.example .env      # fill in your own values, see below
npm run dev                # http://localhost:5000

# Frontend (second terminal)
cd frontend
npm install
cp .env.example .env      # fill in VITE_API_URL
npm run dev                # http://localhost:5173
```

**Running tests:**
```bash
cd backend && npm test
cd frontend && npm test
```

## Environment Variables

**`backend/.env`**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skillbridge?retryWrites=true&w=majority
JWT_SECRET=<a random string, 32+ characters>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

## API Overview

| Module | Base Route |
|---|---|
| Auth | `/api/auth` — register, login, me |
| Users | `/api/users` — profile (get/update), view by id |
| Skills | `/api/skills` — catalog CRUD, teach/learn add-remove |
| Exchange Requests | `/api/exchange-requests` — create, sent, received, accept/reject/cancel |
| Matches | `/api/matches` — smart matching results |
| Dashboard | `/api/dashboard/stats` — aggregated statistics |

## Deployment

| Component | Recommended platform |
|---|---|
| Backend | Render or Railway |
| Frontend | Vercel or Netlify |
| Database | MongoDB Atlas |

## Future Improvements

- Session Management (in progress) — scheduling and tracking actual learning sessions after a request is accepted
- In-app chat and notifications
- Peer reviews and ratings after a completed session

## License

MIT
