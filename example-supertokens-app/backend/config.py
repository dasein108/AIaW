from supertokens_python.recipe import session
from supertokens_python.recipe import dashboard
from supertokens_python.recipe import userroles
from supertokens_python.recipe import emailpassword

from supertokens_python import init, InputAppInfo, SupertokensConfig
import os
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_api_domain() -> str:
    api_port = os.environ.get('API_PORT', '3001')
    api_url = f"http://localhost:{api_port}"
    return api_url

def get_website_domain() -> str:
    website_port = os.environ.get('WEBSITE_PORT', '3000')
    website_url = f"http://localhost:{website_port}"
    return website_url

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'http://localhost:8000')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0')
SUPABASE_JWT_SECRET = os.environ.get('JWT_SECRET', 'super-secret-jwt-token-with-at-least-32-characters-long')

def create_supabase_jwt(user_id: str) -> str:
    """Create a JWT token for Supabase authentication"""
    payload = {
        'userId': user_id,
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow(),
        'iss': 'supertokens',
        'aud': 'authenticated'
    }
    return jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm='HS256')

async def insert_user_to_supabase(user_id: str, email: str, supabase_token: str):
    """Insert user into Supabase database"""
    from supabase_client import supabase_client

    data = {
        'user_id': user_id,
        'email': email
    }

    result = await supabase_client.insert('users', data, supabase_token)

    if result['error']:
        print(f"Failed to create user in Supabase: {result['error']}")
    else:
        print(f"Successfully created user {user_id} in Supabase")

def create_new_session_with_supabase_jwt(original_implementation):
    async def create_new_session(input_):
        # Generate Supabase JWT
        supabase_jwt_token = create_supabase_jwt(input_.user_id)

        # Add Supabase token to access token payload
        input_.access_token_payload = {
            **input_.access_token_payload,
            "supabase_token": supabase_jwt_token,
        }

        return await original_implementation.create_new_session(input_)

    return {
        **original_implementation,
        "create_new_session": create_new_session
    }

def sign_up_post_with_supabase(original_implementation):
    async def sign_up_post(input_):
        response = await original_implementation.sign_up_post(input_)

        if response.status == "OK":
            # Get the Supabase token from session
            access_token_payload = response.session.get_access_token_payload()
            supabase_token = access_token_payload.get("supabase_token")

            if supabase_token:
                # Create Supabase client and insert user
                await insert_user_to_supabase(
                    response.user.id,
                    response.user.emails[0],
                    supabase_token
                )

        return response

    return {
        **original_implementation,
        "sign_up_post": sign_up_post
    }

supertokens_config = SupertokensConfig(
    connection_uri=os.environ.get('SUPERTOKENS_CONNECTION_URI', 'https://try.supertokens.com')
)

app_info = InputAppInfo(
    app_name="SuperTokens Supabase Demo",
    api_domain=get_api_domain(),
    website_domain=get_website_domain(),
    api_base_path="/auth",
    website_base_path="/auth"
)

recipe_list = [
    session.init(),
    dashboard.init(),
    userroles.init(),
    emailpassword.init()
]

init(
    supertokens_config=supertokens_config,
    app_info=app_info,
    framework="fastapi",
    recipe_list=recipe_list,
    mode="asgi",
    telemetry=False
)
