import { generateObject, LanguageModelV1 } from "ai"
import axios from "axios"
import z from "zod"

import { removeUndefinedProps } from "@/shared/utils"
import { BACKEND_URL } from "@/shared/utils/config"

import { engine } from "@/features/dialogs/utils/templateEngine"

import type {
  ProcessInputRequest,
  ProcessInputResponse,
  NodeRelationsResponse,
  SearchRequest,
  SearchResponse
} from "@/services/data/types/backend"
import { ProfileExtended } from "@/services/data/types/profile"

import { PersonalGraphType } from "../types"

const UserSummarySchema = z.object({
  items: z.array(z.string()),
})

// Type inference from Zod schema
type UserSummary = z.infer<typeof UserSummarySchema>
type UserSummaryItem = UserSummary['items'][0]

const GraphSummaryPrompt = `
<instructions>
  Your task is to Analyze the input and extract concise,
  well-structured pieces of information related to the user, such as:

	- Events (e.g., graduated, traveled)
	- Skills (e.g., programming languages, hobbies)
	- Interests (e.g., topics, activities)
	- Desires or goals (e.g., wishes, plans)
	- Characteristics or personality traits

  As input accept any user’s language, generate output in plain English
</instructions>

<input>
  <description>Raw text transcription of a user’s speech. The content can be about personality, facts, or wishlist descriptions.</description>
  <brief>
  {{ brief }}
  </brief>
</input>

<output_specifications>
  <format_description>List of facts in json format, each point is an item of the list </format_description>
  <language_rule>Use simple, clear language. Must be in English.</language_rule>
  <length_rule>1-3 short sentences, with preference for brevity</length_rule>
  <json_format>
  <items>string[]</items>
  </json_format>
</output_specifications>

<examples>
  <example name="personality">
	items: [
		    "Lives in Portugal",
		  "Speaks English, Portugesse, Chinesse",
		  "Interested in traveling and learning new languages",
		  "Characteristics: detail-oriented and curious"
	]
  </example>
  <example name="facts">
	[
		"Just read the book 'the Capital' of Karl Marx",
		"Watched movie Titanic",
		"Graduated from university in 2020 with a degree in Computer Science.",
		"Worked at Cybernet from May 2020 till September 2022",
		"Planning to travel to China in September 2025",
		"Services provided: Does manicure for money at the moment"
	]
  </example>
  <example name="wishlist">
	[
		"Selling Macbook model M4, 512 GB SSD, 32 GB RAM for 2000$",
		"Looking for frontend developer for AI project, with stack: react, supabase, material-ui.",
		"Looking for backend developer position for AI project with stack graphiti, puthon, llm, fastAPU",
		"Looking for travel partner into China for September 2025",
		"Looking for clients for psychotherapy sessions for donation",
		"Wants to buy an island"
	]
  </example>
</examples>

<final_instruction>
  Based *only* on the  brief provided in the \`<input>\` section, generate the summary points according to all the rules and examples specified above.
  Output *only* the list of items in json format.
</final_instruction>
`

const generateGraphSummary = async (
  model: LanguageModelV1,
  brief: string,
): Promise<UserSummaryItem[]> => {
  const response = await generateObject({
    model,
    schema: UserSummarySchema,
    prompt: engine.parseAndRenderSync(GraphSummaryPrompt, { brief }),
  })

  console.log("---generateGraphSummary response", response)

  return response.object.items
}

const graphSummaryToMarkdown = (summary: UserSummaryItem[]) => {
  const lines: string[] = []

  // Since items are now strings, just list them
  for (const item of summary) {
    lines.push(`- ${item}`)
  }

  return lines.join("\n")
}

const getSourceName = (graphType: PersonalGraphType) => `social_graph_${graphType}`

const addItemsToKnowledgeGraph = async (user: ProfileExtended, graphType: PersonalGraphType, items: string[]): Promise<ProcessInputResponse> => {
  const requestBody: ProcessInputRequest = {
    user_id: user.id,
    descriptions: items,
    metadata: {
      source: getSourceName(graphType)
    }
  }

  try {
    const response = await axios.post<ProcessInputResponse>(`${BACKEND_URL}/process`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    return response.data
  } catch (error) {
    console.error("Error adding items to knowledge graph:", error)
    throw error
  }
}

const fetchGraphByNodeName = async (nodeName: string, graphType?: PersonalGraphType, obsolete = false): Promise<NodeRelationsResponse> => {
  const requestBody = removeUndefinedProps({
    node_name: nodeName,
    filter_obsolete: obsolete,
    source: graphType ? getSourceName(graphType) : undefined
  }) as NodeRelationsResponse

  try {
    const response = await axios.post<NodeRelationsResponse>(`${BACKEND_URL}/node-relations`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    return response.data
  } catch (error) {
    console.error("Error fetching graph by node name:", error)
    throw error
  }
}

const searchGraph = async (query: string, graphType?: PersonalGraphType): Promise<SearchResponse> => {
  const requestBody: SearchRequest = {
    query,
    k: 5,
    search_type: "both"
  }

  try {
    const response = await axios.post<SearchResponse>(`${BACKEND_URL}/search`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    return response.data
  } catch (error) {
    console.error("Error searching graph:", error)
    throw error
  }
}

export type { UserSummaryItem }

export { generateGraphSummary, graphSummaryToMarkdown, fetchGraphByNodeName, searchGraph, addItemsToKnowledgeGraph }
