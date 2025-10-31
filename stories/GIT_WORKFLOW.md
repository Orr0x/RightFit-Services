# Git Workflow Guide for RightFit Services

**Purpose:** Step-by-step git instructions for working with user stories
**Audience:** Developer working on Phase 2 stories
**Last Updated:** 2025-10-31

---

## 📋 Quick Reference

### Starting a New Story

```bash
# 1. Get latest main branch
git checkout main
git pull origin main

# 2. Create feature branch (use exact name from story)
git checkout -b feature/story-001-week-5-web-ux

# 3. Verify you're on the new branch
git branch
# Should show: * feature/story-001-week-5-web-ux
```

### Working on a Story

```bash
# Make changes to files...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add inline form validation (STORY-001)"

# Push to remote
git push origin feature/story-001-week-5-web-ux
```

### Completing a Story

```bash
# Final commit
git add .
git commit -m "feat: complete Week 5 web UX polish (STORY-001)"
git push origin feature/story-001-week-5-web-ux

# Mark story as complete in the .md file
# Update status from 📋 Ready to ✅ Complete

# Move to next story
git checkout main
git pull origin main
git checkout -b feature/story-002-mobile-components
```

---

## 🔄 Complete Workflow for Each Story

### Step 1: Prepare for the Story

**Before you start coding:**

1. **Read the story file completely**
   ```bash
   # Example for STORY-001
   cat stories/phase-2/STORY-001-week-5-web-ux-polish.md
   ```

2. **Check dependencies**
   - Ensure previous story is complete
   - Verify prerequisite files exist

3. **Update local main branch**
   ```bash
   git checkout main
   git pull origin main
   ```

---

### Step 2: Create Feature Branch

**Always create a new branch from main:**

```bash
# Create and checkout feature branch
git checkout -b feature/story-001-week-5-web-ux

# Verify branch creation
git branch
# Output should show * on your new branch
```

**Branch naming convention:**
```
feature/story-XXX-short-description
```

Examples:
- `feature/story-001-week-5-web-ux`
- `feature/story-002-mobile-components`
- `feature/story-003-mobile-screens`

---

### Step 3: Work on the Story

**Make frequent commits as you work:**

#### Good Commit Pattern

```bash
# After completing a task in the story
git add .
git commit -m "feat: add inline form validation (STORY-001)"
git push origin feature/story-001-week-5-web-ux

# Continue working...
git add .
git commit -m "feat: add field hints to form components (STORY-001)"
git push origin feature/story-001-week-5-web-ux

# More work...
git add .
git commit -m "fix: improve date picker accessibility (STORY-001)"
git push origin feature/story-001-week-5-web-ux
```

#### Commit Message Format

**Type prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance

**Good commit messages:**
```
feat: add inline form validation (STORY-001)
fix: resolve input focus issue on mobile (STORY-001)
test: verify responsive design on iPhone (STORY-001)
docs: document accessibility audit results (STORY-001)
```

**Bad commit messages:**
```
update files
fixed stuff
WIP
changes
```

---

### Step 4: Check In Regularly

**Push to remote frequently (at least daily):**

```bash
# Push current work
git push origin feature/story-001-week-5-web-ux
```

**Benefits:**
- Backup of your work
- Others can see progress
- Easy to recover if local issues

---

### Step 5: Mark Tasks Complete in Story File

**As you complete each task, update the .md file:**

```bash
# Open the story file
nano stories/phase-2/STORY-001-week-5-web-ux-polish.md

# Change [ ] to [x] for completed tasks
# Before:
# - [ ] Add inline validation on blur

# After:
# - [x] Add inline validation on blur

# Commit the updated story file
git add stories/phase-2/STORY-001-week-5-web-ux-polish.md
git commit -m "docs: update STORY-001 task checklist (STORY-001)"
git push origin feature/story-001-week-5-web-ux
```

---

### Step 6: Complete the Story

**When all tasks are done:**

1. **Final testing**
   ```bash
   # Run all tests from the story's testing checklist
   # Verify all acceptance criteria met
   ```

2. **Update story status**
   ```bash
   # Open story file
   nano stories/phase-2/STORY-001-week-5-web-ux-polish.md

   # Change status at top from:
   **Status:** 📋 Ready to Start

   # To:
   **Status:** ✅ Complete
   **Completed:** 2025-10-31
   ```

3. **Final commit**
   ```bash
   git add .
   git commit -m "feat: complete Week 5 web UX polish (STORY-001)"
   git push origin feature/story-001-week-5-web-ux
   ```

---

### Step 7: Move to Next Story

**Start fresh with next story:**

```bash
# Return to main branch
git checkout main

# Get latest changes
git pull origin main

# Create new branch for next story
git checkout -b feature/story-002-mobile-components

# Verify
git branch
# Should show: * feature/story-002-mobile-components

# Start working on STORY-002
```

---

## ⚠️ Important Rules

### ✅ DO:

1. **Create a new branch for each story**
   ```bash
   git checkout -b feature/story-XXX-description
   ```

2. **Commit frequently** (multiple times per day)
   ```bash
   git commit -m "descriptive message (STORY-XXX)"
   ```

3. **Push regularly** (at least once per day)
   ```bash
   git push origin feature/story-XXX-description
   ```

4. **Reference story ID in commits**
   ```bash
   git commit -m "feat: add component (STORY-002)"
   ```

