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
  search_type: Literal["direct", "vector", "both"] = Field(
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

  class UpdateEdgeRequest(BaseModel):
    """Request model for updating an edge"""
    summary: Optional[str] = Field(None, description="Updated summary")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Updated confidence")
    source: Optional[str] = Field(None, description="Updated source")
    category: Optional[str] = Field(None, description="Updated category")
    from_date: Optional[str] = Field(None, description="Updated start date")
    to_date: Optional[str] = Field(None, description="Updated end date")
    obsolete: Optional[bool] = Field(None, description="Mark as obsolete")
    additional_metadata: Optional[Dict[str, Any]] = Field(None)


class EdgeResponse(BaseModel):
  """Response model for edge operations"""
  edge_id: str
  subject: str
  relationship: str
  object: str
  summary: str
  confidence: float
  user_id: Optional[UUID]
  source: str
  category: Optional[str]
  from_date: Optional[str]
  to_date: Optional[str]
  obsolete: bool
  status: str
  created_at: Optional[str]
  updated_at: Optional[str]
  additional_metadata: Dict[str, Any]


class MergeEdgeRequest(BaseModel):
  """Request model for merging/upserting an edge"""
  subject: str = Field(..., description="Subject entity name")
  relationship: str = Field(..., description="Relationship type")
  object: str = Field(..., description="Object entity name")
  summary: str = Field(..., description="Human-readable summary")
  confidence: float = Field(default=0.8, ge=0.0, le=1.0)
  user_id: Optional[UUID] = Field(None)
  source: Optional[str] = Field(default="api")
  category: Optional[str] = Field(None)
  from_date: Optional[str] = Field(None)
  to_date: Optional[str] = Field(None)
  additional_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
  merge_strategy: Literal["update", "keep_existing", "merge_metadata"] = Field(
    default="update", description="How to handle existing edges"
  )


# CRUD Models for Nodes
class CreateNodeRequest(BaseModel):
  """Request model for creating a node"""
  name: str = Field(..., description="Node name")
  node_type: Optional[str] = Field(default="Entity", description="Node type/label")
  properties: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Node properties")
  user_id: Optional[UUID] = Field(None, description="User ID for ownership")

  class Config:
    schema_extra = {
      "example": {
        "name": "Alice",
        "node_type": "Person",
        "properties": {
          "age": 30,
          "location": "San Francisco"
        },
        "user_id": "123e4567-e89b-12d3-a456-426614174000"
      }
    }


class UpdateNodeRequest(BaseModel):
  """Request model for updating a node"""
  node_type: Optional[str] = Field(None, description="Updated node type")
  properties: Optional[Dict[str, Any]] = Field(None, description="Updated properties")
  merge_properties: bool = Field(default=True, description="Merge with existing properties")


class NodeResponse(BaseModel):
  """Response model for node operations"""
  name: str
  node_type: str
  properties: Dict[str, Any]
  relationships_count: Optional[int] = None
  created_at: Optional[str] = None
  updated_at: Optional[str] = None


class MergeNodeRequest(BaseModel):
  """Request model for merging/upserting a node"""
  name: str = Field(..., description="Node name")
  node_type: Optional[str] = Field(default="Entity", description="Node type")
  properties: Optional[Dict[str, Any]] = Field(default_factory=dict)
  user_id: Optional[UUID] = Field(None)
  merge_strategy: Literal["update", "keep_existing", "merge_properties"] = Field(
    default="merge_properties", description="How to handle existing nodes"
  )


# Models for Node Merging Operations
class MergeNodesAutoRequest(BaseModel):
  """Request model for automatic node merging using LLM"""
  source_node: str = Field(..., description="First node name to merge")
  target_node: str = Field(..., description="Second node name to merge")
  merge_strategy: Literal["intelligent"] = Field(
    default="intelligent", description="LLM-based merging strategy"
  )

  class Config:
    schema_extra = {
      "example": {
        "source_node": "Alice Johnson",
        "target_node": "Alice J.",
        "merge_strategy": "intelligent"
      }
    }


class MergeNodesManualRequest(BaseModel):
  """Request model for manual node merging with user-specified details"""
  source_node: str = Field(..., description="First node name to merge")
  target_node: str = Field(..., description="Second node name to merge")
  new_name: str = Field(..., description="Name for the merged node")
  new_properties: Optional[Dict[str, Any]] = Field(
    default_factory=dict, description="Properties for the merged node"
  )

  class Config:
    schema_extra = {
      "example": {
        "source_node": "Alice Johnson",
        "target_node": "Alice J.",
        "new_name": "Alice Johnson",
        "new_properties": {
          "type": "Person",
          "full_name": "Alice Johnson",
          "aliases": ["Alice J."]
        }
      }
    }


class MergeNodesResponse(BaseModel):
  """Response model for node merging operations"""
  success: bool
  merged_node_name: Optional[str] = None
  relationships_transferred: Optional[int] = None
  nodes_deleted: Optional[List[str]] = None
  execution_time_ms: Optional[float] = None
  error: Optional[str] = None
  details: Optional[Dict[str, Any]] = None


# CRUD Models for Edges
class CreateEdgeRequest(BaseModel):
  """Request model for creating an edge"""
  subject: str = Field(..., description="Subject entity name")
  relationship: str = Field(..., description="Relationship type")
  object: str = Field(..., description="Object entity name")
  summary: str = Field(..., description="Human-readable summary")
  confidence: float = Field(default=0.8, ge=0.0, le=1.0, description="Confidence score")
  user_id: Optional[UUID] = Field(None, description="User ID for ownership")
  source: Optional[str] = Field(default="api", description="Source of the data")
  category: Optional[str] = Field(None, description="Edge category")
  from_date: Optional[str] = Field(None, description="Start date (ISO format)")
  to_date: Optional[str] = Field(None, description="End date (ISO format)")
  additional_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

  class Config:
    schema_extra = {
      "example": {
        "subject": "Alice",
        "relationship": "WORKS_AT",
        "object": "Google",
        "summary": "Alice works at Google",
        "confidence": 0.9,
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "source": "api",
        "category": "business"
      }
    }


class UpdateEdgeRequest(BaseModel):
  """Request model for updating an edge"""
  summary: Optional[str] = Field(None, description="Updated summary")
  confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Updated confidence")
  source: Optional[str] = Field(None, description="Updated source")
  category: Optional[str] = Field(None, description="Updated category")
  from_date: Optional[str] = Field(None, description="Updated start date")
  to_date: Optional[str] = Field(None, description="Updated end date")
  obsolete: Optional[bool] = Field(None, description="Mark as obsolete")
  additional_metadata: Optional[Dict[str, Any]] = Field(None)


