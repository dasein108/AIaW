import type { components } from './openapi'

// Extract types from OpenAPI components
export type ProcessInputRequest = components['schemas']['ProcessInputRequest']
export type ProcessInputResponse = components['schemas']['ProcessInputResponse']
export type NodeRelationsRequest = components['schemas']['NodeRelationsRequest']
export type NodeRelationsResponse = components['schemas']['NodeRelationsResponse']
export type SearchRequest = components['schemas']['SearchRequest']
export type SearchResponse = components['schemas']['SearchResponse']
export type SearchResult = components['schemas']['SearchResult']
export type EdgeResult = components['schemas']['EdgeResult']
export type HealthResponse = components['schemas']['HealthResponse']
