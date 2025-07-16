/* eslint-disable no-useless-escape */
/**
 * This file contains all prompt template definitions used in the dialog system.
 * It defines standardized templates for various AI-related tasks like title generation,
 * artifact extraction, and assistant system prompts.
 */
import { Boolean, Object, Optional, Static, String } from "@sinclair/typebox"

import { i18n } from "@/boot/i18n"

const GenDialogTitle = `
<instructions>
  Your task is to analyze the provided chat history between a user and an assistant and generate a concise, relevant title summarizing the conversation.
  Follow these rules strictly:

  1.  **Language:** The title's language must match the predominant language used in the chat history.
  2.  **Length:**
      - If the language is English, the title text should be approximately 3-5 words long.
      - If the language is not English (e.g., Chinese), aim for an equivalent length (e.g., approximately 6-10 characters).
  3.  **Format:** The title must start with a single relevant emoji, followed by a single space, and then the title text.
      - Format: \`[emoji] [Title Text]\`
  4.  **Content:** The title should accurately capture the main topic, question, or goal of the conversation.
  5.  **Output:** Generate *only* the title in the specified format. Do not include any explanations or surrounding text.

</instructions>

<input>
  <description>Chat history between user and assistant:</description>
  <chat_history>
    {%- for content in contents %}
    {%- if content.type == 'user-message' %}
    <user_message>
      {{ content.text }}
    </user_message>
    {%- elsif content.type == 'assistant-message' %}
    <assistant_message>
      {{ content.text }}
    </assistant_message>
    {%- endif %}
    {%- endfor %}
  </chat_history>
</input>

<output_specifications>
  <format_description>A single line containing one emoji, one space, and the title text.</format_description>
  <language_rule>Must match the language of the chat_history.</language_rule>
  <length_rule_english>3-5 words</length_rule_english>
  <length_rule_other>Equivalent length (e.g., 6-10 Chinese characters)</length_rule_other>
</output_specifications>

<examples>
  <example name="English Example 1">📉 Stock Market Trends</example>
  <example name="English Example 2">🔧 Tauri Command Usage</example>
</examples>

<final_instruction>
  Based *only* on the chat history provided in the \`<input>\` section, generate the title according to all the rules and examples specified above. Output *only* the formatted title.
</final_instruction>
`

const DialogContent = `# {{ title }}
{%- for content in contents %}
{%- if content.type == 'user-message' %}

**User:**
{{ content.text }}
{%- elsif content.type == 'assistant-message' %}

**Assistant:**
{{ content.text }}
{%- endif %}
{%- endfor %}`

const PluginsPrompt = `<plugins>
{%- for plugin in plugins %}
<plugin id="{{ plugin.id }}">
{%- if plugin.prompt %}
<plugin_prompt>
{{ plugin.prompt }}
</plugin_prompt>
{%- endif %}
</plugin>
{%- endfor %}
</plugins>
`

const AssistantDefaultPrompt = `{%- if _rolePrompt %}
<role_prompt>
{{ _rolePrompt }}
</role_prompt>
{%- endif %}

{{ _pluginsPrompt }}
`

const { t } = i18n.global

const DefaultWsIndexContent = t("templates.defaultWsIndexContent")

const ExtractArtifactSchema = Object({
  thinking: String({
    description:
      "During the process of determining whether there are artifacts in the conversation record between the user and the AI assistant, your thinking process.",
  }),
  found: Boolean({
    description:
      "Whether there are artifacts in the conversation record between the user and the AI assistant",
  }),
  regex: Optional(
    String({
      description:
        'A JS regular expression string for extracting artifacts, which must exactly match the entire artifact. Artifacts are long, and `[\\s\\S]*` can be used to match any content in the middle. If the artifact is a code block, please **do not** include the opening "\`\`\`" marker.',
    })
  ),
  name: Optional(
    String({
      description:
        "Name the artifact according to its content. Like a file name with a suffix. The naming format must conform to the file naming conventions of the corresponding language code.",
    })
  ),
  language: Optional(
    String({
      description:
        'The code language of the content, used for code highlighting. Example values: "markdown", "javascript", "python", etc.',
    })
  ),
})
type ExtractArtifactResult = Static<typeof ExtractArtifactSchema>

