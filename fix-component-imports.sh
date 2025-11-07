#!/bin/bash

# Fix imports in src/components subdirectories

cd /home/orrox/projects/RightFit-Services/apps/web-cleaning/src/components

# Replace individual component imports with package imports
for file in $(find . -name "*.tsx" -o -name "*.ts"); do
    # Skip ui/index.ts
    if [[ "$file" == *"ui/index.ts"* ]]; then
        continue
    fi

    # Track which imports we're replacing
    declare -A ui_core_imports
    declare -A local_imports

    # Check if file has imports to replace
    if grep -q "from '\.\./ui/" "$file"; then
        echo "Processing: $file"

        # Button, Card, Input, Select, Spinner, Badge, Textarea, Checkbox, Radio, Modal -> @rightfit/ui-core
        sed -i "s|from '\.\./ui/Button'|from '@rightfit/ui-core'|g" "$file"
        sed -i "s|from '\.\./ui/Card'|from '@rightfit/ui-core'|g" "$file"
        sed -i "s|from '\.\./ui/Input'|from '@rightfit/ui-core'|g" "$file"
        sed -i "s|from '\.\./ui/Select'|from '@rightfit/ui-core'|g" "$file"
        sed -i "s|from '\.\./ui/Spinner'|from '@rightfit/ui-core'|g" "$file"
        sed -i "s|from '\.\./ui/Badge'|from '@rightfit/ui-core'|g" "$file"
        sed -i "s|from '\.\./ui/EmptyState'|from '@rightfit/ui-core'|g" "$file"
        sed -i "s|from '\.\./ui/Textarea'|from '@rightfit/ui-core'|g" "$file"
        sed -i "s|from '\.\./ui/Checkbox'|from '@rightfit/ui-core'|g" "$file"
        sed -i "s|from '\.\./ui/Radio'|from '@rightfit/ui-core'|g" "$file"
        sed -i "s|from '\.\./ui/Modal'|from '@rightfit/ui-core'|g" "$file"

        # Toast, ThemeToggle remain local
        sed -i "s|from '\.\./ui/Toast'|from '../ui'|g" "$file"
        sed -i "s|from '\.\./ui/ThemeToggle'|from '../ui'|g" "$file"
        sed -i "s|from '\.\./ui/Skeleton'|from '../ui'|g" "$file"
        sed -i "s|from '\.\./ui/Tabs'|from '../ui'|g" "$file"
    fi
done

echo "Done!"
