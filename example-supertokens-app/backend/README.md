# Backend Setup

## Environment Variables

To configure the backend, create a `.env` file in the backend directory with the following variables:

### Option 1: Using the setup script (Recommended)
```bash
python3 setup_env.py
```

### Option 2: Manual setup
```bash
# Copy the example file
cp env.example .env
```

### Required Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `JWT_SECRET`: Secret key for JWT tokens (at least 32 characters)
- `SUPERTOKENS_CONNECTION_URI`: SuperTokens connection URI
- `API_PORT`: Port for the API server (default: 3001)
- `WEBSITE_PORT`: Port for the website (default: 3000)

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create and configure your `.env` file:
```bash
python3 setup_env.py
```

3. Run the application:
```bash
python app.py
```

## Development

The backend uses:
- FastAPI for the web framework
- SuperTokens for authentication
- Supabase for database
- Python-dotenv for environment variable management

## Environment File Structure

The `.env` file is automatically loaded when the application starts. You can modify the values in the `.env` file to match your configuration without restarting the application. 