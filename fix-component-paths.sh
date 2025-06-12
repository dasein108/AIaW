#!/bin/bash

# Script to correctly update component paths based on their actual locations
set -e

# Create a backup directory
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"

# Backup all Vue and TypeScript files
echo "Creating backups in $BACKUP_DIR..."
find src -name "*.vue" -o -name "*.ts" | xargs -I{} cp {} $BACKUP_DIR/

echo "Fixing common component paths..."

# Fix PinModal
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from ["'\''"]@shared/components/PinModal.vue["'\'']#from "@features/auth/components/PinModal.vue"#g'

# Fix PromptVarEditor
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from ["'\''"]@shared/components/PromptVarEditor.vue["'\'']#from "@features/prompt/components/PromptVarEditor.vue"#g'

# Fix ViewCommonHeader
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from ["'\''"]@shared/components/ViewCommonHeader.vue["'\'']#from "@shared/components/ui/ViewCommonHeader.vue"#g'

# Fix PlatformEnabledInput
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from ["'\''"]@shared/components/PlatformEnabledInput.vue["'\'']#from "@features/providers/components/PlatformEnabledInput.vue"#g'

# Fix ShortcutKeyInput
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from ["'\''"]@shared/components/ShortcutKeyInput.vue["'\'']#from "@shared/components/ui/ShortcutKeyInput.vue"#g'

# Fix SaveDialog
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from ["'\''"]@shared/components/SaveDialog.vue["'\'']#from "@shared/components/dialog/SaveDialog.vue"#g'

echo "Component paths fixed!"