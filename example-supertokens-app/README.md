# SuperTokens Supabase Demo App

This is a demo application showcasing integration between SuperTokens authentication and Supabase database.

## Project Structure

- `frontend/` - Vue.js frontend application
- `backend/` - FastAPI backend with SuperTokens integration

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Set up environment variables:
```bash
python3 setup_env.py
```

3. Install dependencies and start the backend:
```bash
npm run start:backend
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Environment Configuration

The backend uses environment variables for configuration. The setup script will create a `.env` file with default values. You can modify these values in the `.env` file:

### Backend Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `JWT_SECRET`: Secret key for JWT tokens (at least 32 characters)
- `SUPERTOKENS_CONNECTION_URI`: SuperTokens connection URI
- `API_PORT`: Port for the API server (default: 3001)
- `WEBSITE_PORT`: Port for the website (default: 3000)

## Development

### Backend
- FastAPI web framework
- SuperTokens for authentication
- Supabase for database
- Python-dotenv for environment variable management

### Frontend
- Vue.js 3
- Vite for build tooling
- SuperTokens SDK for authentication

## Available Scripts

- `npm run start:backend` - Start the backend server
- `npm run start:frontend` - Start the frontend development server
- `npm run start` - Start both backend and frontend simultaneously

## Troubleshooting

If you encounter issues:

1. Make sure all environment variables are properly set in the `.env` file
2. Check that all dependencies are installed
3. Ensure ports 3000 and 3001 are available
4. Verify your Supabase and SuperTokens configurations 