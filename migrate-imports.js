#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Components that should be imported from @rightfit/ui-core
const uiCoreComponents = new Set([
  'Button', 'ButtonProps', 'ButtonVariant', 'ButtonSize',
  'Card', 'CardHeader', 'CardSection', 'CardProps', 'CardHeaderProps', 'CardSectionProps', 'CardVariant', 'CardPadding',
  'Input', 'InputProps', 'InputSize', 'InputVariant',
  'Select', 'SelectProps', 'SelectOption', 'SelectSize',
  'Spinner', 'SpinnerProps', 'SpinnerSize',
  'Badge', 'BadgeProps', 'BadgeColor', 'BadgeSize', 'BadgeVariant',
  'EmptyState', 'EmptyStateProps',
  'Textarea', 'TextareaProps', 'TextareaSize',
  'Checkbox', 'CheckboxProps', 'CheckboxSize',
  'Radio', 'RadioProps', 'RadioSize',
  'Modal', 'ModalProps', 'ModalSize',
]);

// Components that stay local (Toast, Skeleton, ThemeToggle, Tabs, etc.)
const localComponents = new Set([
  'ToastProvider', 'useToast', 'Toast', 'ToastType', 'ToastPosition',
  'Skeleton', 'SkeletonText', 'SkeletonCard', 'SkeletonTable', 'SkeletonProps', 'SkeletonTextProps', 'SkeletonCardProps', 'SkeletonTableProps', 'SkeletonVariant',
  'ThemeToggle',
  'Tabs', 'TabPanel', 'TabsProps', 'TabPanelProps', 'Tab',
  'KeyboardShortcutsHelp',
  'RadioGroup', 'RadioGroupProps',
  'ConfirmModal', 'ConfirmModalProps',
  'LoadingOverlay', 'LoadingOverlayProps', 'SpinnerVariant',
]);

function migrateImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Match imports from '../components/ui' or variations
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"](\.\.\/)+(components\/ui)['"];?/g;

  let match;
  let modified = content;
  let changes = [];

  while ((match = importRegex.exec(content)) !== null) {
    const importedItems = match[1].split(',').map(item => item.trim());
    const relativePath = match[2];

    const uiCoreImports = [];
    const localImports = [];

    // Split imports based on component sets
    importedItems.forEach(item => {
      // Handle "type" imports
      const isType = item.startsWith('type ');
      const componentName = isType ? item.substring(5).trim() : item;

      if (uiCoreComponents.has(componentName)) {
        uiCoreImports.push(item);
      } else if (localComponents.has(componentName)) {
        localImports.push(item);
      } else {
        console.warn(`Unknown component: ${componentName} in ${filePath}`);
        localImports.push(item); // Keep unknown components local to be safe
      }
    });

    // Build replacement imports
    let replacement = '';
    if (uiCoreImports.length > 0) {
      replacement += `import { ${uiCoreImports.join(', ')} } from '@rightfit/ui-core';\n`;
    }
    if (localImports.length > 0) {
      replacement += `import { ${localImports.join(', ')} } from '${relativePath}components/ui';`;
    }

    changes.push({
      original: match[0],
      replacement: replacement.trim()
    });
  }

  // Apply changes (in reverse order to maintain positions)
  changes.reverse().forEach(change => {
    modified = modified.replace(change.original, change.replacement);
  });

  if (content !== modified) {
    fs.writeFileSync(filePath, modified, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }

  return false;
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += walkDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (migrateImportsInFile(filePath)) {
        count++;
      }
    }
  });

  return count;
}

const srcDir = path.join(__dirname, 'apps', 'web-cleaning', 'src');
console.log('Migrating imports from ../components/ui to @rightfit/ui-core...\n');
const count = walkDirectory(srcDir);
console.log(`\nDone! Updated ${count} files.`);
