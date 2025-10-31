# START HERE - Developer Instructions

**Welcome to Phase 2 Development!**

This document tells you exactly what to do to complete Phase 2 of RightFit Services.

---

## 🎯 Your Mission

Complete 6 user stories to finish Phase 2 (UX Excellence) and implement the new service provider platform.

**Timeline:** 6 weeks (150 story points @ ~25 points/week)

---

## 📋 What You Need to Do

### 1. Read the README First

Open and read: [stories/README.md](README.md)

This explains:
- How the story folder works
- Git workflow basics
- Story format
- Important rules

**⏱️ Time: 10 minutes**

---

### 2. Review Git Workflow

Open and review: [stories/GIT_WORKFLOW.md](GIT_WORKFLOW.md)

This shows you:
- How to create feature branches
- How to commit and push
- What to do when complete
- Troubleshooting

**⏱️ Time: 15 minutes**

---

### 3. Understand Current State

Read these for context (optional but recommended):

- [Project-Plan/EXECUTIVE_SUMMARY.md](../Project-Plan/EXECUTIVE_SUMMARY.md) - Quick overview
- [Project-Plan/CURRENT_STATE_VERIFIED.md](../Project-Plan/CURRENT_STATE_VERIFIED.md) - What's done vs not done
- [Project-Plan/PHASE_2_SPRINT_PLAN.md](../Project-Plan/PHASE_2_SPRINT_PLAN.md) - Overall plan

**⏱️ Time: 20 minutes** (or skim quickly)

---

### 4. Start STORY-001

**This is where you begin coding.**

Open: [phase-2/STORY-001-week-5-web-ux-polish.md](phase-2/STORY-001-week-5-web-ux-polish.md)

Read the entire story, then:

```bash
# Create feature branch
git checkout main
git pull origin main
git checkout -b feature/story-001-week-5-web-ux

# Start working on Part 1: Form UX Improvements
```

**⏱️ Duration: 5-7 days**

---

### 5. Continue Through Stories in Order

**CRITICAL:** Do stories in exact order. Do NOT skip ahead.

**Story Order:**

1. ✅ **STORY-001** (14 pts, 5-7 days) - Week 5 web UX polish
   - Form validation
   - Responsive design testing
   - Accessibility audit

2. ✅ **STORY-002** (15 pts, 5-7 days) - Mobile component library
   - Convert design tokens
   - Build React Native components
   - Match web design

3. ✅ **STORY-003** (25 pts, 8-10 days) - Migrate mobile screens
   - Replace React Native Paper
   - Apply design tokens
   - Verify offline sync

4. ✅ **STORY-004** (28 pts, 7-10 days) - Mobile UX polish
   - Animations
   - Haptic feedback
   - Offline indicators

5. ✅ **STORY-005** (28 pts, 7-10 days) - Dark mode & cross-platform
   - Dark mode web + mobile
   - Keyboard shortcuts
   - Cross-platform consistency

6. ✅ **STORY-006** (40 pts, 10-14 days) - Wireframes (new platform)
   - Service provider dashboards
   - Cleaning + Maintenance workflows
   - Guest portal

**Total:** ~42-58 days (6-8 weeks)

---

## ⚠️ Critical Rules

### Rule 1: Never Delete .md Files

❌ **DO NOT DELETE:**
- Any story file
- Any documentation
- Any markdown file

✅ **Instead:**
- Mark stories as complete in the file
- Archive old files to `completed/` folder
- Never permanently delete

**Why?** These files are the project's memory and documentation.

---

### Rule 2: Always Work in Order

❌ **DO NOT:**
- Skip STORY-002 and jump to STORY-003
- Work on multiple stories simultaneously
- Work out of sequence

✅ **DO:**
- Complete STORY-001 fully before starting STORY-002
- Complete STORY-002 fully before starting STORY-003
- And so on...

**Why?** Later stories depend on earlier ones being complete.

---

### Rule 3: Always Use Feature Branches

❌ **DO NOT:**
- Work directly on `main` branch
- Commit to `main`
- Push to `main`

✅ **DO:**
- Create a feature branch for each story
- Use exact branch name from story
- Example: `feature/story-001-week-5-web-ux`

**Why?** Keeps main branch stable and allows for code review.

---

### Rule 4: Commit and Push Frequently

✅ **DO:**
- Commit multiple times per day
- Push to your feature branch daily
- Reference story ID in commit messages

**Example:**
```bash
git add .
git commit -m "feat: add inline form validation (STORY-001)"
git push origin feature/story-001-week-5-web-ux
```

**Why?** Frequent commits = backup + progress tracking.

---

### Rule 5: Update Story Files as You Work

✅ **DO:**
- Check off tasks as you complete them
- Update story status when done
- Commit story file changes

