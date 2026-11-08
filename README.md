# The Small Web

A browser-based application that lets people explore a collection of small, interconnected websites. Users can browse pages, follow links, retrace their navigation, search page content, view personal browsing history, and publish new pages.

## Features

- **Browse:** Open pages using their `.small` addresses.
- **Navigation:** Move backward and forward through browsing history.
- **Search:** Search website content, titles, and addresses.
- **Personal History:** View browsing history for different people.
- **Publish:** Create and publish new websites with custom HTML.
- **Broken Links:** Handle addresses that do not exist.
- **Multiple People:** Switch between seeded people and view their individual histories.

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- CSS

**Backend**
- NestJS
- Node.js
- TypeScript
- Mongoose

**Database**
- MongoDB Atlas

## Project Structure

```text
smallweb-browser/
├── frontend/
│   ├── src/
│   │   └── app/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── people/
│   │   ├── sites/
│   │   └── visits/
│   ├── scripts/
│   │   └── seed.mjs
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB Atlas connection string

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd smallweb-browser
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=4000
```

Start the backend:

```bash
npm run start:dev
```

The API will run at:

`http://localhost:4000`

### 3. Seed the Database

Open another terminal:

```bash
cd backend
npm run seed
```

The seed script populates the database with sample people, websites, and browsing visits. It is designed to be repeatable without creating duplicate seed records.

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create `.env.local` inside the `frontend` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

Open:

`http://localhost:3000`

## Application Concepts

- **Person:** A named user whose browsing history is tracked.
- **Site:** A single HTML page stored in the database.
- **Address:** The unique `.small` address of a site.
- **Link:** A connection from one site to another, including addresses that may not exist.
- **Visit:** A recorded navigation event associated with a person and an address.

## Security Considerations

Published HTML is treated as untrusted content.

Pages are rendered inside a sandboxed iframe. JavaScript execution is disabled, and a Content Security Policy restricts resource loading, network connections, form submissions, and other potentially unsafe actions.

The application is designed for a constrained browsing environment rather than unrestricted internet access.

## Scope

The application focuses on the core Small Web browsing experience. It does not implement user authentication, accounts, roles, bookmarks, browser tabs, extensions, downloads, external internet browsing, or image hosting.

## Development

Run the frontend and backend in separate terminals. Make sure MongoDB is accessible and the environment variables are configured before starting the application.