import os
import aiohttp
from typing import Dict, Any, Optional

class SupabaseClient:
    """Custom Supabase client for working with SuperTokens JWT"""

    def __init__(self, supabase_url: str, anon_key: str):
        self.supabase_url = supabase_url.rstrip('/')
        self.anon_key = anon_key

    def _get_headers(self, access_token: str) -> Dict[str, str]:
        """Get headers for Supabase requests with custom JWT"""
        return {
            'Authorization': f'Bearer {access_token}',
            'apikey': self.anon_key,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }

    async def insert(self, table: str, data: Dict[str, Any], access_token: str) -> Dict[str, Any]:
        """Insert data into Supabase table"""
        url = f'{self.supabase_url}/rest/v1/{table}'
        headers = self._get_headers(access_token)

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data) as response:
                if response.status in [200, 201]:
                    return {'data': await response.json(), 'error': None}
                else:
                    error_text = await response.text()
                    return {'data': None, 'error': {'message': error_text, 'status': response.status}}

    async def select(self, table: str, access_token: str, columns: str = '*', filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Select data from Supabase table"""
        url = f'{self.supabase_url}/rest/v1/{table}?select={columns}'

        if filters:
            for key, value in filters.items():
                url += f'&{key}=eq.{value}'

        headers = self._get_headers(access_token)

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    return {'data': await response.json(), 'error': None}
                else:
                    error_text = await response.text()
                    return {'data': None, 'error': {'message': error_text, 'status': response.status}}

    async def update(self, table: str, data: Dict[str, Any], access_token: str, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Update data in Supabase table"""
        url = f'{self.supabase_url}/rest/v1/{table}'

        for key, value in filters.items():
            url += f'?{key}=eq.{value}'

        headers = self._get_headers(access_token)

        async with aiohttp.ClientSession() as session:
            async with session.patch(url, headers=headers, json=data) as response:
                if response.status in [200, 204]:
                    if response.status == 200:
                        return {'data': await response.json(), 'error': None}
                    else:
                        return {'data': None, 'error': None}
                else:
                    error_text = await response.text()
                    return {'data': None, 'error': {'message': error_text, 'status': response.status}}

    async def delete(self, table: str, access_token: str, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Delete data from Supabase table"""
        url = f'{self.supabase_url}/rest/v1/{table}'

        for key, value in filters.items():
            url += f'?{key}=eq.{value}'

        headers = self._get_headers(access_token)

        async with aiohttp.ClientSession() as session:
            async with session.delete(url, headers=headers) as response:
                if response.status in [200, 204]:
                    if response.status == 200:
                        return {'data': await response.json(), 'error': None}
                    else:
                        return {'data': None, 'error': None}
                else:
                    error_text = await response.text()
                    return {'data': None, 'error': {'message': error_text, 'status': response.status}}

# Global instance
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'http://localhost:8000')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0')

supabase_client = SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