5. **Keep branch up to date with main**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/story-XXX-description
   git merge main  # If needed
   ```

6. **Test before final commit**
   - Run all tests from story checklist
   - Verify acceptance criteria

7. **Update story file as you work**
   - Check off completed tasks
   - Add notes if needed

---

### ❌ DO NOT:

1. **Work directly on main branch**
   ```bash
   # NEVER do this:
   git checkout main
   # make changes
   git commit -m "changes"
   git push origin main
   ```

2. **Delete .md files**
   - Never delete story files
   - Never delete documentation
   - Archive when truly obsolete, don't delete

3. **Skip stories or work out of order**
   - STORY-002 depends on STORY-001
   - STORY-003 depends on STORY-002
   - Always work in sequence

4. **Force push**
   ```bash
   # NEVER do this (unless you really know why):
   git push --force origin feature/story-XXX
   ```

5. **Commit to wrong branch**
   ```bash
   # Always verify current branch before committing:
   git branch
   # Should show * on your feature branch
   ```

6. **Make commits without messages**
   ```bash
   # BAD:
   git commit
   # GOOD:
   git commit -m "descriptive message (STORY-XXX)"
   ```

---

## 🐛 Troubleshooting

### "I'm on the wrong branch!"

```bash
# Check current branch
git branch

# If you made commits on wrong branch:
# 1. Note the commit hash
git log

# 2. Checkout correct branch
git checkout feature/story-XXX-correct

# 3. Cherry-pick the commit
git cherry-pick <commit-hash>

# 4. Go back to wrong branch and reset
git checkout wrong-branch
git reset --hard HEAD~1  # Be careful with this!
```

### "I forgot to create a branch!"

```bash
# If you made changes on main:
# 1. Create branch from main (keeps changes)
git checkout -b feature/story-XXX-description

# 2. Commit changes
git add .
git commit -m "feat: your changes (STORY-XXX)"

# 3. Push to feature branch
git push origin feature/story-XXX-description
```

### "I need to update from main"

```bash
# Get latest main
git checkout main
git pull origin main

# Go back to feature branch
git checkout feature/story-XXX-description

# Merge main into your branch
git merge main

# Resolve any conflicts if needed
# Then push
git push origin feature/story-XXX-description
```

### "I have merge conflicts"

```bash
# When you see conflicts after merge:
# 1. Open conflicted files
# Look for:
<<<<<<< HEAD
your changes
=======
main branch changes
>>>>>>> main

# 2. Resolve conflicts manually
# 3. Mark as resolved
git add <resolved-files>

# 4. Complete merge
git commit -m "merge: resolve conflicts from main (STORY-XXX)"

# 5. Push
git push origin feature/story-XXX-description
```

### "I need to undo my last commit"

```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Undo last commit and discard changes (careful!)
git reset --hard HEAD~1

# Undo last commit, keep changes as unstaged
git reset HEAD~1
```

---

## 📊 Checking Your Work

### View your commits

```bash
# See commit history
git log --oneline

# See commits for current branch only
git log --oneline main..HEAD
```

### Check what changed

```bash
# See unstaged changes
git diff

# See staged changes
git diff --staged

# See what files changed
git status
```

### Verify branch

```bash
# List all branches
git branch

# List all branches (including remote)
git branch -a

# See current branch
git branch --show-current
```

---

## 🎯 Story-by-Story Git Commands

### STORY-001: Week 5 Web UX Polish

```bash
git checkout main
git pull origin main
git checkout -b feature/story-001-week-5-web-ux

# Work on forms, responsive, accessibility...
git add .
git commit -m "feat: add inline form validation (STORY-001)"
git push origin feature/story-001-week-5-web-ux

# Continue until complete...
git commit -m "feat: complete Week 5 web UX polish (STORY-001)"
git push origin feature/story-001-week-5-web-ux
```

### STORY-002: Mobile Component Library

```bash
git checkout main
git pull origin main
git checkout -b feature/story-002-mobile-components

# Build design tokens, components...
git commit -m "feat: convert design tokens to React Native (STORY-002)"
git push origin feature/story-002-mobile-components

# Continue...
git commit -m "feat: complete mobile component library (STORY-002)"
git push origin feature/story-002-mobile-components
```

### STORY-003: Mobile Screen Migration

```bash
git checkout main
git pull origin main
git checkout -b feature/story-003-mobile-screens

# Migrate screens...
git commit -m "feat: migrate PropertiesListScreen (STORY-003)"
git push origin feature/story-003-mobile-screens

# Continue...
git commit -m "feat: migrate all mobile screens (STORY-003)"
git push origin feature/story-003-mobile-screens
```

### And so on for STORY-004, STORY-005, STORY-006...

---

## 📞 Getting Help

**If you get stuck with git:**

1. Check this guide first
2. Use `git status` to see current state
3. Use `git log` to see commit history
4. Search for the error message online
5. Ask for help (provide git status output)

**Common help commands:**

```bash
# See what git thinks the state is
git status

# See recent commits
git log --oneline -10

# See all branches
git branch -a

# See remote URLs
git remote -v
```

---

## 🎉 Success Checklist

**Before considering a story done:**

- [ ] All tasks in story file checked off
- [ ] All acceptance criteria met
- [ ] All commits pushed to feature branch
- [ ] Story status updated to ✅ Complete
- [ ] Branch name matches story exactly
- [ ] Commit messages include story ID
- [ ] No work done directly on main
- [ ] Ready to move to next story

---

**Remember:** Git is your safety net. Commit often, push regularly, never delete history!

**Happy coding! 🚀**