const ExtractArtifactPrompt = `
<instruction>
Your task is to determine whether there are artifacts in the conversation record between the user and the AI assistant, and if so, extract them.

Artifacts can be a long complete code, a complete article, or a report. Users may reuse and modify these contents, and the content is long (>15 lines), so they are extracted.

Other content (general question answers, operation steps, etc.) will not be extracted, and it is considered that no artifacts are found.

If there is no independent content suitable for extraction as an artifact, return \`found\` as false;
If there is, please determine the scope of the artifact in the assistant message, give the regular expression for extracting the artifact, and the language and name of the artifact.

If the artifact is a code block, it must be a complete code block, not a part of a code block or multiple short code blocks. In the case of inappropriate situations, it is considered that the artifact is not found.

The reply is in json format, only the json content is answered, and it is not wrapped in "\`\`\`".
</instruction>
<response_schema>
${JSON.stringify(ExtractArtifactSchema, null, 2)}
</response_schema>
<chat_history>
{%- for content in contents %}
{%- if content.type == 'user-message' %}
<user_message>
{{ content.text }}
</user_message>
{%- elsif content.type == 'assistant-message' %}
<assistant_message>
{{ content.text }}
</assistant_message>
{%- endif %}
{%- endfor %}
</chat_history>
`
const NameArtifactPrompt = `<instruction>
Please name the file according to its content. Requirements:
- The file name must have a suffix
- The file name must conform to the file naming conventions of the corresponding language code, such as "hello_world.py" (underscore format), "hello-world.js" (hyphen format), "HelloWorld.java" (camel case format), etc.
- The length must not exceed 3 words
- Only answer the file name, do not answer anything else.
</instruction>
<file_content {%- if lang %} lang="{{ lang }}"{%- endif %}>
{{ content }}
</file_content>
`

const ExampleWsIndexContent = DefaultWsIndexContent

const PersonalGraphSummaryPrompt = `
<instructions>
  Your task is to Analyze the input and extract concise, well-structured pieces of information related to the user, such as:

	- Events (e.g., graduated, traveled)
	- Skills (e.g., programming languages, hobbies)
	- Interests (e.g., topics, activities)
	- Desires or goals (e.g., wishes, plans)
	- Characteristics or personality traits
  As input accept any user’s language, generate output in plain English
</instructions>

<input>
  <description>CRaw text transcription of a user’s speech. The content can be about personality, facts, or wishlist descriptions.</description>
  <user_profile>
  {{ profile }}
  </user_profile>
  <user_brief>
  {{ brief }}
  </user_brief>
</input>

<output_specifications>
  <format_description>Markdown format, Each point is a bullet item </format_description>
  <language_rule>Use simple, clear language. Must be in English.</language_rule>
  <length_rule>1-3 short sentences, with preference for brevity</length_rule>
</output_specifications>

<examples>
  <example name="personality">
	- Lives in Portugal
	- Speaks English, Portugesse, Chinesse
	- Software developer
	- Skilled in Python and data analysis.
	- Interested in traveling and learning new languages.
	- Describes self as detail-oriented and curious.
  </example>
  <example name="facts">
	- Just read the book "the Capital" of Karl Marx
	- Wached movie "Titanic"
	- Graduated from university in 2020 with a degree in Computer Science.
	- Worked in the company "Cybernet" from May 2020 till September 2022
	- Plan to travel into China in September 2025
	- Does manicure for money at the moment
	- Provides psychotherapist services
	- Traveled to India from 01.07.2025 to 20.07.2025
  </example>
  <example name="wishlist">
	- Want's to sell "Macbook" model "M4, 512 GB SSD, 32 GB RAM" for 2000$
	- Looking for frontend developer for AI project, with stack: "react", "supabase", "material-ui".
	- Looking for backend developer position for AI project with stack "graphiti", "puthon", "llm", "fastAPU"
	- Looking for travel partner into "China" for September 2025
	- Looking for clients for psychotherapy sessions for donation
	- Wants to buy an island
	- Цants to found an ecovillage
  </example>
</examples>

<final_instruction>
  Based *only* on the profile and brief provided in the \`<input>\` section, generate the summary points according to all the rules and examples specified above. Output *only* the formatted markdown.
</final_instruction>
`

