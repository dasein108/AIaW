# Function Refactoring Plan

This document outlines the detailed plan for breaking down complex functions in the codebase, focusing on the most significant example: `streamLlmResponse` in `useLlmDialog.ts`.

## Refactoring the `streamLlmResponse` Function

### Current Issues

The `streamLlmResponse` function in `/Users/dasein/dev/ch/AIaW/src/features/dialogs/composables/useLlmDialog.ts` has multiple responsibilities:

1. Message setup and initialization
2. Message state management
3. Tool calling handling
4. Streaming response processing
5. Non-streaming response processing
6. Error handling
7. Post-processing (artifact extraction, title generation)

This makes the function large (~190 lines), complex, and difficult to maintain.

### Refactoring Approach

We'll break down the function into smaller, focused helper functions:

1. `setupMessageForStreaming`: Initialize message state
2. `handleToolCall`: Process tool invocations
3. `processStreamingResponse`: Handle streaming model responses
4. `processNonStreamingResponse`: Handle non-streaming model responses
5. `finalizeResponse`: Process completed responses
6. `handlePostResponseActions`: Handle artifact extraction and title generation
7. `handleStreamingError`: Process errors during streaming

Then we'll rewrite the main `streamLlmResponse` function to orchestrate these helper functions.

### Refactored Code

```typescript
/**
 * Sets up a new message for LLM response streaming
 * Creates the assistant message and empty user message
 */
async function setupMessageForStreaming(targetId: string) {
  // In case the last message is in "inputing" status
  if (targetId) {
    await updateMessage(targetId, {
      status: "default",
    });
  }

  // Create initial message content
  const messageContent: AssistantMessageContent = {
    type: "assistant-message",
    text: "",
  };
  const contents: MessageContentMapped[] = [messageContent];

  // Add assistant message
  const { id } = await addMessage(
    targetId,
    {
      type: "assistant",
      assistant_id: assistant.value.id,
      message_contents: contents,
      status: "pending",
      generating_session: sessions.id,
      model_name: model.value.name,
    },
  );

  // In case of "regenerate action"
  if (targetId) {
    await switchActiveMessage(id);
  }

  // Add empty user message
  await addMessage(id, {
    type: "user",
    message_contents: [
      {
        type: "user-message",
        text: "",
        stored_items: [],
      },
    ],
    status: "inputing",
  });

  return { id, messageContent, contents };
}

/**
 * Creates an update function for a specific message
 */
function createMessageUpdater(id: string) {
  return async (contentUpdate: Partial<DialogMessageMapped> = {}) => {
    await updateMessage(id, contentUpdate);
  };
}

/**
 * Handles a tool call from the LLM
 */
async function handleToolCall(
  plugin: Plugin, 
  api: PluginApi, 
  args: any,
  contents: MessageContentMapped[],
  updateMessage: (update?: Partial<DialogMessageMapped>) => Promise<void>
) {
  // Create tool content
  const content: MessageContentMapped = {
    type: "assistant-tool",
    plugin_id: plugin.id,
    name: api.name,
    args,
    status: "calling",
  };

  // Add to message
  contents.push(content);
  await updateMessage({ message_contents: contents });

  // Call API
  const { result: apiResult, error } = await callApi(plugin, api, args);
  const storedItems = await storage.saveApiResultItems(
    apiResult, 
    { dialog_id: dialogId.value }
  );

  content.stored_items = storedItems;

  // Handle result or error
  if (error) {
    content.status = "failed";
    content.error = error;
  } else {
    content.status = "completed";
    // Save result based on stored items without arrayBuffer
    const contentResult = storedItems.map((i) => {
      const { type, mime_type, content_text, file_url } = i;
      return pickBy(
        { type, mime_type, content_text, file_url },
        (v) => v !== undefined
      ) as MessageContentResult;
    });
    content.result = contentResult;
  }

  await updateMessage({ message_contents: contents });
  return { result: apiResult, error };
}

/**
 * Processes a streaming response from the LLM
 */
async function processStreamingResponse(
  params: any,
  id: string,
  messageContent: AssistantMessageContent,
  contents: MessageContentMapped[],
  updateMessage: (update?: Partial<DialogMessageMapped>) => Promise<void>
) {
  // Start streaming
  const result = streamText(params);
  await updateMessage({ status: "streaming" });
  
  // Process stream chunks
  for await (const part of result.fullStream) {
    if (part.type === "text-delta") {
      messageContent.text += part.textDelta;
      await updateMessage({ message_contents: contents });
    } else if (part.type === "reasoning") {
      messageContent.reasoning = 
        (messageContent.reasoning ?? "") + part.textDelta;
      await updateMessage({ message_contents: contents });
    } else if (part.type === "error") {
      throw part.error;
    }
  }
  
  return result;
}

/**
 * Processes a non-streaming response from the LLM
 */
async function processNonStreamingResponse(
  params: any,
  messageContent: AssistantMessageContent
) {
  const result = await generateText(params);
  messageContent.text = result.text;
  messageContent.reasoning = result.reasoning;
  return result;
}

/**
 * Finalizes a successful response
 */
async function finalizeResponse(
  id: string,
  contents: MessageContentMapped[],
  result: any,
  updateMessage: (update?: Partial<DialogMessageMapped>) => Promise<void>
) {
  const usage = await result.usage;
  const warnings = (await result.warnings).map((w) =>
    w.type === "unsupported-setting" || w.type === "unsupported-tool"
      ? w.details
      : w.message
  );
  
  await updateMessage({
    message_contents: contents,
    status: "default",
    generating_session: null,
    warnings,
    usage,
  });
}

/**
 * Handles post-response actions like artifact extraction and title generation
 */
async function handlePostResponseActions(message: DialogMessageMapped) {
  // Auto extract artifacts if enabled
  if (perfs.artifactsAutoExtract) {
    await autoExtractArtifact(message, getMessageContents(-3, -1));
  }
  
  // Auto generate title if enabled and it's a new dialog
  if (perfs.autoGenTitle && dialogItems.value.length === 4) {
    await genTitle(getMessageContents());
  }
}

/**
 * Handles errors during streaming
 */
async function handleStreamingError(
  id: string,
  contents: MessageContentMapped[],
  error: any,
  updateMessage: (update?: Partial<DialogMessageMapped>) => Promise<void>
) {
  console.error(error);
  await updateMessage({
    message_contents: contents,
    error: error.message || error.toString(),
    status: "failed",
    generating_session: null,
  });
}

/**
 * Main function that orchestrates the LLM response streaming process
 */
async function streamLlmResponse(
  targetId: string,
  abortController: AbortController | null = null
) {
  let id: string;
  let messageContent: AssistantMessageContent;
  let contents: MessageContentMapped[];
  
  isStreaming.value = true;
  
  try {
    // Step 1: Setup message
    ({ id, messageContent, contents } = await setupMessageForStreaming(targetId));
    const updateFn = createMessageUpdater(id);
    
    // Step 2: Setup tools
    const toolCallHandler = (plugin, api, args) => 
      handleToolCall(plugin, api, args, contents, updateFn);
    
    const { noRoundtrip, tools, systemPrompt } = 
      await getAssistantTools(toolCallHandler);
    
    // Step 3: Prepare model parameters
    const settings = getAssistantModelSettings(
      assistant.value,
      noRoundtrip ? { maxSteps: 1 } : {}
    );
    
    const messages = getChainMessages();
    if (systemPrompt) {
      messages.unshift({
        role: assistant.value.prompt_role,
        content: systemPrompt,
      });
    }
    
    const params = {
      model: sdkModel.value,
      messages,
      tools,
      ...settings,
      abortSignal: abortController?.signal,
    };
    
    // Step 4: Process response (streaming or not)
    let result;
    if (assistant.value.stream) {
      result = await processStreamingResponse(
        params, id, messageContent, contents, updateFn
      );
    } else {
      result = await processNonStreamingResponse(params, messageContent);
      await updateFn({ message_contents: contents });
    }
    
    // Step 5: Finalize response
    await finalizeResponse(id, contents, result, updateFn);
    
    // Step 6: Handle post-response actions
    const message = dialogItems.value.at(-2).message;
    await handlePostResponseActions(message);
    
  } catch (error) {
    // Handle errors
    await handleStreamingError(id, contents, error, createMessageUpdater(id));
  } finally {
    isStreaming.value = false;
  }
}
```

