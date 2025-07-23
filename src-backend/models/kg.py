from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal
from uuid import UUID, uuid4

# Pydantic models for API
class ProcessInputRequest(BaseModel):
  """Request model for processing natural language input"""
  user_id: UUID = Field(..., description="User ID (GUID) for tracking ownership")
  descriptions: List[str] = Field(..., description="List of natural language descriptions to process")
  metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

  @validator('user_id')
  def validate_user_id(cls, v):
    """Ensure user_id is a valid UUID"""
    if isinstance(v, str):
      try:
        return UUID(v)
      except ValueError:
        raise ValueError("user_id must be a valid UUID")
    return v

  class Config:
    schema_extra = {
      "example": {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "descriptions": [
          "Alice works as a software engineer at Google",
          "Bob lives in San Francisco"
        ],
        "metadata": {
          "source": "web_form",
          "timestamp": "2024-01-01T00:00:00Z"
        }
      }
    }

class EdgeResult(BaseModel):
  """Individual edge processing result"""
  action: str
  message: Optional[str] = None
  input_description: str
  extracted_info: Optional[Dict[str, Any]] = None
  count: Optional[int] = None
  conflicts_resolved: Optional[int] = None
  obsoleted_relationships: Optional[List[str]] = None
  search_info: Optional[str] = None


class ProcessInputResponse(BaseModel):
  """Response model for input processing"""
  status: str
  user_id: UUID
  processed_items: int
  new_edges: int
  updated_edges: int
  obsoleted_edges: int
  duplicates_ignored: int
  processing_time_ms: float
  errors: List[str] = Field(default_factory=list)
  edge_results: List[EdgeResult] = Field(default_factory=list)


class SearchRequest(BaseModel):
  """Request model for searching the knowledge graph"""
  query: str = Field(..., description="Natural language search query")
  search_type: Literal["graph", "vector", "both"] = Field(
    default="both",
    description="Type of search to perform"
  )
  user_id: Optional[UUID] = Field(
    None,
    description="Optional: Filter results by user ID"
  )
  k: int = Field(
    default=10,
    ge=1,
    le=100,
    description="Number of results to return"
  )

  class Config:
    schema_extra = {
      "example": {
        "query": "Who works in technology?",
        "search_type": "both",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "k": 10
      }
    }


class SearchResult(BaseModel):
  """Individual search result"""
  subject: str
  relationship: str
  object: str
  confidence: float
  user_id: Optional[UUID]
  metadata: Dict[str, Any]


class SearchResponse(BaseModel):
  """Response model for search queries"""
  query: str
  search_type: str
  answer: Optional[str]
  results: List[SearchResult]
  total_results: int
  processing_time_ms: float
  user_filter_applied: bool


class HealthResponse(BaseModel):
  """Health check response"""
  status: str
  neo4j_connected: bool
  engine_initialized: bool
  version: str

class NodeRelationsRequest(BaseModel):
  """Request model for searching all relations of a node"""
  node_name: str = Field(..., description="Name of the node to search relations for")
  source: Optional[str] = Field(
    None,
    description="Optional: Filter relations by source metadata"
  )
  user_id: Optional[UUID] = Field(
    None,
    description="Optional: Filter results by user ID"
  )

  filter_obsolete: Optional[bool] = Field(
    default=True,
    description="Whether to filter out obsolete relations"
  )

  class Config:
    schema_extra = {
      "example": {
        "node_name": "Alice",
        "source": "web_form",
        "user_id": "123e4567-e89b-12d3-a456-426614174000"
      }
    }


class NodeRelationsResponse(BaseModel):
  """Response model for node relations"""
  node_name: str
  relations: List[SearchResult]
  total_relations: int
  processing_time_ms: float
