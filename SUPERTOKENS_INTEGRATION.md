# SuperTokens Integration for AIaW

This document describes the integration of SuperTokens authentication with the AIaW application, replacing the demo Supabase authentication with a custom Python backend.

## Overview

The integration provides:
- Email/password authentication
- Social login (Google, GitHub, Apple)
- Session management
- JWT token generation for Supabase compatibility
- Vue/Quasar frontend integration
- Python FastAPI backend integration

## Architecture

```
Frontend (Vue/Quasar) ←→ SuperTokens Auth ←→ Python Backend ←→ Supabase
```

## Setup Instructions

### 1. Install Dependencies

#### Frontend Dependencies
```bash
pnpm add supertokens-auth-react
```

#### Backend Dependencies
```bash
cd src-backend
python3 -m venv venv
source venv/bin/activate
pip install supertokens-python PyJWT
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp env.supertokens.example .env.supertokens
```

Configure the following variables in your `.env.supertokens` file:

#### SuperTokens Configuration
```env
SUPERTOKENS_CONNECTION_URI=https://try.supertokens.com
SUPERTOKENS_API_KEY=your-supertokens-api-key
```

#### App Configuration
```env
APP_URL=http://localhost:9005
VITE_APP_URL=http://localhost:9005
PORT=8000
```

#### OAuth Providers
```env
# Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Apple
APPLE_CLIENT_ID=your-apple-client-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=your-apple-private-key
APPLE_TEAM_ID=your-apple-team-id
```

#### Supabase Configuration
```env
SUPABASE_URL=http://localhost:8000
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:9005/auth/callback/google`
   - `http://localhost:8000/auth/callback/google`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:9005/auth/callback/github`
   - `http://localhost:8000/auth/callback/github`

#### Apple OAuth
1. Go to [Apple Developer](https://developer.apple.com/)
2. Create an App ID
3. Enable Sign In with Apple
4. Create a Service ID
5. Generate a private key
6. Configure redirect URLs

### 4. Running the Application

#### Start the Backend
```bash
cd src-backend
source venv/bin/activate
python -m uvicorn app:app --reload --port 8000
```

#### Start the Frontend
```bash
pnpm dev
```

### 5. Testing the Integration

1. Navigate to `http://localhost:9005/auth`
2. You should see the SuperTokens authentication UI
3. Try signing up/signing in with email/password or social providers
4. Check the browser console for any errors
5. Verify that the session is created and persisted

## File Structure

```
src/
├── boot/
│   └── supertokens.ts              # SuperTokens initialization
├── features/auth/
│   ├── components/
│   │   ├── SuperTokensAuth.vue     # Main auth component
│   │   ├── AuthStatus.vue          # Auth status display
│   │   └── SuperTokensProvider.vue # Provider wrapper
│   ├── composables/
│   │   └── useSuperTokens.ts       # SuperTokens composable
│   └── store/
│       └── supertokens.ts          # Pinia store for auth state
├── layouts/components/
│   └── UserAuthStatus.vue          # User auth status in header
├── pages/
│   └── AuthPage.vue                # Auth page
├── router/
│   └── routes.ts                   # Auth routes
└── services/auth/
    └── supertokens.ts              # SuperTokens configuration

src-backend/
├── app.py                          # Main FastAPI app with SuperTokens
├── supertokens_config.py           # SuperTokens configuration
└── requirements.txt                # Python dependencies
```

## Usage Examples

### Using the Auth Store
```typescript
import { useSuperTokensStore } from '@/features/auth/store/supertokens'

const authStore = useSuperTokensStore()

// Check if user is logged in
if (authStore.isLoggedIn) {
  console.log('User is authenticated:', authStore.currentUser)
}

// Login
await authStore.login()

// Logout
await authStore.logout()

// Get Supabase token
const supabaseToken = await authStore.getSupabaseToken()
```

### Using the Composable
```typescript
import { useSuperTokens } from '@/features/auth/composables/useSuperTokens'

const { checkAuth, signOut, getSession } = useSuperTokens()

// Check authentication
const isAuthenticated = await checkAuth()

// Get session
const session = await getSession()
```

### Using the Component
```vue
<template>
  <SuperTokensAuth
    :redirect-to="/dashboard"
    @auth-success="handleAuthSuccess"
    @auth-error="handleAuthError"
  />
</template>
```

## Integration with Existing Auth

The integration is designed to work alongside the existing authentication system:

1. **Dual Authentication**: Both traditional Supabase auth and SuperTokens auth are supported
2. **Unified Interface**: The `UserAuthStatus` component shows the appropriate auth method
3. **Route Protection**: Both auth methods are checked in route guards
4. **Session Management**: Each auth method manages its own session independently

### Auth Flow

1. User visits `/auth` page
2. SuperTokens UI is displayed
3. User can sign in with email/password or social providers
4. On successful authentication:
   - SuperTokens session is created
   - Supabase JWT token is generated
   - User is redirected to the main application
5. The application checks both auth methods for protected routes

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS is properly configured in the backend
   - Check that origins are correctly set

2. **OAuth Redirect Issues**
   - Verify redirect URIs are correctly configured in OAuth providers
   - Check that the domain matches your environment configuration

3. **Session Not Persisting**
   - Check browser storage settings
   - Verify SuperTokens configuration

4. **Backend Connection Issues**
   - Ensure the backend is running on the correct port
   - Check SuperTokens connection URI

### Debug Mode

Enable debug logging by setting:
```env
SUPERTOKENS_DEBUG=true
```

### Testing Endpoints

- Backend test: `http://localhost:8000/auth/test`
- Frontend auth: `http://localhost:9005/auth`

## Security Considerations

1. **Environment Variables**: Never commit sensitive environment variables to version control
2. **JWT Secrets**: Use strong, unique JWT secrets
3. **OAuth Secrets**: Keep OAuth client secrets secure
4. **HTTPS**: Use HTTPS in production
5. **Session Management**: Implement proper session timeout and refresh mechanisms

## Migration from Demo Supabase

This integration replaces the demo Supabase authentication with:
- Custom Python backend using SuperTokens
- Vue/Quasar frontend integration
- Maintained Supabase JWT compatibility
- Enhanced social login support
- Better session management

## Next Steps

1. Configure production environment variables
2. Set up proper OAuth providers for production
3. Implement user profile management
4. Add role-based access control
5. Integrate with existing Supabase data models

## Production Deployment

### Environment Variables
Set up production environment variables:
```env
SUPERTOKENS_CONNECTION_URI=your-production-supertokens-instance
SUPERTOKENS_API_KEY=your-production-api-key
APP_URL=https://your-domain.com
VITE_APP_URL=https://your-domain.com
```

### OAuth Configuration
Update OAuth provider redirect URIs for production:
- `https://your-domain.com/auth/callback/google`
- `https://your-domain.com/auth/callback/github`
- `https://your-domain.com/auth/callback/apple`

### SSL/HTTPS
Ensure HTTPS is enabled for production to maintain security.

## Support

For issues related to:
- **SuperTokens**: Check [SuperTokens documentation](https://supertokens.com/docs)
- **Vue/Quasar**: Check the respective framework documentation
- **Python/FastAPI**: Check FastAPI documentation
- **Integration Issues**: Review this documentation and check the troubleshooting section