### Benefits of Refactoring

1. **Improved Readability**: Each function has a clear purpose and focuses on a single responsibility
2. **Better Maintainability**: Smaller functions are easier to update and maintain
3. **Enhanced Testability**: Individual functions can be tested in isolation
4. **Better Error Handling**: Error handling is centralized and consistent
5. **Clearer Flow**: The main function now clearly shows the process flow without implementation details
6. **Better Documentation**: Each function can be well-documented to explain its specific purpose

### Implementation Steps

1. Extract helper functions one by one, starting with the most independent ones
2. Update the main function to use these helpers
3. Add JSDoc comments to clarify the purpose of each function
4. Test each refactored component to ensure functionality remains unchanged

## Additional Complex Functions to Refactor

After completing the refactoring of `streamLlmResponse`, we should apply similar approaches to these functions:

1. `getChainMessages` in `useLlmDialog.ts`
2. `getAssistantTools` in `useAssistantTools.ts`
3. `toToolResultContent` in `useAssistantTools.ts`
4. `getDialogItemList` in `dialogTreeUtils.ts`

The general approach for each will be:
1. Identify distinct responsibilities
2. Extract them into separate helper functions
3. Rewrite the main function to orchestrate these helpers
4. Add clear documentation

By applying these refactoring techniques consistently across the codebase, we'll significantly improve its maintainability and make it more LLM-friendly.