export default {
  addMcpPluginDialog: {
    stdio: 'STDIO',
    sse: 'SSE',
    pluginName: 'Plugin Name',
    pluginNameCaption: 'Any name will do',
    command: 'Run Command',
    commandCaption: 'The command to run on the MCP server',
    workDir: 'Working Directory',
    workDirCaption: 'Optional',
    envVars: 'Environment Variables',
    inputVarsPlaceholder: 'Enter variable value...',
    url: 'URL',
    cancel: 'Cancel',
    install: 'Install',
    installFailed: 'Installation failed',
    stdioPlatformTip: 'Only the desktop version supports STDIO type MCP plugins, and the current platform only supports SSE type'
  },
  abortableBtn: {
    stop: 'Stop'
  },
  artifactsExpansion: {
    searchPlaceholder: 'Search Artifacts...',
    close: 'Close',
    artifactsGuide: 'Refer to',
    artifactsGuideLink: 'Artifacts User Guide',
    create: 'Create',
    selectFile: 'Select File',
    createArtifact: 'Create Artifact',
    name: 'Name',
    nonTextFile: 'Non-text file: {name}'
  },
  dialogsExpansion: {
    search: 'Search Dialogs...',
    dialogs: 'Dialogs'
  },
  artifactItemMenu: {
    save: 'Save',
    rename: 'Rename',
    moveTo: 'Move To',
    download: 'Download',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete Artifact',
    deleteConfirmMessage: 'Are you sure you want to delete the artifact "{name}"?',
    deleteConfirmOk: 'Delete'
  },
  addInfoBtn: {
    attachment: 'Attachment',
    parameter: 'Parameter'
  },
  accountBtn: {
    account: 'Account',
    login: 'Log In'
  },
  copyBtn: {
    title: 'Copy',
    copyFailed: 'Copy failed'
  },
  convertArtifactDialog: {
    title: 'Convert to Artifact',
    name: 'Name',
    lang: 'Language',
    reserveOriginal: 'Reserve Original',
    cancel: 'Cancel',
    autoName: 'Auto Name',
    ok: 'OK'
  },
  aTip: {
    tip: 'TIP',
    dismiss: 'Dismiss'
  },
  assistantsExpansion: {
    createDialog: 'Create Dialog',
    moveToGlobal: 'Move to Global',
    moveToWorkspace: 'Move to Workspace',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete Assistant',
    deleteConfirmMessage: 'Are you sure you want to delete the assistant "{name}"?',
    createAssistant: 'Create Assistant',
    assistants: 'Assistants',
    settings: 'Settings'
  },
  customProviders: {
    delete: 'Delete',
    deleteProvider: 'Delete Provider',
    deleteConfirm: 'Are you sure you want to delete the provider "{name}"?',
    createProvider: 'Create Provider',
    setAsDefault: 'Set as Default'
  },
  assistantItem: {
    unselected: 'Unselected',
    global: 'Global'
  },
  importDataDialog: {
    title: 'Import User Data',
    fileLabel: 'Data File',
    overwrite: 'Overwrite Existing Data',
    force: 'Force Write',
    clear: 'Clear Existing Data Before Import',
    cancel: 'Cancel',
    import: 'Import',
    importSuccess: 'Import successful',
    importFailed: 'Import failed: {message}'
  },
  imageInputArea: {
    clickToSelect: 'Click to Select Image',
    dragHere: 'Drag Here',
    paste: 'Or Ctrl+V to Paste'
  },
  hueSliderDialog: {
    title: 'Pick a Color',
    hue: 'Hue',
    cancel: 'Cancel',
    ok: 'OK'
  },
  dialogList: {
    createDialog: 'Create Dialog',
    searchPlaceholder: 'Search Dialogs...',
    renameTitle: 'Rename Title',
    summarizeDialog: 'Summarize Title',
    title: 'Title',
    moveTo: 'Move To',
    copyContent: 'Copy Content',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete Dialog',
    deleteConfirmMessage: 'Are you sure you want to delete the dialog "{name}"?',
    deleteConfirmOk: 'Delete'
  },
  darkSwitchBtn: {
    switchToDark: 'Switch to Dark Mode',
    switchToLight: 'Switch to Light Mode',
    switchToAuto: 'Switch to Auto'
  },
  messageInfoDialog: {
    userMessageInfo: 'User Message Info',
    assistantMessageInfo: 'Assistant Message Info',
    id: 'ID',
    createdAt: 'Created At',
    textLength: 'Text Length',
    model: 'Model',
    tokenUsage: 'Token Usage',
    prompt: 'Prompt:',
    completion: 'Completion:',
    ok: 'OK'
  },
  installPluginBtn: {
    installed: 'Installed',
    install: 'Install',
    installFailed: 'Installation failed:'
  },
  installedPlugins: {
    uninstallPlugin: 'Uninstall Plugin',
    uninstallConfirm: 'Are you sure you want to uninstall the plugin "{title}"?',
    uninstall: 'Uninstall'
  },
  messageItem: {
    quote: 'Quote',
    copyMarkdown: 'Markdown',
    convertToArtifact: 'Convert to Artifact',
    regenerate: 'Regenerate',
    edit: 'Edit',
    more: 'More',
    showSourceCode: 'Source Code',
    directEdit: 'Direct Edit',
    moreInfo: 'More Info',
    userMessageQuote: 'User Message Quote',
    assistantMessageQuote: 'Assistant Message Quote',
    editMessage: 'Edit Message',
    convertToArtifactTitle: 'Convert to Artifact',
    convertToArtifactBtn: 'Convert to Artifact',
    copyCode: 'Copy Code',
    fold: 'Fold',
    reasoningContent: 'Reasoning Content',
    deleteBranch: 'Delete Branch',
    deleteBranchMessage: 'Are you sure you want to delete this message branch? This message and all subsequent messages will be deleted.',
    delete: 'Delete'
  },
  parseFilesDialog: {
    parseFiles: 'Parse Files',
    noParserAvailable: 'No parser available for this type',
    cancel: 'Cancel',
    parse: 'Parse',
    parser: 'Parser',
    parseFailed: 'Failed to parse "{file}": {error}'
  },
  modelInputItems: {
    model: 'Model',
    multimodalCapabilities: 'Multimodal Capabilities',
    multimodalCapabilitiesCaption: 'Modify the multimodal capabilities configuration of the model',
    userInputTypes: 'User Input Support Types',
    assistantMessageTypes: 'Assistant Message Support Types',
    toolResultTypes: 'Tool Result Support Types'
  },
  platformEnabledInput: {
    alwaysEnabled: 'Always Enabled',
    desktopOnly: 'Desktop Only',
    mobileOnly: 'Mobile Only',
    alwaysDisabled: 'Always Disabled'
  },
  pickAvatarDialog: {
    ai: 'AI',
    icon: 'Icon',
    text: 'Text',
    image: 'Image',
    aiCompany: 'AI & Company',
    color: 'Color',
    aiCompanyQuestion: 'AI? & Company?',
    preview: 'Preview',
    showBackground: 'Show Background',
    backgroundColor: 'Background Color',
    cancel: 'Cancel',
    confirm: 'Confirm',
    textLabel: 'Text',
    textHint: 'Support Emoji'
  },
  payDialog: {
    pay: 'Pay',
    refreshAfterPay: 'After payment, click "Completed Payment" to refresh the data',
    cancel: 'Cancel',
    completePayment: 'Completed Payment'
  },
  saveDialog: {
    title: 'Save Changes',
    message: 'Do you want to save the changes to "{name}"?',
    cancel: 'Cancel',
    dontSave: 'Don\'t Save',
    save: 'Save'
  },
  jsonInputDialog: {
    cancel: 'Cancel',
    ok: 'OK'
  },
  providerInputItems: {
    provider: 'Provider'
  },
  promptVarItem: {
    variableName: 'Variable Name',
    label: 'Label',
    type: 'Type',
    options: 'Options',
    defaultValue: 'Default Value',
    remove: 'Remove',
    clearable: 'Clearable',
    text: 'Text',
    number: 'Number',
    toggle: 'Toggle',
    select: 'Select',
    multiSelect: 'Multi Select'
  },
  promptVarEditor: {
    addVariable: 'Add Variable'
  },
  pluginTypeBadge: {
    builtin: 'Built-in',
    lobechat: 'LobeChat',
    gradio: 'Gradio',
    mcp: 'MCP'
  },
  textareaDialog: {
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  subscribeDialog: {
    title: 'Subscribe to Cloud Sync Service',
    duration: 'Subscription Duration (Months)',
    priceCNY: 'Price: ￥{price} / month',
    priceUSD: 'Price: $ {price} / month',
    amountDue: 'Amount Due',
    paymentMethod: 'Payment Method',
    cancel: 'Cancel',
    order: 'Order'
  },
  selectWorkspaceDialog: {
    selectWorkspace: 'Select Workspace',
    selectFolder: 'Select Folder',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  selectFileBtn: {
    clickToSelect: 'Click to Select File',
    dragHere: 'Drag Here',
    paste: 'Or Ctrl+V to Paste'
  },
  viewFileDialog: {
    fileSize: 'File Size',
    fileType: 'File Type',
    copy: 'Copy',
    download: 'Download',
    ok: 'OK'
  },
  varsInput: {
    addVariable: 'Add Variable',
    variableName: 'Variable Name'
  },
  topupDialog: {
    title: 'Recharge Model Service',
    amountCNY: 'Recharge Amount (Yuan)',
    amountUSD: 'Recharge Amount (USD)',
    amountCaption: 'Please enter an integer between 1 and 999',
    transactionFee: 'Transaction Fee',
    payableAmount: 'Payable Amount',
    cancel: 'Cancel',
    order: 'Order'
  },
  payMethodItem: {
    paymentMethod: 'Payment Method',
    wxpay: 'WeChat Pay',
    stripe: 'Bank Card'
  },
  toolContent: {
    toolCall: 'Tool Call',
    callParams: 'Call Parameters',
    callResult: 'Call Result',
    errorMessage: 'Error Message'
  },
  workspaceNav: {
    workspace: 'Workspace',
    folder: 'Folder'
  },
  workspaceListSelect: {
    root: 'Root Directory'
  },
  workspaceListItem: {
    rename: 'Rename',
    changeIcon: 'Change Icon',
    newWorkspace: 'New Workspace',
    newFolder: 'New Folder',
    moveTo: 'Move To',
    delete: 'Delete',
    settings: 'Settings'
  },
  modelOptionsBtn: {
    modelOptions: 'Model Options',
    reasoningEffort: 'Reasoning Effort',
    useSearchGrounding: 'Use Search'
  },
  subproviderInput: {
    modelList: 'Model List'
  },
  getModelList: {
    getModelList: 'Get Model List',
    selectModels: 'Select Models',
    getModelListFailed: 'Failed to Get Model List'
  },
  modelDragSortDialog: {
    title: 'Drag to Sort',
    sortByName: 'Sort by Name',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  searchDialog: {
    placeholder: 'Search Messages...',
    noResults: 'No results found...',
    workspace: 'Workspace',
    global: 'Global'
  },
  enablePluginsMenu: {
    moreInfo: 'More Info'
  }
}
