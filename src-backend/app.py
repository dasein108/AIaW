from contextlib import asynccontextmanager

from aiohttp import ClientSession
from fastapi import FastAPI, HTTPException, Request, Response, UploadFile, Form, File, Query
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import aiohttp
from typing import Optional, Dict, Any, AsyncIterator
from fastapi.staticfiles import StaticFiles
# from llama_parse import LlamaParse
import os
import jwt
import json
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from kg_engine import KnowledgeGraphEngineV2, InputItem
from kg_engine.config import Neo4jConfig
from kg_engine.models import SearchType
import logging
from datetime import datetime
from uuid import UUID
from models.kg import (
  HealthResponse,
  ProcessInputRequest,
  ProcessInputResponse,
  SearchRequest,
  SearchResponse,
  SearchResult,
  NodeRelationsResponse,
  NodeRelationsRequest,
  EdgeResult
)

# Import the authorization module
from auth.auth_endpoints import auth_router
from auth.crypto_utils import verify_wallet_auth

load_dotenv()
# load_dotenv(find_dotenv('.env.local'), override=True)

http_client: Optional[ClientSession] = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global engine instance (initialized on startup)
engine: Optional[KnowledgeGraphEngineV2] = None


def initialize_engine():
  """Initialize the Knowledge Graph Engine on startup"""
  global engine

  try:
    logger.info("Initializing Knowledge Graph Engine...")

    # Initialize Neo4j configuration
    neo4j_config = Neo4jConfig()

    # Verify Neo4j connectivity
    if not neo4j_config.verify_connectivity():
      logger.error("Failed to connect to Neo4j")
      raise ConnectionError("Neo4j connection failed")

    # Initialize engine
    engine = KnowledgeGraphEngineV2(
      base_url=LITELLM_URL,
      neo4j_config=neo4j_config,
      bearer_token=LITELLM_API_KEY)

    logger.info("✅ Knowledge Graph Engine initialized successfully")

  except Exception as e:
    logger.error(f"Failed to initialize engine: {e}")
    raise


@asynccontextmanager
async def lifespan(app: FastAPI):
  global http_client
  http_client = aiohttp.ClientSession()
  # initialize_engine()

  yield
  await http_client.close()


app = FastAPI(lifespan=lifespan)

origins = [
  "http://localhost",
  "http://localhost:9005",
  "http://localhost:9006",
  "https://chatcyber.ai",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_origin_regex=r"https?://.+\.chatcyber\.ai",
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Connect the router for Web3 authorization
app.include_router(auth_router)

ALLOWED_PREFIXES = [
  'https://lobehub.search1api.com/api/search',
  'https://pollinations.ai-chat.top/api/drawing',
  'https://web-crawler.chat-plugin.lobehub.com/api/v1'
]

# LiteLLM proxy settings
LITELLM_URL = os.environ.get('LITELLM_URL')
LITELLM_API_KEY = os.environ.get('LITELLM_API_KEY')
IS_PRODUCTION = os.environ.get('IS_PRODUCTION', 'false').lower() == 'true'

# JWT settings for Supabase compatibility
JWT_SECRET = os.environ.get('JWT_SECRET', 'super-secret-jwt-token-with-at-least-32-characters')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRY = int(os.environ.get('JWT_EXPIRY', 3600))  # Default 1 hour

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SERVICE_ROLE_KEY')

class ProxyRequest(BaseModel):
  method: str
  url: str
  headers: Optional[Dict[str, str]] = None
  body: Optional[Any] = None


class WalletAuthRequest(BaseModel):
    wallet_address: str
    pub_key: str
    message: Optional[str] = None
    signature: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

async def get_or_create_user(wallet_address: str, email: str) -> str:
    """
    Find or create a Supabase user by wallet_address. Returns the UUID (as string).
    Uses async aiohttp client.
    """
    global http_client
    print(f"DEBUG: get_or_create_user called for wallet: {wallet_address}")
    headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': 'application/json',
    }
    # For service requests, it is important to bypass RLS
    search_headers = {**headers, 'x-supabase-bypass-rls': 'true'}

    # 1. Search by wallet_address in the profiles table
    search_url = f"{SUPABASE_URL}/rest/v1/profiles?wallet_address=eq.{wallet_address}&select=id"
    print(f"DEBUG: Searching for existing user by wallet_address: {wallet_address}")
    async with http_client.get(search_url, headers=search_headers) as resp:
        print(f"DEBUG: Search response status: {resp.status}")
        response_text = await resp.text()

        if resp.status == 200:
            try:
                data = json.loads(response_text)
                if data:
                    supabase_uid = data[0]['id']
                    print(f"DEBUG: Found existing user: {supabase_uid}")
                    return supabase_uid
            except json.JSONDecodeError:
                raise Exception(f"Failed to parse JSON from Supabase search, content was: {response_text[:500]}")

    # 2. If not found — create a user via Supabase Auth API
    print("DEBUG: User not found, creating new user")
    password = wallet_address + "_auto_pwd_1234"
    payload = {
        "email": email,
        "password": password,
        "user_metadata": {
            "auth_type": "web3",
            "wallet_address": wallet_address,
            "name": wallet_address[:8]
        }
    }
    create_user_url = f"{SUPABASE_URL}/auth/v1/admin/users"
    print(f"DEBUG: Creating user with payload: {payload}")
    async with http_client.post(create_user_url, headers=headers, json=payload) as auth_resp:
        print(f"DEBUG: Auth API response status: {auth_resp.status}")
        response_text = await auth_resp.text()

        if auth_resp.status in (200, 201):
            try:
                response_json = json.loads(response_text)
                user = response_json.get('user', response_json)
                supabase_uid = user['id']
                print(f"DEBUG: Created user with UUID: {supabase_uid}")
                return supabase_uid
            except json.JSONDecodeError:
                raise Exception(f"Failed to parse JSON from user creation: {response_text}")

        elif auth_resp.status == 422 and 'email_exists' in response_text:
            print("DEBUG: Email already exists, trying to link wallet.")
            # This part remains complex with sync logic, for now, focus on the main path
            # The ideal solution would involve refactoring this part to be fully async as well.
            # For now, we'll raise an exception to highlight the issue if it occurs.
            raise Exception("Email exists, linking not yet implemented asynchronously.")

        print(f"DEBUG: Failed to create user. Response: {response_text}")
        raise Exception(f"Failed to create/find user for wallet: {wallet_address}")


