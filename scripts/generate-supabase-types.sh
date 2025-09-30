#!/bin/bash

# =====================================================
# Generate Supabase TypeScript Types
# =====================================================
# This script generates TypeScript types from the Supabase schema
# Usage: ./scripts/generate-supabase-types.sh
# =====================================================

set -e

echo "=========================================="
echo "Generating Supabase TypeScript Types"
echo "=========================================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if project is linked
if [ ! -f "./.supabase/config.toml" ]; then
    echo "❌ Error: Supabase project is not linked"
    echo "Run: supabase link --project-ref your-project-ref"
    exit 1
fi

# Get project ref from config
PROJECT_REF=$(grep -oP 'project_id = "\K[^"]+' supabase/config.toml 2>/dev/null || echo "")

if [ -z "$PROJECT_REF" ]; then
    echo "⚠️  Warning: Could not determine project ref from config"
    echo "Using local schema instead"

    # Generate from local schema
    echo "📦 Generating types from local schema..."
    supabase gen types typescript --local > apps/frontend/types/database.types.ts
else
    echo "📦 Generating types from remote project: $PROJECT_REF"
    supabase gen types typescript --project-id "$PROJECT_REF" > apps/frontend/types/database.types.ts
fi

# Add header comment
TEMP_FILE=$(mktemp)
cat > "$TEMP_FILE" << 'EOF'
/**
 * Database Types for Resume-Matcher
 *
 * Auto-generated from Supabase schema
 * DO NOT EDIT MANUALLY - Run `npm run generate:types` to regenerate
 *
 * Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
 */

EOF

cat apps/frontend/types/database.types.ts >> "$TEMP_FILE"
mv "$TEMP_FILE" apps/frontend/types/database.types.ts

echo "✅ Types generated successfully!"
echo "📝 Output: apps/frontend/types/database.types.ts"
echo ""
echo "Next steps:"
echo "1. Review the generated types"
echo "2. Commit the changes"
echo "3. Use types in your application: import { Database } from '@/types/database.types'"
echo "=========================================="