#!/bin/bash

# Function to fix backward compatibility file
fix_compat_file() {
    local src_path=$1
    local correct_import_path=$2
    local component_name=$(basename "$src_path" .vue)
    
    # Create correct backward compatibility file
    cat > "$src_path" << EOF
<!-- This file is being kept for backward compatibility during the refactoring process.
     It re-exports the component from its new location.
     TODO: Update all imports to reference ${correct_import_path}/${component_name}.vue directly and remove this file. -->
<script>
import ${component_name} from "${correct_import_path}/${component_name}.vue"
export default ${component_name}
</script>
EOF
    
    echo "Fixed $src_path with correct import path"
}

# Fix UI/shared components
UI_COMPONENTS=(
    "AbortableBtn"
    "AddInfoBtn"
    "AutocompleteInput"
    "CodeJar"
    "CopyBtn"
    "DarkSwitchBtn"
    "DragableSeparator"
    "HctPreviewCircle"
    "HintCard"
    "HueSlider"
    "HueSliderDialog"
    "JsonInput"
    "JsonInputDialog"
    "LazyInput"
    "ListInput"
    "SaveDialog"
    "SearchDialog"
    "SelectFileBtn"
    "ShortcutKeyInput"
    "TextareaDialog"
    "TypesInput"
    "UnifiedInput"
    "ViewCommonHeader"
    "ViewFileDialog"
    "ViewImageDialog"
)

for component in "${UI_COMPONENTS[@]}"; do
    fix_compat_file "/Users/dasein/dev/ch/AIaW/src/components/${component}.vue" "@/shared/components/ui"
done

# Fix expansion item
fix_compat_file "/Users/dasein/dev/ch/AIaW/src/components/ExpansionItem/MenuButton.vue" "@/shared/components/ExpansionItem"

# Fix media components
MEDIA_COMPONENTS=(
    "ImageInputArea"
    "MessageAudio"
    "MessageFile"
    "MessageImage"
)

for component in "${MEDIA_COMPONENTS[@]}"; do
    fix_compat_file "/Users/dasein/dev/ch/AIaW/src/components/${component}.vue" "@/features/media/components"
done

# Fix dialog components
DIALOG_COMPONENTS=(
    "ParseFilesDialog"
    "SelectWorkspaceDialog"
)

for component in "${DIALOG_COMPONENTS[@]}"; do
    fix_compat_file "/Users/dasein/dev/ch/AIaW/src/components/${component}.vue" "@/features/dialogs/components"
done

# Fix auth components
AUTH_COMPONENTS=(
    "CosmosWallet"
    "GranteeWallet"
    "KeplerWallet"
    "MnemonicDialog"
    "PinModal"
    "PayDialog"
    "PayMethodItem"
    "TopupDialog"
)

for component in "${AUTH_COMPONENTS[@]}"; do
    fix_compat_file "/Users/dasein/dev/ch/AIaW/src/components/${component}.vue" "@/features/auth/components"
done

# Fix provider components
PROVIDER_COMPONENTS=(
    "ModelItem"
    "ModelOptionsBtn"
    "ModelOverrideMenu"
    "ModelDragSortDialog"
    "ModelInputItems"
    "PlatformEnabledInput"
)

for component in "${PROVIDER_COMPONENTS[@]}"; do
    fix_compat_file "/Users/dasein/dev/ch/AIaW/src/components/${component}.vue" "@/features/providers/components"
done

# Fix plugin components
PLUGIN_COMPONENTS=(
    "InstallPluginBtn"
    "InstallPluginsButton"
    "InstalledPlugins"
)

for component in "${PLUGIN_COMPONENTS[@]}"; do
    fix_compat_file "/Users/dasein/dev/ch/AIaW/src/components/${component}.vue" "@/features/plugins/components"
done

# Fix prompt components
PROMPT_COMPONENTS=(
    "PromptVarEditor"
    "PromptVarInput"
    "PromptVarItem"
    "VarsInput"
)

for component in "${PROMPT_COMPONENTS[@]}"; do
    fix_compat_file "/Users/dasein/dev/ch/AIaW/src/components/${component}.vue" "@/features/prompt/components"
done

# Fix artifact components
fix_compat_file "/Users/dasein/dev/ch/AIaW/src/components/ConvertArtifactDialog.vue" "@/features/artifacts/components"

echo "Fixed all backward compatibility files!"