def generate_jwt_token_for_uuid(uuid: str, wallet_address: str = None, email: str = None, metadata: Optional[Dict[str, Any]] = None) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(seconds=JWT_EXPIRY)
    payload = {
        'sub': uuid,  # UUID!
        'aud': 'authenticated',
        'role': 'authenticated',
        'iss': 'supabase',
        'iat': int(now.timestamp()),
        'exp': int(expires_at.timestamp()),
        'user_metadata': {
            'wallet_address': wallet_address,
            'email': email,
            **(metadata or {})
        }
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

@app.post('/test/test')
async def verify_wallet(request: Request):
  print("DEBUG: Received wallet verification request")
  return {"success": True}

@app.post('/cors/proxy')
async def proxy(request: ProxyRequest):
  if not any(request.url.startswith(prefix) for prefix in ALLOWED_PREFIXES):
    raise HTTPException(status_code=403, detail='URL not allowed')

  kwargs = {
    'method': request.method,
    'url': request.url,
    'headers': request.headers or {}
  }

  if request.body is not None:
    if isinstance(request.body, (dict, list)):
      kwargs['json'] = request.body
    else:
      kwargs['data'] = request.body

  try:
    async with http_client.request(**kwargs) as response:
      content = await response.read()
      return Response(content=content, status_code=response.status)
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


async def stream_response(response: aiohttp.ClientResponse) -> AsyncIterator[bytes]:
  """Stream the response data in chunks and ensure the response is closed."""
  try:
    async for chunk in response.content.iter_any():
      yield chunk
  finally:
    response.release()


@app.post('/litellm/{path:path}')
@app.get('/litellm/{path:path}')
@app.put('/litellm/{path:path}')
@app.delete('/litellm/{path:path}')
async def litellm_proxy(request: Request, path: str):
  """
  Proxy endpoint for LiteLLM API requests with streaming support.
  This endpoint forwards all requests to the LiteLLM API service.
  """
  if not LITELLM_URL:
    raise HTTPException(status_code=502, detail="LITELLM_URL environment variable not set")

  # Build the target URL by combining the configured base URL with the path
  target_url = f"{LITELLM_URL}/{path}"
  print(target_url)
  # Get request headers and body
  headers = dict(request.headers)

  # Remove headers that might cause conflicts
  headers.pop('host', None)
  headers.pop('content-length', None)
  headers.pop('transfer-encoding', None)

  # Add LiteLLM API key if provided
  if LITELLM_API_KEY:
    headers['Authorization'] = f"Bearer {LITELLM_API_KEY}"
  # Get the request body if it exists
  body = await request.body()

  try:
    # Forward the request to LiteLLM
    response = await http_client.request(
      method=request.method,
      url=target_url,
      headers=headers,
      data=body or None,
      params=request.query_params,
      allow_redirects=False,
    )

    # For streaming responses, we need to return a StreamingResponse
    if 'text/event-stream' in response.headers.get('content-type', ''):
      return StreamingResponse(
        stream_response(response),
        status_code=response.status,
        headers=dict(response.headers),
        media_type=response.headers.get('content-type')
      )

    # For regular responses, read the entire content and return
    try:
      content = await response.read()
      return Response(
        content=content,
        status_code=response.status,
        headers=dict(response.headers),
        media_type=response.headers.get('content-type')
      )
    finally:
      response.release()
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@app.post('/doc-parse/parse')
async def parse_document(
  file: UploadFile = File(...),
  language: Optional[str] = Form(default='en'),
  target_pages: Optional[str] = Form(default=None)
):
  parser = LlamaParse(
    result_type='markdown',
    language=language,
    target_pages=target_pages
  )

  file_content = await file.read()

  try:
    documents = await parser.aload_data(
      file_content,
      {'file_name': file.filename}
    )

    return {
      'success': True,
      'content': [{'text': doc.text, 'meta': doc.metadata} for doc in documents]
    }

  except Exception as e:
    return {
      'success': False,
      'error': str(e)
    }

  finally:
    await file.close()


@app.get('/searxng')
async def searxng(request: Request):
  searxng_url = os.environ.get('SEARXNG_URL')

  if not searxng_url:
    raise HTTPException(status_code=502, detail="SEARXNG_URL environment variable not set")

  query_string = request.url.query
  target_url = f"{searxng_url}?{query_string}" if query_string else searxng_url

  headers = dict(request.headers)
  # Remove host header to avoid conflicts
  headers.pop('host', None)

  try:
    async with http_client.get(target_url, headers=headers) as response:
      content = await response.read()
      return Response(
        content=content,
        status_code=response.status
      )
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@app.get("/health", response_model=HealthResponse)
async def health_check():
  """Check API and database health"""
  neo4j_connected = False

  try:
    neo4j_config = Neo4jConfig()
    neo4j_connected = neo4j_config.verify_connectivity()
  except:
    pass

  return HealthResponse(
    status="healthy" if engine is not None else "unhealthy",
    neo4j_connected=neo4j_connected,
    engine_initialized=engine is not None,
    version="2.1.0"
  )


@app.post("/process", response_model=ProcessInputResponse)
async def process_input(request: ProcessInputRequest):
  """
  Process natural language input and extract relationships

  - **user_id**: Required GUID for tracking data ownership
  - **descriptions**: List of natural language texts to process
  - **metadata**: Optional additional metadata
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  start_time = datetime.now()
  errors = []

  try:
    # Convert descriptions to InputItems with user_id in metadata
    input_items = []
    for desc in request.descriptions:
      # Merge user metadata with user_id
      item_metadata = request.metadata.copy() if request.metadata else {}
      item_metadata["user_id"] = str(request.user_id)

      input_items.append(InputItem(
        description=desc,
        metadata=item_metadata
      ))

    # Process the input
    result = engine.process_input(input_items)

    # Calculate processing time
    processing_time = (datetime.now() - start_time).total_seconds() * 1000

    # Convert edge_results to EdgeResult objects
    edge_results = []
    for edge_result in result.get("edge_results", []):
      edge_results.append(EdgeResult(
        action=edge_result.get("action", "unknown"),
        message=edge_result.get("message"),
        input_description=edge_result.get("input_description", ""),
        extracted_info=edge_result.get("extracted_info"),
        count=edge_result.get("count"),
        conflicts_resolved=edge_result.get("conflicts_resolved"),
        obsoleted_relationships=edge_result.get("obsoleted_relationships"),
        search_info=edge_result.get("search_info")
      ))

    return ProcessInputResponse(
      status="success",
      user_id=request.user_id,
      processed_items=result.get("processed_items", len(input_items)),
      new_edges=result.get("new_edges", 0),
      updated_edges=result.get("updated_edges", 0),
      obsoleted_edges=result.get("obsoleted_edges", 0),
      duplicates_ignored=result.get("duplicates_ignored", 0),
      processing_time_ms=result.get("processing_time_ms", processing_time),
      errors=result.get("errors", []),
      edge_results=edge_results
    )

  except Exception as e:
    logger.error(f"Error processing input: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@app.post("/search", response_model=SearchResponse)
async def search_knowledge_graph(request: SearchRequest):
  """
  Search the knowledge graph using natural language

  - **query**: Natural language search query
  - **search_type**: Type of search (graph/vector/both)
  - **user_id**: Optional filter by user ID
  - **k**: Number of results to return
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  start_time = datetime.now()

  try:
    # Map search type string to enum
    search_type_map = {
      "graph": SearchType.DIRECT,
      "vector": SearchType.SEMANTIC,
      "both": SearchType.BOTH
    }
    # Perform search
    response = engine.search(
      query=request.query,
      k=request.k,
      search_type=request.search_type
    )

    # Filter results by user_id if provided
    filtered_results = []
    user_filter_applied = bool(request.user_id)

    for result in response.results:
      # Extract user_id from metadata
      metadata = result.triplet.edge.metadata
      result_user_id = metadata.user_id if hasattr(metadata, 'user_id') and metadata.user_id else None

      # Apply user filter if requested
      if request.user_id and result_user_id:
        if str(request.user_id) != str(result_user_id):
          continue  # Skip results from other users

      search_result = SearchResult(
        subject=result.triplet.edge.subject,
        relationship=result.triplet.edge.relationship,
        object=result.triplet.edge.object,
        confidence=result.score,
        user_id=result_user_id,
        metadata={
          "summary": result.triplet.edge.metadata.summary,
          "status": result.triplet.edge.metadata.status.value,
          "source": result.triplet.edge.metadata.source,
          "user_id": result_user_id
        }
      )

      filtered_results.append(search_result)

    # Calculate processing time
    processing_time = (datetime.now() - start_time).total_seconds() * 1000

    return SearchResponse(
      query=request.query,
      search_type=request.search_type,
      answer=response.answer,
      results=filtered_results,
      total_results=len(filtered_results),
      processing_time_ms=processing_time,
      user_filter_applied=user_filter_applied
    )

  except Exception as e:
    logger.error(f"Error in search: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@app.post("/node-relations", response_model=NodeRelationsResponse)
async def get_node_relations(request: NodeRelationsRequest):
  """
  Get all relations for a specific node by name

  - **node_name**: Name of the node to search relations for
  - **source**: Optional filter by source metadata
  - **user_id**: Optional filter by user ID
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  start_time = datetime.now()
  print("Request", request)
  try:
    # Get node relations from engine
    relations = engine.get_node_relations(
      node_name=request.node_name,
      source=request.source,
      filter_obsolete=request.filter_obsolete
    )
    print(relations)
    # Filter results by user_id if provided
    result = []

    for relation in relations:
      search_result = SearchResult(
        subject=relation.triplet.edge.subject,
        relationship=relation.triplet.edge.relationship,
        object=relation.triplet.edge.object,
        confidence=relation.score,
        user_id=None,
        metadata={
          "summary": relation.triplet.edge.metadata.summary,
          "status": relation.triplet.edge.metadata.status.value,
          "source": relation.triplet.edge.metadata.source,
        }
      )

      result.append(search_result)

    # Calculate processing time
    processing_time = (datetime.now() - start_time).total_seconds() * 1000

    return NodeRelationsResponse(
      node_name=request.node_name,
      relations=result,
      total_relations=len(result),
      processing_time_ms=processing_time
    )

  except Exception as e:
    logger.error(f"Error getting node relations: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
async def get_statistics(user_id: Optional[UUID] = Query(None, description="Filter stats by user ID")):
  """Get system statistics, optionally filtered by user"""
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    stats = engine.get_stats()

    # Add user filtering info
    if user_id:
      stats["filter_applied"] = {
        "user_id": str(user_id),
        "note": "User-specific filtering requires metadata query implementation"
      }

    return stats

  except Exception as e:
    logger.error(f"Error getting stats: {e}")
    raise HTTPException(status_code=500, detail=str(e))


app.mount('/static', StaticFiles(directory='static'), name='static')

@app.post('/auth/wallet', response_model=AuthResponse)
async def authenticate_with_wallet(auth_request: WalletAuthRequest) -> AuthResponse:
    """
    Handles wallet-based authentication.
    Uses simple pubkey->address verification (recommended) or signature verification.
    """
    print(f"INFO: Received wallet auth request for: {auth_request.wallet_address}")
    try:
        # Primary verification: Check if public key matches wallet address
        # Additional signature verification if data is provided
        if not verify_wallet_auth(
            auth_request.wallet_address,
            auth_request.pub_key,
            auth_request.message,
            auth_request.signature
        ):
            raise HTTPException(status_code=401, detail="Wallet authentication failed")

        print(f"INFO: Wallet authentication successful for: {auth_request.wallet_address}")

        # Generate a unique, deterministic email from the wallet address
        # This avoids requiring a real email for wallet-only users
        email_for_supabase = f"{auth_request.wallet_address}@wallet.cyber.ai"

        # Find or create a Supabase user
        user_uuid = await get_or_create_user(
            wallet_address=auth_request.wallet_address,
            email=email_for_supabase
        )
        print(f"DEBUG: Got UUID: {user_uuid}")
        print("DEBUG: About to generate JWT token")
        access_token = generate_jwt_token_for_uuid(
            uuid=user_uuid,
            wallet_address=auth_request.wallet_address,
            email=email_for_supabase
        )
        print("DEBUG: JWT token generated successfully")
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=JWT_EXPIRY
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Exception in /auth/wallet: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate token: {str(e)}")

# if IS_PRODUCTION:
app.mount('/', StaticFiles(directory='static', html=True), name='static')

@app.exception_handler(404)
async def return_index(request: Request, exc: HTTPException):
  return FileResponse("static/index.html")
