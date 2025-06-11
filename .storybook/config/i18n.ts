import { createI18n } from "vue-i18n";

// Define translations for use in stories
const messages = {
  en: {
    "dialogView.addImage": "Add Image",
    "dialogView.addFile": "Add File",
    "dialogView.hideVars": "Hide Variables",
    "dialogView.showVars": "Show Variables",
    "dialogView.messageTokens": "Message Tokens",
    "dialogView.tokenPrompt": "Prompt Tokens",
    "dialogView.tokenCompletion": "Completion Tokens",
    "abortableBtn.stop": "Stop",
    "shortcutKeysView.scrollUp": "Scroll Up",
    "shortcutKeysView.scrollDown": "Scroll Down",
    "shortcutKeysView.scrollToTop": "Scroll to Top",
    "shortcutKeysView.scrollToBottom": "Scroll to Bottom",
    "messageItem.more": "More",
    "messageItem.showSourceCode": "Source Code",
    "messageItem.directEdit": "Direct Edit",
    "messageItem.quote": "Quote",
    "messageItem.moreInfo": "More Info",
    "messageItem.reasoningContent": "Reasoning Content",
    "messageItem.regenerate": "Regenerate",
    "messageItem.edit": "Edit",
    "messageItem.copyMarkdown": "Markdown",
    "messageItem.convertToArtifact": "Convert to Artifact",
    "messageItem.userMessageQuote": "User Message Quote",
    "messageItem.assistantMessageQuote": "Assistant Message Quote",
    "messageItem.editMessage": "Edit Message",
    "messageItem.convertToArtifactTitle": "Convert to Artifact",
    "messageItem.convertToArtifactBtn": "Convert to Artifact",
    "messageItem.copyCode": "Copy Code",
    "messageItem.fold": "Fold",
    "messageItem.deleteBranch": "Delete Branch",
    "messageItem.deleteBranchMessage": "Are you sure you want to delete this message branch? This message and all subsequent messages will be deleted.",
    "messageItem.delete": "Delete",
    "dialogsExpansion.search": "Search Dialogs...",
    "dialogsExpansion.dialogs": "Dialogs",
    "dialogList.createDialog": "Create Dialog",
    "searchDialog.placeholder": "Search Messages...",
    "searchDialog.noResults": "No results found...",
    "searchDialog.workspace": "Workspace",
    "searchDialog.global": "Global",
    "workspaceSettings.title": "Workspace Settings",
    "workspaceSettings.defaultAssistant": "Default Assistant",
    "workspaceSettings.avatar": "Workspace Icon",
    "workspaceSettings.homeContent": "Home Content",
    "workspaceSettings.variables": "Workspace Variables",
    "workspaceSettings.inputPlaceholder": "Enter variable content...",
    "assistantItem.unselected": "No assistant selected",
    "assistantItem.global": "Global",
    "varsInput.addVariable": "Add Variable",
    "varsInput.variableName": "Variable Name"
  },
};

// Create i18n instance
export const createStorybookI18n = () => {
  return createI18n({
    legacy: false,
    locale: "en",
    messages,
  });
};

export { messages };
