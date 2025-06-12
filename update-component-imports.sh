#!/bin/bash

# Script to update import paths from @/components to @shared/components
set -e

# Create a backup directory
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"

# Backup all Vue and TypeScript files
echo "Creating backups in $BACKUP_DIR..."
find src -name "*.vue" -o -name "*.ts" | xargs -I{} cp {} $BACKUP_DIR/

# Update imports from @/components to @shared/components
echo "Updating imports from @/components to @shared/components..."

# Regular pattern with trailing slash
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from ["'\'']@/components/#from "@shared/components/#g'

# Without trailing slash
find src -name "*.vue" -o -name "*.ts" | xargs sed -i '' -E 's#from ["'\'']@/components["'\'']#from "@shared/components"#g'

echo "Import paths updated!"