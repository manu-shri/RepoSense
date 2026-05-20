# RepoSense

**RepoSense** is an AI-Powered GitHub Repository Intelligence tool designed to help developers quickly evaluate public open-source projects. By leveraging the power of Google Gemini and the GitHub API, RepoSense provides actionable, developer-focused insights such as production readiness, setup difficulty, and maintenance health—saving you the time of manually skimming READMEs and commit histories.

## Features

- **Deep AI Summaries**: Automated analysis of repository metadata and READMEs using Google Gemini.
- **Developer Insights**: Actionable metrics on setup difficulty, code health, and production readiness.
- **Contributor Intelligence**: Visualization of real-time engineering relationship data and contributor stats.
- **Smart Caching**: MongoDB-backed caching layer to store and retrieve previously generated repository analyses, ensuring instant results and minimizing API quota usage.

## Tech Stack

- **Frontend**: React.js, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Caching layer for AI summaries)
- **AI Integration**: Google Gemini API

## Prerequisites

- Node.js (v16 or higher)
- MongoDB running locally or on MongoDB Atlas
- GitHub Personal Access Token (for fetching repository details)
- Google Gemini API Key

## Getting Started

### 1. Install Dependencies

First, install the dependencies for both the frontend and backend from the root directory:

```bash
npm run install:all
```

### 2. Configure Environment Variables

You need to create environment variable files for both the client and server. 

**Client (`client/.env`)**
Create a `.env` file in the `client` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Server (`server/.env` or `server/src/.env`)**
Create a `.env` file for the backend and add the following:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/RepoSense
CLIENT_URL=http://localhost:5173
GITHUB_TOKEN=your_github_personal_access_token
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Start the Application

You can run both the frontend and backend concurrently from the root directory:

```bash
npm run dev
```

This will start the:
- **Client** on `http://localhost:5173`
- **Server** on `http://localhost:5000` (or the port specified in your `.env`)

## Folder Structure

```text
RepoSense/
  client/               # React frontend
    public/
    src/
      components/       # Reusable UI components
      pages/            # View pages (e.g., Code Health, Insights)
      services/         # API service calls
  server/               # Node.js/Express backend
    src/
      config/           # Database and API configurations
      controllers/      # API Logic (e.g., summaryController.js)
      models/           # MongoDB schemas
      routes/           # API routes (e.g., githubRoutes.js)
```

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
