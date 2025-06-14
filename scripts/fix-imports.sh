#!/bin/bash

# Script to fix imports in a specific file
# Usage: ./scripts/fix-imports.sh path/to/file.ts

if [ $# -eq 0 ]; then
  echo "Usage: $0 <file_path>"
  exit 1
fi

FILE_PATH="$1"

if [ ! -f "$FILE_PATH" ]; then
  echo "Error: File not found: $FILE_PATH"
  exit 1
fi

echo "Fixing imports in $FILE_PATH..."

# First, fix all @features -> @/features, @shared -> @/shared, @services -> @/services
sed -i '' -E 's|@features/|@/features/|g' "$FILE_PATH"
sed -i '' -E 's|@shared/|@/shared/|g' "$FILE_PATH"
sed -i '' -E 's|@services/|@/services/|g' "$FILE_PATH"
sed -i '' -E 's|src/|@/|g' "$FILE_PATH"

# Now run ESLint to fix import order
npx eslint "$FILE_PATH" --fix --rule 'import/order: ["error"]'

echo "Import paths fixed in $FILE_PATH"