**Example:**
```bash
# In STORY-001 file, change:
- [ ] Add inline validation

# To:
- [x] Add inline validation

# Then commit
git add stories/phase-2/STORY-001-week-5-web-ux-polish.md
git commit -m "docs: update STORY-001 checklist (STORY-001)"
git push origin feature/story-001-week-5-web-ux
```

**Why?** Shows progress and prevents forgetting what's done.

---

## 📁 Folder Structure

```
stories/
├── README.md                              # How stories work
├── GIT_WORKFLOW.md                        # Git instructions
├── START_HERE_DEV.md                      # This file
└── phase-2/
    ├── STORY-001-week-5-web-ux-polish.md         # Story 1 ⬅️ START HERE
    ├── STORY-002-mobile-component-library.md     # Story 2
    ├── STORY-003-mobile-screen-migration.md      # Story 3
    ├── STORY-004-mobile-ux-polish.md             # Story 4
    ├── STORY-005-dark-mode-cross-platform.md     # Story 5
    └── STORY-006-wireframe-implementation.md     # Story 6
```

---

## 🚀 Quick Start (First 30 Minutes)

**Do this right now:**

### Step 1: Read README (10 min)
```bash
cat stories/README.md
```

### Step 2: Read Git Workflow (15 min)
```bash
cat stories/GIT_WORKFLOW.md
```

### Step 3: Open STORY-001 (5 min)
```bash
cat stories/phase-2/STORY-001-week-5-web-ux-polish.md
```

### Step 4: Create Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/story-001-week-5-web-ux
git branch  # Verify you're on the new branch
```

### Step 5: Start Coding
Open `apps/web/src/hooks/useForm.ts` and start Part 1.1 of STORY-001.

---

## 📊 Progress Tracking

### How to Know What to Do

**Each story file has:**
1. ✅ Tasks checklist - Check these off as you work
2. 🎯 Acceptance criteria - Must meet all of these
3. 🧪 Testing checklist - Verify before marking complete
4. 📁 Files to modify - Know what to change
5. 🔧 Technical examples - Copy-paste starting points

**Follow the story file exactly. It has everything you need.**

---

## ❓ What If I Get Stuck?

### Problem: Git is confusing

**Solution:** Open [GIT_WORKFLOW.md](GIT_WORKFLOW.md) and find your issue in the Troubleshooting section.

### Problem: Story is unclear

**Solution:** Each story has detailed tasks with file references and examples. Read the entire story file carefully.

### Problem: I don't know what order to do things

**Solution:** Follow the tasks in the story file from top to bottom. They're in the correct order.

### Problem: Tests are failing

**Solution:** Check the testing checklist in the story file. Make sure you completed all previous tasks.

### Problem: I accidentally worked on main

**Solution:** See GIT_WORKFLOW.md section "I forgot to create a branch!"

---

## 🎯 Success Metrics

**You'll know you're doing it right when:**

- ✅ You're working on feature branches (not main)
- ✅ You commit multiple times per day
- ✅ Story tasks are checked off as you complete them
- ✅ Each story is fully complete before moving to next
- ✅ You reference story IDs in commit messages
- ✅ You push to remote daily

**Red flags (you're doing it wrong):**

- ❌ Working directly on main branch
- ❌ Haven't committed in 2+ days
- ❌ Skipped STORY-001 and went to STORY-003
- ❌ Deleted a story .md file
- ❌ Commit messages like "update" or "changes"
- ❌ Haven't pushed in 3+ days

---

## 📞 Resources

**All stories:** `stories/phase-2/`

**Git help:** [stories/GIT_WORKFLOW.md](GIT_WORKFLOW.md)

**Project context:**
- [Project-Plan/EXECUTIVE_SUMMARY.md](../Project-Plan/EXECUTIVE_SUMMARY.md)
- [Project-Plan/CURRENT_STATE_VERIFIED.md](../Project-Plan/CURRENT_STATE_VERIFIED.md)
- [Project-Plan/PHASE_2_SPRINT_PLAN.md](../Project-Plan/PHASE_2_SPRINT_PLAN.md)

**Phase 2 completion summary:**
- [Project-Plan/PHASE_2_COMPLETION_SUMMARY.md](../Project-Plan/PHASE_2_COMPLETION_SUMMARY.md)

---

## 🎉 When You Finish

**After completing all 6 stories:**

1. Phase 2 is COMPLETE! 🎉
2. Mobile app matches web design ✅
3. Dark mode working ✅
4. New service provider platform launched ✅
5. Ready for Phase 3 (Feature Completeness)

---

## 🚦 Now Start!

**Your next action:** Open and read STORY-001

```bash
cat stories/phase-2/STORY-001-week-5-web-ux-polish.md
```

Then create the branch and start coding:

```bash
git checkout -b feature/story-001-week-5-web-ux
```

**Good luck! You've got this! 💪**

---

**Created:** 2025-10-31
**Last Updated:** 2025-10-31