// const PersonalGraphAddMemoryPrompt = `
// <instructions>
//   Your task is: For each bullet point in user items and user profile items, generate a separate \`add_memory\` tool call with the following structure:
// {
//   "name": "user profile id",
//   "source": "text",
//   "groupId": "<category name in lowercase, no spaces>",
//   "episodeBody": "<full bullet point text>",
//   "sourceDescription": "user profile id and category"
// }
// After all tool calls are generated, output the user memories related to same user '<user profile id>' and same '<category>' in markdown format, each point is a bullet item.
// </instructions>

// <input>
//   <description>Profile data and list items that should be added to graph</description>
//   <category>
//   {{ category }}
//   </category>
//   <user_profile>
//   {{ profile }}
//   </user_profile>
//   <user_items>
//   {{ brief }}
//   </user_items>
// </input>
// <output_specifications>
//   Markdown format, Each point is a bullet item
// </output_specifications>
// <examples>
//   <example name="personality">
// 	<input>
// 		<category>personality</category>
// 		<user_profile>
// 		- ID: user_456
// 		- Email: max@example.com
// 		- Name: Satoshi Nakamoto
// 		</user_profile>
// 		<user_items>
// 		- Born in Latvia
// 		- Speaks: English, Japan
// 		- Software developer
// 		</user_items>
// 	</input>
// 	<tool_calls>
// 	[
// 	  {
// 	    "name": "user_456",
// 	    "source": "text",
// 	    "groupId": "personality",
// 	    "episodeBody": "Born in Latvia",
// 	    "sourceDescription": "user_456 personality"
// 	  },
// 	  {
// 	    "name": "user_456",
// 	    "source": "text",
// 	    "groupId": "personality",
// 	    "episodeBody": "Speaks: English, Japan",
// 	    "sourceDescription": "user_456 personality"
// 	  },
// 	  {
// 	    "name": "user_456",
// 	    "source": "text",
// 	    "groupId": "personality",
// 	    "episodeBody": "Software developer",
// 	    "sourceDescription": "user_456 personality"
// 	  }
// 	]
// 	</tool_calls>
//   </example>
// </examples>
// <final_instruction>
//   Based *only* on the profile and brief provided in the \`<input>\` section, create comprehensive graph for actual profile based on brief points according to all the rules and examples specified above.
// </final_instruction>
// `

const PersonalGraphAddMemoryPrompt = `
<instructions>
  Your task is: For each bullet point in user items, determine graph related tool and arguments and populate graph with that knoweledge, use user_profile, and category as additional information.
</instructions>

<input>
  <description>Profile data and list items that should be added to graph</description>
  <category>
  {{ category }}
  </category>
  <user_profile>
  {{ profile }}
  </user_profile>
  <user_items>
  {{ brief }}
  </user_items>
</input>
<output_specifications>
  Markdown format, Each point is a bullet item
</output_specifications>
`

const PersonalGraphFetchPrompt = `
<instructions>
  Your task is: For each bullet point in user items, determine graph related tool and arguments and
  retrive 'user_profile' related graph graph related to 'category'.
  Use most relevant tool to retrieve data from graph and return it in markdown format.
</instructions>

<input>
  <description>User profile and category to use for fetch from graph</description>
  <category>
  {{ category }}
  </category>
  <user_profile>
  {{ profile }}
  </user_profile>
  <user_items>
  {{ brief }}
  </user_items>
</input>
<output_specifications>
  Response in markdown format
</output_specifications>
`

export {
  GenDialogTitle,
  DialogContent,
  PluginsPrompt,
  AssistantDefaultPrompt,
  DefaultWsIndexContent,
  ExampleWsIndexContent,
  ExtractArtifactPrompt,
  ExtractArtifactSchema,
  NameArtifactPrompt,
  PersonalGraphSummaryPrompt,
  PersonalGraphAddMemoryPrompt,
  PersonalGraphFetchPrompt
}

export type { ExtractArtifactResult }
