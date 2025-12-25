# Snapory Frontend - Next.js Application

## Overview

This is the frontend application for Snapory, built with Next.js 14, React 18, and TypeScript.

## Features

- Photo upload interface
- Event-based photo organization
- Responsive design
- API integration with ASP.NET Core backend

## Prerequisites

- Node.js 20+
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Docker

Build and run with Docker:

```bash
docker build -t snapory-frontend .
docker run -p 3000:3000 snapory-frontend
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   └── PhotoUploader.tsx
│   └── lib/             # Utilities
│       └── api-client.ts # API client
├── public/              # Static assets
└── package.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technologies

- Next.js 14 (App Router)
- React 18
- TypeScript
- Axios for API calls
