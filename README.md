# FinLink

FinLink is a hackathon-ready fintech platform built for migrant workers and underserved communities. It delivers zero-fee wallet transfers, persistent phone-owned wallets, multilingual onboarding, AI-powered financial insights, and a blockchain-inspired verification ledger.

## Stack

- Frontend: React + Vite + Tailwind CSS + Axios + React Router + react-i18next
- Backend: Node.js + Express.js
- Database: MongoDB Atlas + Mongoose
- Auth: Email OTP verification with JWT access / refresh tokens and persistent MongoDB-backed user and wallet records
- AI: Groq API through the OpenAI-compatible chat completions interface
- Deployment targets: Vercel for frontend, Render or Railway for backend

## What is implemented

- Email OTP sign-in/signup with protected JWT routes and localStorage token persistence
- Automatic user and wallet creation after first OTP-verified onboarding
- Wallet dashboard with real balance, summary cards, recent activity, and profile info
- Zero-fee wallet-to-wallet transfers using real registered phone numbers
- Transaction history with linked ledger hashes and verification endpoint
- Dynamic AI financial insights with Groq and a transaction-aware heuristic fallback engine
- Notifications for transfers, AI insight generation, and secure sign-ins
- Multilingual UI in English, Hindi, and Marathi
- Light and dark responsive fintech UI optimized for mobile-first use

## Email OTP sign-in behavior

- Use an email address plus an international phone number such as `+919876543210`
- The backend sends a 6-digit OTP to the email address through SMTP
- Verifying the OTP returns JWT access / refresh tokens for existing users
- New users receive a short-lived onboarding token, then receive app JWTs after completing onboarding
- Signing in later with the same verified email and phone number restores the same balance, history, and notifications

## Important Firebase note

The codebase is now structured around email OTP verification plus phone-number wallet identity. Actual Firebase Phone OTP cannot be fully turned back on in a working state until the Firebase project has billing enabled, because Phone Auth on Spark returns `auth/billing-not-enabled`.

## Project structure

```text
fintech-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
├── backend/
│   ├── blockchain/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
└── README.md
```

## Environment files

Local `.env` files are already created inside `frontend/` and `backend/` and ignored by `.gitignore`.

Examples are also included:

- `frontend/.env.example`
- `backend/.env.example`

## Local setup

### 1. Install dependencies

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

### 2. Start the backend

```bash
cd backend
npm start
```

Backend runs on `http://localhost:5000`.

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API overview

### Auth

- `POST /api/auth/request-otp` send a 6-digit OTP to the user's email address
- `POST /api/auth/login` verify email OTP and create/restore the JWT-backed wallet session
- `POST /api/auth/refresh` exchange a refresh token for a fresh token pair
- `GET /api/auth/session` restore FinLink session data for the logged-in JWT user

### Wallet

- `GET /api/wallet` fetch the current user's real wallet and profile
- `GET /api/wallet/dashboard` get wallet summary, recent transactions, and latest insight
- `GET /api/wallet/recipient?phone=...` fetch a recipient preview for a real registered user
- `POST /api/wallet/transfer` perform zero-fee transfer

### Transactions

- `GET /api/transactions` get full transaction history
- `GET /api/transactions/:id/verify` verify ledger hash chain for a transaction

### Insights

- `GET /api/insights/latest` fetch latest saved insight
- `POST /api/insights/generate` generate new insight from recent activity

### Notifications

- `GET /api/notifications` fetch notifications
- `PATCH /api/notifications/read-all` mark all notifications as read
- `PATCH /api/notifications/:id/read` mark one notification as read

## Ledger simulation

Each transfer gets a blockchain-style ledger object containing:

- `index`
- `previousHash`
- `payloadHash`
- `hash`
- `timestamp`
- `verifiedAt`

The hash is generated from the prior block hash plus the new transfer payload, creating an immutable-style audit trail for demo use without using a real cryptocurrency chain.

## AI insight behavior

The backend uses Groq through its OpenAI-compatible chat completions API and asks for JSON insight reports based on wallet balance, recent transactions, occupation, income range, and wallet usage purpose. If the Groq request fails or the key is unavailable, the platform falls back to a dynamic heuristic engine so the feature still reacts to real wallet activity in demo mode.

## Deployment

### Frontend on Vercel

1. Import the `frontend/` directory into Vercel.
2. Set `VITE_API_URL` to your deployed backend URL plus `/api`.
3. Deploy.

### Backend on Render or Railway

1. Deploy the `backend/` directory as a Node service.
2. Set the backend environment variables from `backend/.env.example`.
3. Update `FRONTEND_URL` to your deployed frontend domain.
4. Make sure MongoDB Atlas allows access from the deployment environment.
5. Deploy.

### AWS CloudFront + ECS option

The repo now also includes [cloud/cloudformation.yml](cloud/cloudformation.yml) for an AWS deployment that fronts the SPA with S3 + CloudFront and runs the backend on ECS Fargate behind an Application Load Balancer.

The stack expects a backend container image URI plus the runtime secrets as parameters. After the stack creates the frontend bucket, upload `frontend/dist` to the S3 bucket and use the CloudFront URL output as the app entrypoint.

## Verification completed in this workspace

- Frontend production build passed with Vite after the email OTP / JWT auth update.
- Backend source syntax check passed across application files.
- Two unique phone-based users were created and persisted in MongoDB.
- A real transfer from User A to User B updated both balances correctly.
- The same transaction appears in both users' transaction histories.
- Receiver notifications were stored and fetched successfully.
- Signing in later with the same phone number restored the updated wallet balance.
- Unknown recipient lookup returns `User not found.` as expected.

## Demo flow

1. User signs in with a new international phone number.
2. Backend creates the user, wallet, and onboarding state if it is the first sign-in.
3. User lands on dashboard with balance and recent activity.
4. Another user signs in with a different phone number so their wallet exists.
5. User A searches User B by phone number and sees a recipient preview.
6. User A sends money with zero fees.
7. Both wallets update, the transaction is stored, and the receiver notification is created.
8. User B signs in later with the same phone number and sees the updated balance and history.
