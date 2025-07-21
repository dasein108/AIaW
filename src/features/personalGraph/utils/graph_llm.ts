import { generateObject, LanguageModelV1, Tool } from "ai"
import z from "zod"

import { engine } from "@/features/dialogs/utils/templateEngine"

import { PersonalGraphType } from "../types"

const UserSummarySchema = z.object({
  items: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
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
  <format_description>List of facts in json format, each point is an item of the list with title and description </format_description>
  <language_rule>Use simple, clear language. Must be in English.</language_rule>
  <length_rule>1-3 short sentences, with preference for brevity</length_rule>
  <json_format>
  <items>
  <item>
  <title>string</title>
  <description>string</description>
  </item>
  </items>
  </json_format>
</output_specifications>

<examples>
  <example name="personality">
	items: [
		{
			"title": "Lives in",
			"description": "Lives in Portugal"
		},
		{
			"title": "Languages",
			"description": "English, Portugesse, Chinesse"
		},
		{
			"title": "Interested in",
			"description": "traveling and learning new languages"
		},
		{
			"title": "Characteristics",
			"description": "detail-oriented and curious"
		}
	]
  </example>
  <example name="facts">
	[
		{
			"title": "Known for",
			"description": "Just read the book 'the Capital' of Karl Marx"
		},
		{
			"title": "Known for",
			"description": "Watched movie Titanic"
		},
		{
			"title": "Education",
			"description": "Graduated from university in 2020 with a degree in Computer Science."
		},
		{
			"title": "Worked at",
			"description": "Cybernet from May 2020 till September 2022"
		},
		{
			"title": "Travel plans",
			"description": "China in September 2025"
		},
		{
			"title": "Services provided",
			"description": "Does manicure for money at the moment"
		},
		{
			"title": "Traveled to",
			"description": "India from 01.07.2025 to 20.07.2025"
		}
	]
  </example>
  <example name="wishlist">
	[
		"Selling",
			"description": "Macbook model M4, 512 GB SSD, 32 GB RAM for 2000$"
		},
		{
			"title": "Hiring",
			"description": "Looking for frontend developer for AI project, with stack: react, supabase, material-ui."
		},
		{
			"title": "Looking for",
			"description": "backend developer position for AI project with stack graphiti, puthon, llm, fastAPU"
		},
		{
			"title": "Looking for",
			"description": "travel partner into China for September 2025"
		},
		{
			"title": "Looking for",
			"description": "Looking for clients for psychotherapy sessions for donation"
		},
		{
			"title": "Wants to",
			"description": "Wants to buy an island"
		},
	]
  </example>
</examples>

<final_instruction>
  Based *only* on the  brief provided in the \`<input>\` section, generate the summary points according to all the rules and examples specified above.
  Output *only* the list of items in json format, with title and description.
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
  // group by title
  const groups: Record<string, UserSummaryItem[]> = {}
  for (const item of summary) {
    if (!groups[item.title]) groups[item.title] = []

    groups[item.title].push(item)
  }

  // for each group, add a header and the descriptions
  for (const [title, items] of Object.entries(groups)) {
    lines.push(`## ${title}`)
    lines.push(items.map(item => `- ${item.description}`).join("\n"))
  }

  return lines.join("\n")
}

const addGraphItems = async (tool: Tool, userName: string, graphType: PersonalGraphType, graphItems: UserSummaryItem[]) => {
  const results = []
  for (const item of graphItems) {
    const body = {
      // uuid: myProfile.value.id,
      group_id: userName,
      source: "text",
      source_description: `${userName} ${graphType}`,
      name: `${userName} - ${item.title}`,
      episode_body: `${userName}: ${item.description}`,
      // episode_body: JSON.stringify({
      //   user_name: userName,
      //   items: `${userName}: ${item.description}`
      // }).replace(/"/g, '\\"'),
    }
    const { isError, ...result } = await tool.execute(body, {
      toolCallId: "add_memory", messages: []
    })
    try {
      results.push(isError ? `Error: ${result}` : JSON.parse(result.content[0].text).message)
    } catch (error) {
      results.push(`Error: ${result}`)
    }
    console.log("---rawResult", body, result)
  }

  return results
}

export type { UserSummaryItem }

export { generateGraphSummary, graphSummaryToMarkdown, addGraphItems }
