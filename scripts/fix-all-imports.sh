#!/bin/bash

# Script to fix imports across the entire src directory
# This script runs the fix-imports.sh script on all .ts, .vue, and .js files

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting import path standardization across the codebase...${NC}"

# Path to the single-file fixer script
FIXER_SCRIPT="./scripts/fix-imports.sh"

# Make sure the fixer script is executable
chmod +x "$FIXER_SCRIPT"

# Find all .ts, .vue, and .js files in the src directory
FILES=$(find ./src -type f \( -name "*.ts" -o -name "*.vue" -o -name "*.js" \) | grep -v "node_modules" | grep -v "dist")

# Count total files
TOTAL_FILES=$(echo "$FILES" | wc -l)
echo -e "${YELLOW}Found $TOTAL_FILES files to process${NC}"

# Initialize counters
PROCESSED=0
FIXED=0
FAILED=0

# Process each file
for file in $FILES; do
  echo -e "${GREEN}Processing ${PROCESSED}/${TOTAL_FILES}: ${file}${NC}"
  
  # Check for @features, @shared, @services, or src/ patterns that need fixing
  if grep -E "(@features/|@shared/|@services/|src/)" "$file" > /dev/null; then
    echo -e "${YELLOW}Fixing imports in: $file${NC}"
    
    # Run the fix-imports script on the file
    if "$FIXER_SCRIPT" "$file"; then
      echo -e "${GREEN}✓ Successfully fixed imports in: $file${NC}"
      FIXED=$((FIXED+1))
    else
      echo -e "${RED}✗ Failed to fix imports in: $file${NC}"
      FAILED=$((FAILED+1))
    fi
  else
    echo -e "${GREEN}No imports to fix in: $file${NC}"
  fi
  
  PROCESSED=$((PROCESSED+1))
  echo "Progress: $PROCESSED/$TOTAL_FILES files processed ($FIXED fixed, $FAILED failed)"
  echo "------------------------------------------------------"
done

echo -e "${GREEN}Import path standardization complete!${NC}"
echo -e "${GREEN}Total files: $TOTAL_FILES${NC}"
echo -e "${GREEN}Files fixed: $FIXED${NC}"
echo -e "${RED}Files failed: $FAILED${NC}"

echo -e "${YELLOW}To fix the remaining issues, run: npm run fix:imports${NC}"