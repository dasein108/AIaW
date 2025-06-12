#!/bin/bash

# Create necessary directories
mkdir -p /Users/dasein/dev/ch/AIaW/src/shared/components/ui
mkdir -p /Users/dasein/dev/ch/AIaW/src/shared/components/ExpansionItem
mkdir -p /Users/dasein/dev/ch/AIaW/src/features/media/components
mkdir -p /Users/dasein/dev/ch/AIaW/src/features/dialogs/components
mkdir -p /Users/dasein/dev/ch/AIaW/src/features/auth/components
mkdir -p /Users/dasein/dev/ch/AIaW/src/features/providers/components
mkdir -p /Users/dasein/dev/ch/AIaW/src/features/plugins/components
mkdir -p /Users/dasein/dev/ch/AIaW/src/features/prompt/components
mkdir -p /Users/dasein/dev/ch/AIaW/src/features/artifacts/components
mkdir -p /Users/dasein/dev/ch/AIaW/src/features/workspaces/components

# Function to move component and create backward compatibility file
move_component() {
    local src_path=$1
    local dest_path=$2
    local component_name=$(basename "$src_path")
    local component_import_path=$(echo "$dest_path" | sed 's|/Users/dasein/dev/ch/AIaW/src|@|')
    
    # Copy the component to its new location
    cp "$src_path" "$dest_path"
    
    # Create backward compatibility file
    cat > "$src_path" << EOF
<!-- This file is being kept for backward compatibility during the refactoring process.
     It re-exports the component from its new location.
     TODO: Update all imports to reference ${component_import_path}/${component_name} directly and remove this file. -->
<script>
import ${component_name%.*} from "${component_import_path}/${component_name}"
export default ${component_name%.*}
</script>
EOF
    
    echo "Moved $component_name to $dest_path and created compatibility file"
}

# UI/Shared Components
UI_COMPONENTS=(
    "AbortableBtn.vue"
    "AddInfoBtn.vue"
    "AutocompleteInput.vue"
    "CodeJar.vue"
    "CopyBtn.vue"
    "DarkSwitchBtn.vue"
    "DragableSeparator.vue"
    "HctPreviewCircle.vue"
    "HintCard.vue"
    "HueSlider.vue"
    "HueSliderDialog.vue"
    "JsonInput.vue"
    "JsonInputDialog.vue"
    "LazyInput.vue"
    "ListInput.vue"
    "SaveDialog.vue"
    "SearchDialog.vue"
    "SelectFileBtn.vue"
    "ShortcutKeyInput.vue"
    "TextareaDialog.vue"
    "TypesInput.vue"
    "UnifiedInput.vue"
    "ViewCommonHeader.vue"
    "ViewFileDialog.vue"
    "ViewImageDialog.vue"
)

for component in "${UI_COMPONENTS[@]}"; do
    move_component "/Users/dasein/dev/ch/AIaW/src/components/$component" "/Users/dasein/dev/ch/AIaW/src/shared/components/ui/$component"
done

# Expansion Item Components
move_component "/Users/dasein/dev/ch/AIaW/src/components/ExpansionItem/MenuButton.vue" "/Users/dasein/dev/ch/AIaW/src/shared/components/ExpansionItem/MenuButton.vue"

# Media Components
MEDIA_COMPONENTS=(
    "ImageInputArea.vue"
    "MessageAudio.vue"
    "MessageFile.vue"
    "MessageImage.vue"
)

for component in "${MEDIA_COMPONENTS[@]}"; do
    move_component "/Users/dasein/dev/ch/AIaW/src/components/$component" "/Users/dasein/dev/ch/AIaW/src/features/media/components/$component"
done

# Dialog Components
DIALOG_COMPONENTS=(
    "ParseFilesDialog.vue"
    "SelectWorkspaceDialog.vue"
)

for component in "${DIALOG_COMPONENTS[@]}"; do
    move_component "/Users/dasein/dev/ch/AIaW/src/components/$component" "/Users/dasein/dev/ch/AIaW/src/features/dialogs/components/$component"
done

# Auth Components
AUTH_COMPONENTS=(
    "CosmosWallet.vue"
    "GranteeWallet.vue"
    "KeplerWallet.vue"
    "MnemonicDialog.vue"
    "PinModal.vue"
    "PayDialog.vue"
    "PayMethodItem.vue"
    "TopupDialog.vue"
)

for component in "${AUTH_COMPONENTS[@]}"; do
    move_component "/Users/dasein/dev/ch/AIaW/src/components/$component" "/Users/dasein/dev/ch/AIaW/src/features/auth/components/$component"
done

# Provider Components
PROVIDER_COMPONENTS=(
    "ModelItem.vue"
    "ModelOptionsBtn.vue"
    "ModelOverrideMenu.vue"
    "ModelDragSortDialog.vue"
    "ModelInputItems.vue"
    "PlatformEnabledInput.vue"
)

for component in "${PROVIDER_COMPONENTS[@]}"; do
    move_component "/Users/dasein/dev/ch/AIaW/src/components/$component" "/Users/dasein/dev/ch/AIaW/src/features/providers/components/$component"
done

# Plugin Components
PLUGIN_COMPONENTS=(
    "InstallPluginBtn.vue"
    "InstallPluginsButton.vue"
    "InstalledPlugins.vue"
)

for component in "${PLUGIN_COMPONENTS[@]}"; do
    move_component "/Users/dasein/dev/ch/AIaW/src/components/$component" "/Users/dasein/dev/ch/AIaW/src/features/plugins/components/$component"
done

# Prompt Components
PROMPT_COMPONENTS=(
    "PromptVarEditor.vue"
    "PromptVarInput.vue"
    "PromptVarItem.vue"
    "VarsInput.vue"
)

for component in "${PROMPT_COMPONENTS[@]}"; do
    move_component "/Users/dasein/dev/ch/AIaW/src/components/$component" "/Users/dasein/dev/ch/AIaW/src/features/prompt/components/$component"
done

# Workspace Components
move_component "/Users/dasein/dev/ch/AIaW/src/components/ConvertArtifactDialog.vue" "/Users/dasein/dev/ch/AIaW/src/features/artifacts/components/ConvertArtifactDialog.vue"

echo "Component refactoring script completed successfully!"