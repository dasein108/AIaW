#!/usr/bin/env python3
"""
Script to create .env file from env.example
"""

import os
import shutil

def create_env_file():
    """Create .env file from env.example if it doesn't exist"""
    env_example = "env.example"
    env_file = ".env"
    
    if os.path.exists(env_file):
        print(f"✅ {env_file} already exists")
        return
    
    if os.path.exists(env_example):
        shutil.copy(env_example, env_file)
        print(f"✅ Created {env_file} from {env_example}")
        print("📝 Please edit .env file with your actual configuration values")
    else:
        print(f"❌ {env_example} not found")
        print("Creating basic .env file...")
        
        # Create basic .env content
        env_content = """# Supabase Configuration
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# SuperTokens Configuration
SUPERTOKENS_CONNECTION_URI=https://try.supertokens.com

# Server Configuration
API_PORT=3001
WEBSITE_PORT=3000
"""
        
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        print(f"✅ Created {env_file}")

if __name__ == "__main__":
    create_env_file() 