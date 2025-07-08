import SuperTokensReact from 'supertokens-auth-react'
import EmailPasswordReact from 'supertokens-auth-react/recipe/emailpassword'
import EmailVerificationReact from 'supertokens-auth-react/recipe/emailverification'
import SessionReact from 'supertokens-auth-react/recipe/session'
import ThirdPartyReact from 'supertokens-auth-react/recipe/thirdparty'

// App info configuration
const getAppInfo = () => {
  const port = process.env.PORT || 9005
  const apiBasePath = '/auth/'

  // Use environment variables or fallback to localhost
  const websiteDomain = process.env.APP_URL || process.env.VITE_APP_URL || `http://localhost:${port}`

  return {
    appName: 'AIaW - AI as Workspace',
    websiteDomain,
    apiDomain: websiteDomain,
    apiBasePath,
  }
}

// Frontend configuration
export const frontendConfig = () => {
  return {
    appInfo: getAppInfo(),
    recipeList: [
      EmailVerificationReact.init({
        mode: 'REQUIRED',
      }),
      ThirdPartyReact.init({
        signInAndUpFeature: {
          providers: [
            ThirdPartyReact.Google.init(),
            ThirdPartyReact.Github.init(),
            ThirdPartyReact.Apple.init(),
          ],
        },
      }),
      EmailPasswordReact.init(),
      SessionReact.init(),
    ],
  }
}

// Initialize SuperTokens
export const initializeSuperTokens = () => {
  if (typeof window !== 'undefined') {
    SuperTokensReact.init(frontendConfig())
  }
}

// Export app info for use in other parts of the application
export const appInfo = getAppInfo()
