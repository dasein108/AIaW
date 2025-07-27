from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from uuid import UUID
import logging
from kg_engine.models import SearchType, EdgeMetadata, EdgeData, RelationshipStatus
from kg_engine.config import Neo4jConfig
from kg_engine import InputItem, parse_date

from models.kg import (
  ProcessInputRequest,
  ProcessInputResponse,
  SearchRequest,
  SearchResponse,
  SearchResult,
  NodeRelationsResponse,
  NodeRelationsRequest,
  EdgeResult,
  HealthResponse,
  EdgeResponse,
  CreateEdgeRequest,
  UpdateEdgeRequest,
  NodeResponse,
  MergeNodesResponse,
  CreateNodeRequest,
  UpdateNodeRequest,
  MergeNodesAutoRequest,
  MergeNodesManualRequest
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Global engine instance (initialized on startup from app.py)
engine = None


def set_engine(engine_instance):
  """Set the engine instance"""
  global engine
  engine = engine_instance


@router.post("/process", response_model=ProcessInputResponse)
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


@router.post("/search", response_model=SearchResponse)
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

    # Perform search
    response = engine.search(
      query=request.query,
      k=request.k,
      search_type=SearchType(request.search_type)
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


@router.post("/node-relations", response_model=NodeRelationsResponse)
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


@router.get("/stats")
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


@router.get("/health", response_model=HealthResponse)
async def health_check():
  """Check API and database health"""
  neo4j_connected = False

  try:
    neo4j_config = Neo4jConfig()
    neo4j_connected = neo4j_config.verify_connectivity()
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

  return HealthResponse(
    status="healthy" if engine is not None else "unhealthy",
    neo4j_connected=neo4j_connected,
    engine_initialized=engine is not None,
    version="2.1.0"
  )


# =============================================================================
# EDGE CRUD OPERATIONS
# =============================================================================

@router.post("/edges", response_model=EdgeResponse)
async def create_edge(request: CreateEdgeRequest):
  """
  Create a new edge in the knowledge graph

  - **subject**: Subject entity name
  - **relationship**: Relationship type
  - **object**: Object entity name
  - **summary**: Human-readable summary
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    # Parse dates if provided
    from_date = None
    to_date = None
    if request.from_date:
      from_date = parse_date(request.from_date)
    if request.to_date:
      to_date = parse_date(request.to_date)

    # Create edge metadata
    metadata = EdgeMetadata(
      summary=request.summary,
      confidence=request.confidence,
      source=request.source,
      user_id=str(request.user_id) if request.user_id else None,
      category=request.category,
      from_date=from_date,
      to_date=to_date,
      additional_metadata=request.additional_metadata
    )

    # Create edge data
    edge_data = EdgeData(
      subject=request.subject,
      relationship=request.relationship,
      object=request.object,
      metadata=metadata
    )

    # Check for duplicates
    duplicates = engine.graph_db.find_duplicate_edges(edge_data)
    if duplicates:
      raise HTTPException(status_code=409, detail="Edge already exists")

    # Add edge to graph
    success = engine.graph_db.add_edge_data(edge_data)
    if not success:
      raise HTTPException(status_code=500, detail="Failed to create edge")

    # Get the created edge
    created_edges = engine.graph_db.find_duplicate_edges(edge_data)
    if not created_edges:
      raise HTTPException(status_code=500, detail="Edge created but not found")

    edge = created_edges[0]
    return EdgeResponse(
      edge_id=edge.edge_id,
      subject=edge.get_subject_safe() or request.subject,
      relationship=edge.get_relationship_safe() or request.relationship,
      object=edge.get_object_safe() or request.object,
      summary=edge.metadata.summary,
      confidence=edge.metadata.confidence,
      user_id=UUID(edge.metadata.user_id) if edge.metadata.user_id else None,
      source=edge.metadata.source,
      category=edge.metadata.category,
      from_date=edge.metadata.from_date.isoformat() if edge.metadata.from_date else None,
      to_date=edge.metadata.to_date.isoformat() if edge.metadata.to_date else None,
      obsolete=edge.metadata.obsolete,
      status=edge.metadata.status.value,
      created_at=edge.metadata.created_at.isoformat() if edge.metadata.created_at else None,
      updated_at=edge.metadata.updated_at.isoformat() if edge.metadata.updated_at else None,
      additional_metadata=edge.metadata.additional_metadata or {}
    )

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Error creating edge: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@router.get("/edges/{edge_id}", response_model=EdgeResponse)
async def get_edge(edge_id: str):
  """
  Get a specific edge by ID
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    edge = engine.graph_db.get_edge_by_id(edge_id)
    if not edge:
      raise HTTPException(status_code=404, detail="Edge not found")

    return EdgeResponse(
      edge_id=edge.edge_id,
      subject=edge.get_subject_safe() or "Unknown",
      relationship=edge.get_relationship_safe() or "Unknown",
      object=edge.get_object_safe() or "Unknown",
      summary=edge.metadata.summary,
      confidence=edge.metadata.confidence,
      user_id=UUID(edge.metadata.user_id) if edge.metadata.user_id else None,
      source=edge.metadata.source,
      category=edge.metadata.category,
      from_date=edge.metadata.from_date.isoformat() if edge.metadata.from_date else None,
      to_date=edge.metadata.to_date.isoformat() if edge.metadata.to_date else None,
      obsolete=edge.metadata.obsolete,
      status=edge.metadata.status.value,
      created_at=edge.metadata.created_at.isoformat() if edge.metadata.created_at else None,
      updated_at=edge.metadata.updated_at.isoformat() if edge.metadata.updated_at else None,
      additional_metadata=edge.metadata.additional_metadata or {}
    )

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Error getting edge: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@router.put("/edges/{edge_id}", response_model=EdgeResponse)
async def update_edge(edge_id: str, request: UpdateEdgeRequest):
  """
  Update an existing edge
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    # Get existing edge
    edge = engine.graph_db.get_edge_by_id(edge_id)
    if not edge:
      raise HTTPException(status_code=404, detail="Edge not found")

    # Update metadata fields
    if request.summary is not None:
      edge.metadata.summary = request.summary
    if request.confidence is not None:
      edge.metadata.confidence = request.confidence
    if request.source is not None:
      edge.metadata.source = request.source
    if request.category is not None:
      edge.metadata.category = request.category
    if request.from_date is not None:
      edge.metadata.from_date = parse_date(request.from_date)
    if request.to_date is not None:
      edge.metadata.to_date = parse_date(request.to_date)
    if request.obsolete is not None:
      edge.metadata.obsolete = request.obsolete
      if request.obsolete:
        edge.metadata.status = RelationshipStatus.OBSOLETE
      else:
        edge.metadata.status = RelationshipStatus.ACTIVE
    if request.additional_metadata is not None:
      edge.metadata.additional_metadata = request.additional_metadata

    edge.metadata.updated_at = datetime.now()

    # Update in database
    success = engine.graph_db.update_edge_metadata(edge_id, edge.metadata)
    if not success:
      raise HTTPException(status_code=500, detail="Failed to update edge")

    return EdgeResponse(
      edge_id=edge.edge_id,
      subject=edge.get_subject_safe() or "Unknown",
      relationship=edge.get_relationship_safe() or "Unknown",
      object=edge.get_object_safe() or "Unknown",
      summary=edge.metadata.summary,
      confidence=edge.metadata.confidence,
      user_id=UUID(edge.metadata.user_id) if edge.metadata.user_id else None,
      source=edge.metadata.source,
      category=edge.metadata.category,
      from_date=edge.metadata.from_date.isoformat() if edge.metadata.from_date else None,
      to_date=edge.metadata.to_date.isoformat() if edge.metadata.to_date else None,
      obsolete=edge.metadata.obsolete,
      status=edge.metadata.status.value,
      created_at=edge.metadata.created_at.isoformat() if edge.metadata.created_at else None,
      updated_at=edge.metadata.updated_at.isoformat() if edge.metadata.updated_at else None,
      additional_metadata=edge.metadata.additional_metadata or {}
    )

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Error updating edge: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@router.delete("/edges/{edge_id}")
async def delete_edge(edge_id: str):
  """
  Delete an edge from the knowledge graph
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    # Check if edge exists
    edge = engine.graph_db.get_edge_by_id(edge_id)
    if not edge:
      raise HTTPException(status_code=404, detail="Edge not found")

    # Delete edge
    success = engine.graph_db.delete_edge(edge_id)
    if not success:
      raise HTTPException(status_code=500, detail="Failed to delete edge")

    return {"message": "Edge deleted successfully"}

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Error deleting edge: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@router.get("/edges")
async def list_edges(
  skip: int = Query(0, ge=0, description="Number of edges to skip"),
  limit: int = Query(50, ge=1, le=500, description="Number of edges to return"),
  user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
  category: Optional[str] = Query(None, description="Filter by category"),
  relationship: Optional[str] = Query(None, description="Filter by relationship type"),
  include_obsolete: bool = Query(False, description="Include obsolete edges")
):
  """
  List edges with pagination and filtering
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    edges = engine.graph_db.list_edges(
      skip=skip,
      limit=limit,
      user_id=str(user_id) if user_id else None,
      category=category,
      relationship=relationship,
      include_obsolete=include_obsolete
    )

    edge_responses = []
    for edge in edges:
      edge_responses.append(EdgeResponse(
        edge_id=edge.edge_id,
        subject=edge.get_subject_safe() or "Unknown",
        relationship=edge.get_relationship_safe() or "Unknown",
        object=edge.get_object_safe() or "Unknown",
        summary=edge.metadata.summary,
        confidence=edge.metadata.confidence,
        user_id=UUID(edge.metadata.user_id) if edge.metadata.user_id else None,
        source=edge.metadata.source,
        category=edge.metadata.category,
        from_date=edge.metadata.from_date.isoformat() if edge.metadata.from_date else None,
        to_date=edge.metadata.to_date.isoformat() if edge.metadata.to_date else None,
        obsolete=edge.metadata.obsolete,
        status=edge.metadata.status.value,
        created_at=edge.metadata.created_at.isoformat() if edge.metadata.created_at else None,
        updated_at=edge.metadata.updated_at.isoformat() if edge.metadata.updated_at else None,
        additional_metadata=edge.metadata.additional_metadata or {}
      ))

    return {
      "edges": edge_responses,
      "total": len(edge_responses),
      "skip": skip,
      "limit": limit
    }

  except Exception as e:
    logger.error(f"Error listing edges: {e}")
    raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# NODE CRUD OPERATIONS
# =============================================================================

@router.post("/nodes", response_model=NodeResponse)
async def create_node(request: CreateNodeRequest):
  """
  Create a new node in the knowledge graph

  - **name**: Node name (must be unique)
  - **node_type**: Node type/label
  - **properties**: Additional node properties
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    # Check if node already exists
    existing_node = engine.graph_db.get_node_by_name(request.name)
    if existing_node:
      raise HTTPException(status_code=409, detail="Node already exists")

    # Add user_id to properties if provided
    properties = request.properties.copy() if request.properties else {}
    if request.user_id:
      properties["user_id"] = str(request.user_id)

    # Create node
    success = engine.graph_db.create_node(
      name=request.name,
      node_type=request.node_type,
      properties=properties
    )

    if not success:
      raise HTTPException(status_code=500, detail="Failed to create node")

    # Get the created node
    node = engine.graph_db.get_node_by_name(request.name)
    if not node:
      raise HTTPException(status_code=500, detail="Node created but not found")

    return NodeResponse(
      name=node["name"],
      node_type=node.get("node_type", "Entity"),
      properties=node.get("properties", {}),
      relationships_count=node.get("relationships_count", 0),
      created_at=node.get("created_at"),
      updated_at=node.get("updated_at")
    )

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Error creating node: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@router.get("/nodes/{node_name}", response_model=NodeResponse)
async def get_node(node_name: str):
  """
  Get a specific node by name
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    node = engine.graph_db.get_node_by_name(node_name)
    if not node:
      raise HTTPException(status_code=404, detail="Node not found")

    return NodeResponse(
      name=node["name"],
      node_type=node.get("node_type", "Entity"),
      properties=node.get("properties", {}),
      relationships_count=node.get("relationships_count", 0),
      created_at=node.get("created_at"),
      updated_at=node.get("updated_at")
    )

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Error getting node: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@router.put("/nodes/{node_name}", response_model=NodeResponse)
async def update_node(node_name: str, request: UpdateNodeRequest):
  """
  Update an existing node
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    # Check if node exists
    node = engine.graph_db.get_node_by_name(node_name)
    if not node:
      raise HTTPException(status_code=404, detail="Node not found")

    # Prepare updated properties
    updated_properties = node.get("properties", {}).copy() if request.merge_properties else {}
    if request.properties:
      if request.merge_properties:
        updated_properties.update(request.properties)
      else:
        updated_properties = request.properties

    # Update node
    success = engine.graph_db.update_node(
      name=node_name,
      node_type=request.node_type or node.get("node_type"),
      properties=updated_properties
    )

    if not success:
      raise HTTPException(status_code=500, detail="Failed to update node")

    # Get updated node
    updated_node = engine.graph_db.get_node_by_name(node_name)

    return NodeResponse(
      name=updated_node["name"],
      node_type=updated_node.get("node_type", "Entity"),
      properties=updated_node.get("properties", {}),
      relationships_count=updated_node.get("relationships_count", 0),
      created_at=updated_node.get("created_at"),
      updated_at=updated_node.get("updated_at")
    )

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Error updating node: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@router.delete("/nodes/{node_name}")
async def delete_node(
  node_name: str,
  delete_relationships: bool = Query(False, description="Also delete all relationships")
):
  """
  Delete a node from the knowledge graph

  - **delete_relationships**: If True, also delete all relationships connected to this node
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    # Check if node exists
    node = engine.graph_db.get_node_by_name(node_name)
    if not node:
      raise HTTPException(status_code=404, detail="Node not found")

    # Delete node
    success = engine.graph_db.delete_node(node_name, delete_relationships=delete_relationships)
    if not success:
      raise HTTPException(status_code=500, detail="Failed to delete node")

    return {"message": "Node deleted successfully"}

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Error deleting node: {e}")
    raise HTTPException(status_code=500, detail=str(e))



@router.get("/nodes")
async def list_nodes(
  skip: int = Query(0, ge=0, description="Number of nodes to skip"),
  limit: int = Query(50, ge=1, le=500, description="Number of nodes to return"),
  node_type: Optional[str] = Query(None, description="Filter by node type"),
  user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
  has_relationships: Optional[bool] = Query(None, description="Filter by relationship existence")
):
  """
  List nodes with pagination and filtering
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    nodes = engine.graph_db.list_nodes(
      skip=skip,
      limit=limit,
      node_type=node_type,
      user_id=str(user_id) if user_id else None,
      has_relationships=has_relationships
    )

    node_responses = []
    for node in nodes:
      node_responses.append(NodeResponse(
        name=node["name"],
        node_type=node.get("node_type", "Entity"),
        properties=node.get("properties", {}),
        relationships_count=node.get("relationships_count", 0),
        created_at=node.get("created_at"),
        updated_at=node.get("updated_at")
      ))

    return {
      "nodes": node_responses,
      "total": len(node_responses),
      "skip": skip,
      "limit": limit
    }

  except Exception as e:
    logger.error(f"Error listing nodes: {e}")
    raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# NODE MERGING OPERATIONS
# =============================================================================

@router.post("/nodes/merge-auto", response_model=MergeNodesResponse)
async def merge_nodes_auto(request: MergeNodesAutoRequest):
  """
  Automatically merge two nodes using LLM intelligence

  This endpoint uses AI to intelligently merge two nodes by:
  - Analyzing both nodes' properties and relationships
  - Resolving naming conflicts automatically
  - Combining metadata intelligently
  - Transferring all relationships to the merged node

  - **source_node**: First node name to merge
  - **target_node**: Second node name to merge
  - **merge_strategy**: Currently supports "intelligent" LLM-based merging
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    # Call the auto merge method from GraphDB
    result = engine.graph_db.merge_nodes_auto(
      source_node=request.source_node,
      target_node=request.target_node,
      merge_strategy=request.merge_strategy
    )

    # Convert result to response format
    return MergeNodesResponse(
      success=result.get("success", False),
      merged_node_name=result.get("merged_node_name"),
      relationships_transferred=result.get("relationships_transferred"),
      nodes_deleted=result.get("nodes_deleted", []),
      execution_time_ms=result.get("execution_time_ms"),
      error=result.get("error"),
      details=result.get("details", {})
    )

  except Exception as e:
    logger.error(f"Error in auto merge nodes: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@router.post("/nodes/merge-manual", response_model=MergeNodesResponse)
async def merge_nodes_manual(request: MergeNodesManualRequest):
  """
  Manually merge two nodes with user-specified details

  This endpoint allows precise control over node merging by:
  - Using user-specified name for the merged node
  - Applying user-defined properties to the merged node
  - Transferring all relationships from both source nodes
  - Providing detailed merge statistics

  - **source_node**: First node name to merge
  - **target_node**: Second node name to merge
  - **new_name**: Name for the resulting merged node
  - **new_properties**: Properties to assign to the merged node
  """
  if not engine:
    raise HTTPException(status_code=503, detail="Engine not initialized")

  try:
    # Call the manual merge method from GraphDB
    result = engine.graph_db.merge_nodes_manual(
      source_node=request.source_node,
      target_node=request.target_node,
      new_name=request.new_name,
      new_metadata=request.new_properties
    )

    # Convert result to response format
    return MergeNodesResponse(
      success=result.get("success", False),
      merged_node_name=result.get("merged_node_name"),
      relationships_transferred=result.get("relationships_transferred"),
      nodes_deleted=result.get("nodes_deleted", []),
      execution_time_ms=result.get("execution_time_ms"),
      error=result.get("error"),
      details=result.get("details", {})
    )

  except Exception as e:
    logger.error(f"Error in manual merge nodes: {e}")
    raise HTTPException(status_code=500, detail=str(e))
