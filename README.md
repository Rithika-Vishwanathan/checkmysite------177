# CheckMySite

CheckMySite is a real website auditing platform built with React, Vite, Express, TypeScript, MongoDB, Firebase, Playwright, Lighthouse, axe-core, and Gemini.

## Tech stack

- Frontend: React + TypeScript + Vite + React Router + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: MongoDB + Mongoose
- Auth: Firebase Authentication + Firebase Admin SDK
- Audit engine: Playwright + Lighthouse + axe-core + HTTP inspection
- AI: Google Gemini API
- Real-time: Server-Sent Events (SSE)

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy environment values:

```bash
copy .env.example .env
```

3. Fill in your Firebase, MongoDB, and Gemini settings.

4. Run the app:

```bash
npm run dev
```

This starts both the backend and frontend.

## Separate commands

```bash
npm run server
npm run client
```

## Production build

```bash
npm run build
```

## Notes

- The app performs real website analysis when the relevant services are configured.
- If MongoDB, Firebase, or Gemini is not configured, the app runs in local-safe mode for development and surfaces clear configuration errors.
- Real audits are only recorded when a valid environment and successful analysis are available.
