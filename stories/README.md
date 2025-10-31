# User Stories - RightFit Services

**Purpose:** This folder contains all user stories for active development work.
**Developer Instructions:** Follow stories in order, create feature branches, never delete .md files.

---

## 📋 How to Use This Folder

### For Developers:

1. **Read stories in order** - Start with the lowest numbered story in the active phase
2. **Create a feature branch** - Use the branch name specified in each story
3. **Follow the story** - Complete all tasks and acceptance criteria
4. **Commit regularly** - Push to your feature branch frequently
5. **Never delete .md files** - Archive completed stories, never delete them
6. **Update story status** - Mark tasks as complete in the story file as you work

### Story Structure:

```
stories/
├── README.md (this file)
├── phase-2/                    # Phase 2: UX Excellence stories
│   ├── STORY-001-week-5-web-ux-polish.md
│   ├── STORY-002-mobile-component-library.md
│   ├── STORY-003-mobile-screen-migration.md
│   ├── STORY-004-mobile-ux-polish.md
│   ├── STORY-005-dark-mode-cross-platform.md
│   └── STORY-006-wireframe-implementation.md
├── phase-3/                    # Phase 3: Feature Completeness (future)
└── completed/                  # Archived completed stories
```

---

## 🔄 Git Workflow

### Creating a Feature Branch

**For each story, create a new feature branch:**

```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create feature branch (use exact name from story)
git checkout -b feature/story-001-week-5-web-ux

# Verify you're on the new branch
git branch
```

### Working on the Story

```bash
# Make changes, then commit frequently
git add .
git commit -m "feat: add inline form validation (STORY-001)"

# Push to remote feature branch
git push origin feature/story-001-week-5-web-ux

# Continue working...
git add .
git commit -m "feat: add accessibility audit script (STORY-001)"
git push origin feature/story-001-week-5-web-ux
```

### Completing a Story

```bash
# When story is complete, push final changes
git add .
git commit -m "feat: complete Week 5 web UX polish (STORY-001)"
git push origin feature/story-001-week-5-web-ux

# Mark story as complete in the .md file
# Move to next story (create new branch from main)
git checkout main
git pull origin main
git checkout -b feature/story-002-mobile-components
```

### Important Git Rules:

✅ **DO:**
- Create a new feature branch for each story
- Commit frequently with descriptive messages
- Push to your feature branch regularly
- Reference story ID in commit messages (e.g., "STORY-001")
- Keep your branch up to date with main

❌ **DO NOT:**
- Work directly on main branch
- Delete .md files (archive them instead)
- Force push (`git push --force`)
- Commit directly to main
- Skip stories or work out of order

---

## 📊 Current Sprint Status

**Active Phase:** Phase 2 - UX Excellence
**Current Sprint:** Weeks 5-9 (Extended)
**Total Stories:** 6 active stories
**Estimated Duration:** 6 weeks

### Story Status

| Story ID | Title | Points | Status | Branch |
|----------|-------|--------|--------|--------|
| STORY-001 | Week 5 Web UX Polish | 14 | 📋 Ready | `feature/story-001-week-5-web-ux` |
| STORY-002 | Mobile Component Library | 15 | 📋 Ready | `feature/story-002-mobile-components` |
| STORY-003 | Mobile Screen Migration | 25 | 📋 Ready | `feature/story-003-mobile-screens` |
| STORY-004 | Mobile UX Polish | 28 | 📋 Ready | `feature/story-004-mobile-polish` |
| STORY-005 | Dark Mode & Cross-Platform | 28 | 📋 Ready | `feature/story-005-dark-mode` |
| STORY-006 | Wireframe Implementation | 40 | 📋 Ready | `feature/story-006-wireframes` |

**Total:** 150 story points (~6 weeks @ 25 points/week)

---

## 📖 Story Format

Each story file contains:

1. **Story Header** - ID, title, points, status
2. **Description** - What and why
3. **Acceptance Criteria** - Definition of done
4. **Tasks** - Checklist of work items
5. **Technical Details** - Implementation guidance
6. **Git Branch** - Exact branch name to use
7. **Dependencies** - What must be complete first
8. **Testing** - How to verify completion
9. **References** - Related documentation

---

## 🎯 Getting Started

**To start working on Phase 2:**

1. Read [STORY-001-week-5-web-ux-polish.md](phase-2/STORY-001-week-5-web-ux-polish.md)
2. Create feature branch: `git checkout -b feature/story-001-week-5-web-ux`
3. Complete all tasks in the story
4. Mark checkboxes as you complete them
5. Commit and push regularly
6. When complete, move to STORY-002

---

## ❗ Important Rules

### Never Delete .md Files

**Why?** These files are the project's memory. They document:
- What work was done
- Why decisions were made
- How features were implemented
- What acceptance criteria were met

**Instead of deleting:**
1. Mark story as ✅ Complete in the file
2. Move to `completed/` folder when archived
3. Keep the file for reference

### Always Follow Stories in Order

**Why?** Stories have dependencies. Later stories assume earlier ones are complete.

**Correct order:**
```
STORY-001 → STORY-002 → STORY-003 → STORY-004 → STORY-005 → STORY-006
```

**If you skip STORY-002 and jump to STORY-003:**
- STORY-003 assumes mobile components exist (from STORY-002)
- You'll be blocked and waste time
- You may introduce bugs or inconsistencies

---

## 📞 Support

**Questions about stories?** Check:
- [PHASE_2_SPRINT_PLAN.md](../Project-Plan/PHASE_2_SPRINT_PLAN.md) - Overall sprint plan
- [CURRENT_STATE_VERIFIED.md](../Project-Plan/CURRENT_STATE_VERIFIED.md) - Current state audit
- [DOCUMENTATION_AUDIT_REPORT.md](../Project-Plan/DOCUMENTATION_AUDIT_REPORT.md) - Detailed findings

**Need help with git?** See Git Workflow section above.

**Story unclear?** Each story has detailed tasks and acceptance criteria.

---

**Happy Coding! 🚀**

*Last Updated: 2025-10-31*
