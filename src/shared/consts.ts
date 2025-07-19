import { defaultModelSettings } from "@/features/assistants/consts"
import { AssistantDefaultPrompt } from "@/features/dialogs/utils/dialogTemplateDefinitions"

import { Assistant, DbAssistantInsert } from "@/services/data/types/assistant"

import { IconAvatar, McpPluginManifest } from "./types"
import { defaultAvatar, hash53 } from "./utils/functions"
import { getModelData, getProviderData } from "./utils/values"

// eslint-disable-next-line no-unused-vars
const DEFAULT_PROVIDER_DATA = {
  name: "litellm",
  model: "gpt-4o",
}

const getDefaultProviderData = () => ({
  provider: getProviderData(DEFAULT_PROVIDER_DATA.name),
  model: getModelData(DEFAULT_PROVIDER_DATA.model),
})

const getDefaultAssistant = () => {
  const { provider, model } = getDefaultProviderData()

  return {
    name: "Cyber Assistant",
    avatar: defaultAvatar("AI"),
    prompt: "",
    promptTemplate: AssistantDefaultPrompt,
    promptVars: [],
    provider,
    model,
    modelSettings: { ...defaultModelSettings },
    plugins: {},
    promptRole: "system",
    stream: true,
    workspaceId: null, // Global Assistant
    author: "master"
  } as Assistant<DbAssistantInsert>
}

const defaultWorkspaceId = "6c5326f7-e564-48f2-9e19-318f412ec174"

const CYBER_GRAPH_MCP_URL = "https://mcpo.chatcyber.ai/sse"
const GRAPHITI_MCP_URL = "https://mcp-graphiti.chatcyber.ai/sse"
const GRAPHITI_MCP_ID = hash53(GRAPHITI_MCP_URL)
const SEARCH_NGX_URL = "https://searx.chatcyber.ai/"

// Built-in MCP plugins, installed by default, can be uninstalled by design
const DEFAULT_BUILDIN_MCP_PLUGINS = [{
  id: hash53(CYBER_GRAPH_MCP_URL),
  title: "Cyber Graph",
  transport: { type: "sse", url: CYBER_GRAPH_MCP_URL },
  description: "Cyber Graph is a tool for creating and editing blockchain graphs.",
  homepage: "https://github.com/dasein108/mcp-cw-graph",
  author: "dasein",
  avatar: {
    type: "icon",
    icon: "sym_o_hub",
    hue: 200
  } as IconAvatar
}, {
  id: GRAPHITI_MCP_ID,
  title: "Graphiti",
  transport: { type: "sse", url: GRAPHITI_MCP_URL },
  description: "Graphiti is a tool for building and querying temporally-aware knowledge graphs",
  homepage: "https://github.com/getzep/graphiti",
  avatar: {
    type: "icon",
    icon: "sym_o_device_hub",
    hue: 200
  } as IconAvatar
}] as McpPluginManifest[]

const DEFAULT_BUILTIN_PLUGINS = ["kepler-plugin", "cosmos-authz", "aiaw-web"]

export {
  defaultWorkspaceId, getDefaultAssistant, getDefaultProviderData,
  DEFAULT_BUILDIN_MCP_PLUGINS, SEARCH_NGX_URL,
  DEFAULT_PROVIDER_DATA, DEFAULT_BUILTIN_PLUGINS,
  GRAPHITI_MCP_ID, GRAPHITI_MCP_URL
}
