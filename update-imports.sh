#!/bin/bash

# Create a backup directory
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"

# Backup all Vue and TypeScript files
echo "Creating backups in $BACKUP_DIR..."
find src -name "*.vue" -o -name "*.ts" | xargs -I{} cp {} $BACKUP_DIR/

# Update imports from utils/functions.ts to shared/utils/functions
echo "Updating imports from utils/functions to shared/utils/functions..."
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/functions"#from "@shared/utils/functions"#g'
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/functions.ts"#from "@shared/utils/functions"#g'

# Update imports from utils/types.ts to shared/utils/types
echo "Updating imports from utils/types to shared/utils/types..."
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/types"#from "@shared/utils/types"#g'
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/types.ts"#from "@shared/utils/types"#g'

# Update imports from utils/templates.ts to features/dialogs/utils/templates
echo "Updating imports from utils/templates to features/dialogs/utils/templates..."
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/templates"#from "@features/dialogs/utils/templates"#g'
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/templates.ts"#from "@features/dialogs/utils/templates"#g'

# Update imports from utils/template-engine.ts to features/dialogs/utils/templateEngine
echo "Updating imports from utils/template-engine to features/dialogs/utils/templateEngine..."
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/template-engine"#from "@features/dialogs/utils/templateEngine"#g'
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/template-engine.ts"#from "@features/dialogs/utils/templateEngine"#g'

# Update imports from utils/tauri-shell-transport.ts to features/platform/utils/tauriShellTransport
echo "Updating imports from utils/tauri-shell-transport to features/platform/utils/tauriShellTransport..."
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/tauri-shell-transport"#from "@features/platform/utils/tauriShellTransport"#g'
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/tauri-shell-transport.ts"#from "@features/platform/utils/tauriShellTransport"#g'

# Update imports from utils/tauri-stream.ts to features/platform/utils/tauriStream
echo "Updating imports from utils/tauri-stream to features/platform/utils/tauriStream..."
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/tauri-stream"#from "@features/platform/utils/tauriStream"#g'
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from "src/utils/tauri-stream.ts"#from "@features/platform/utils/tauriStream"#g'

echo "Import paths updated!"