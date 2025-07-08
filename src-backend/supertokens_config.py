import os
from typing import TypeInput
from supertokens_python import init, InputAppInfo
from supertokens_python.recipe import (
    session,
    emailpassword,
    thirdparty,
    emailverification
)
from supertokens_python.recipe.thirdparty.interfaces import APIInterface, APIOptions
from supertokens_python.recipe.thirdparty.types import User
from supertokens_python.recipe.session.interfaces import APIInterface as SessionAPIInterface
from supertokens_python.recipe.session.types import SessionContainer
import jwt
from datetime import datetime, timedelta

# Environment variables
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'http://localhost:8000')
SUPABASE_SIGNING_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-token-with-at-least-32-characters-long')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SERVICE_ROLE_KEY')

# App info configuration
def get_app_info() -> InputAppInfo:
    port = int(os.environ.get('PORT', 8000))
    api_base_path = '/auth/'

    # Use environment variables or fallback to localhost
    website_domain = os.environ.get('APP_URL', os.environ.get('VITE_APP_URL', f'http://localhost:{port}'))

    return InputAppInfo(
        app_name='AIaW - AI as Workspace',
        website_domain=website_domain,
        api_domain=website_domain,
        api_base_path=api_base_path,
    )

# Backend configuration
def get_backend_config() -> TypeInput:
    return {
        'framework': 'fastapi',
        'supertokens': {
            'connection_uri': os.environ.get('SUPERTOKENS_CONNECTION_URI', 'https://try.supertokens.com'),
            'api_key': os.environ.get('SUPERTOKENS_API_KEY'),
        },
        'app_info': get_app_info(),
        'recipe_list': [
            emailverification.init(mode='REQUIRED'),
            thirdparty.init(
                sign_in_and_up_feature={
                    'providers': [
                        thirdparty.ProviderInput(
                            config=thirdparty.ProviderConfig(
                                third_party_id='google',
                                clients=[
                                    thirdparty.ProviderClientConfig(
                                        client_id=os.environ.get('GOOGLE_CLIENT_ID'),
                                        client_secret=os.environ.get('GOOGLE_CLIENT_SECRET'),
                                    ),
                                ],
                            ),
                        ),
                        thirdparty.ProviderInput(
                            config=thirdparty.ProviderConfig(
                                third_party_id='github',
                                clients=[
                                    thirdparty.ProviderClientConfig(
                                        client_id=os.environ.get('GITHUB_CLIENT_ID'),
                                        client_secret=os.environ.get('GITHUB_CLIENT_SECRET'),
                                    ),
                                ],
                            ),
                        ),
                        thirdparty.ProviderInput(
                            config=thirdparty.ProviderConfig(
                                third_party_id='apple',
                                clients=[
                                    thirdparty.ProviderClientConfig(
                                        client_id=os.environ.get('APPLE_CLIENT_ID'),
                                        additional_config={
                                            'keyId': os.environ.get('APPLE_KEY_ID'),
                                            'privateKey': os.environ.get('APPLE_PRIVATE_KEY', '').replace('\\n', '\n'),
                                            'teamId': os.environ.get('APPLE_TEAM_ID'),
                                        },
                                    ),
                                ],
                            ),
                        ),
                    ],
                },
                override=thirdparty.InputOverrideConfig(
                    apis=thirdparty.APIInterface(
                        sign_in_up_post=sign_in_up_post_override,
                    ),
                ),
            ),
            emailpassword.init(),
            session.init(
                override=session.InputOverrideConfig(
                    apis=session.APIInterface(
                        create_new_session=create_new_session_override,
                    ),
                ),
            ),
        ],
        'is_in_serverless_env': True,
    }

# Override for third-party sign in/up
async def sign_in_up_post_override(
    api_implementation: APIInterface,
    tenant_id: str,
    api_options: APIOptions,
    user_context: dict,
) -> thirdparty.SignInUpPostResponse:
    # Call the original implementation
    response = await api_implementation.sign_in_up_post(tenant_id, api_options, user_context)

    # If sign up was successful and a new user was created
    if response.is_ok() and response.user.is_new_user:
        # Create Supabase JWT token
        supabase_token = create_supabase_jwt(response.user.user_id)

        # Store user in Supabase (you can implement this based on your needs)
        # await store_user_in_supabase(response.user, supabase_token)

        # Add the token to the session
        if hasattr(response, 'session'):
            response.session.set_access_token_payload({
                'supabase_token': supabase_token,
            })

    return response

# Override for session creation
async def create_new_session_override(
    api_implementation: SessionAPIInterface,
    user_id: str,
    access_token_payload: dict,
    session_data: dict,
    user_context: dict,
) -> SessionContainer:
    # Create Supabase JWT token
    supabase_token = create_supabase_jwt(user_id)

    # Add the token to the access token payload
    access_token_payload['supabase_token'] = supabase_token

    # Call the original implementation
    return await api_implementation.create_new_session(
        user_id, access_token_payload, session_data, user_context
    )

# Create Supabase JWT token
def create_supabase_jwt(user_id: str) -> str:
    payload = {
        'sub': user_id,
        'user_id': user_id,
        'exp': int((datetime.utcnow() + timedelta(hours=1)).timestamp()),
        'iat': int(datetime.utcnow().timestamp()),
        'iss': 'supertokens',
        'aud': 'authenticated',
    }

    return jwt.encode(payload, SUPABASE_SIGNING_SECRET, algorithm='HS256')

# Initialize SuperTokens
def init_supertokens():
    init(get_backend_config())
