# ⚠️ SAFE MIGRATION RULES - READ FIRST

**CRITICAL:** These rules prevent accidental deletion of important files and configurations.

---

## 🚫 NEVER DELETE THESE

### User Configuration Folders
- ❌ **NEVER** delete `.bmad/` or `.bmad-core/`
- ❌ **NEVER** delete `.claude/`
- ❌ **NEVER** delete `.goose/`
- ❌ **NEVER** delete `.cursor/`
- ❌ **NEVER** delete `.vscode/` or `.idea/`
- ❌ **NEVER** delete any dotfiles (`.something`) without explicit user approval

### Documentation
- ❌ **NEVER** delete `docs/PHASE_*.md` files
- ❌ **NEVER** delete any `.md` files in root or docs/ without explicit approval
- ❌ **NEVER** delete sprint plans, PRD, or architectural docs

### Dependencies
- ❌ **NEVER** run `npm uninstall` without explicit user approval
- ❌ **NEVER** delete `node_modules/` manually (use npm clean install)
- ❌ **NEVER** modify `package.json` dependencies without user approval

### Project Files
- ❌ **NEVER** delete `.env` files (even .env.example)
- ❌ **NEVER** delete configuration files (.eslintrc, .prettierrc, etc.)
- ❌ **NEVER** delete `.git/` or `.gitignore`

---

## ✅ SAFE MIGRATION PROCESS

### Phase 1: Prepare (No Deletions)
1. Read existing code
2. Create new components alongside old ones
3. Test new components in isolation
4. Document changes

### Phase 2: Migrate (Still No Deletions)
1. Update imports from old → new
2. Keep old dependencies installed
3. Test thoroughly
4. Get user approval

### Phase 3: Cleanup (Only After User Approval)
1. **ASK USER FIRST:** "Can I remove Material-UI now that migration is complete?"
2. **WAIT FOR EXPLICIT YES**
3. Only then: `npm uninstall @mui/material`
4. Commit changes
5. Test again

---

## 📋 Pre-Deletion Checklist

Before deleting/removing ANYTHING, check:

- [ ] Did the user explicitly approve this deletion?
- [ ] Have I backed up or committed the current state?
- [ ] Is this a configuration file (.bmad, .claude, etc.)? **→ STOP, DON'T DELETE**
- [ ] Is this documentation (.md files)? **→ ASK USER FIRST**
- [ ] Is this a dependency? **→ ASK USER FIRST**
- [ ] Have I tested that the system works without it?
- [ ] Can this be easily restored if something breaks?

**If you answered NO to any question above: DON'T DELETE IT**

---

## 🔒 Protected Patterns

These patterns should NEVER be deleted without explicit user approval:

```bash
# User configs
.*mad*
.claude*
.goose*
.cursor*
.vscode*
.idea*

# Documentation
docs/*.md
*.md
PHASE_*.md
README*
HANDOVER*

# Configs
.*rc
.*config.*
.env*
.git*

# Dependencies
package*.json
node_modules/
```

---

## 🚨 Red Flag Commands

If you're about to run any of these, **STOP AND ASK USER FIRST:**

```bash
# Dangerous deletions
rm -rf .bmad*
rm -rf .claude
rm -rf docs/
rm *.md
git rm -r

# Dependency removal
npm uninstall
yarn remove
pnpm remove

# Git operations
git clean -fd
git reset --hard
git push --force
```

---

## ✅ What You CAN Delete (After Testing)

After successful migration and user approval ONLY:

1. Old component imports (in code, not packages)
2. Commented-out code that's been replaced
3. Test files for removed features
4. Build artifacts (`dist/`, `build/`)
5. Temporary files (`*.tmp`, `*.log`)

**But even these should be removed via code changes, not file deletion!**

---

## 📝 Proper Process Example

### ❌ WRONG (Dangerous):
```typescript
// 1. Delete Material-UI immediately
npm uninstall @mui/material

// 2. Update code
// Oops! Code breaks, can't easily recover
```

### ✅ CORRECT (Safe):
```typescript
// 1. Update code first (keep old deps)
import { Button } from '@/components/ui' // new
// import { Button } from '@mui/material' // old - commented out

// 2. Test thoroughly
// 3. Get user approval
// 4. ONLY THEN remove dependency
// User says: "yes, remove Material-UI"
npm uninstall @mui/material

// 5. Test again
// 6. Commit
```

---

## 🎯 Key Principles

1. **ASK, DON'T ASSUME** - When in doubt, ask the user
2. **PRESERVE, DON'T DELETE** - Lean toward keeping things
3. **TEST, THEN REMOVE** - Never remove before testing
4. **COMMIT, THEN CHANGE** - Commit current state before major changes
5. **DOCUMENT, THEN DELETE** - Document what was removed and why

---

## 🆘 If You Already Deleted Something

1. **STOP** - Don't make more changes
2. **CHECK GIT**: `git status`, `git log`
3. **TRY RESTORE**: `git checkout HEAD -- <file>`
4. **CHECK .gitignore**: File might not have been tracked
5. **INFORM USER** - Be transparent about what happened
6. **ASK FOR BACKUP** - User might have backups

---

**REMEMBER:** It's easier to delete things later than to recover them!

When in doubt: **KEEP IT, ASK USER**
