# Rules for Claude/AI Assistants

## 🎯 CORE PHILOSOPHY: RightFit, not QuickFix

**Read [PHILOSOPHY.md](PHILOSOPHY.md) before starting any work.**

This project prioritizes **quality over speed**:
- ✅ Build it right the first time
- ✅ No technical debt compromises
- ✅ Production-ready standards for every feature
- ✅ Best-in-class SaaS quality (compare to Stripe, Airbnb, Linear)
- ❌ No arbitrary deadlines
- ❌ No "we'll fix it later"
- ❌ No corner-cutting

**Key Quality Standards**:
- TypeScript strict mode, zero `any` types
- >80% test coverage (aim for >90%)
- WCAG 2.1 AA accessibility (AAA preferred)
- Mobile responsive, tested on real devices
- All errors handled gracefully
- Clean, maintainable, well-documented code

---

## 📚 REQUIRED READING (In Order)

**Before starting any task, read:**

1. **[PHILOSOPHY.md](PHILOSOPHY.md)** - Core development philosophy and quality standards
2. **[CURRENT-STATE.md](CURRENT-STATE.md)** - Current project status and priorities
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture (15,000+ words)
4. **[PROJECT-PLAN.md](PROJECT-PLAN.md)** - Roadmap and sprint plans
5. **[START-HERE/DEVELOPMENT-GUIDELINES.md](START-HERE/DEVELOPMENT-GUIDELINES.md)** - AI/human collaboration rules

---

## 🚫 NEVER DO (While Human Is Actively Working)

1. Start/stop servers (npm run dev:*, kill) - **ASK FIRST**
2. Install packages (npm install/uninstall) - **ASK FIRST**
3. Run database migrations (prisma migrate) - **ASK FIRST**
4. Delete files without confirmation
5. Run any destructive commands
6. **Accept technical debt or "TODO" comments** - Fix it now, not later
7. **Ship code that doesn't meet quality gates** - Quality is not negotiable

---

## ✅ CAN DO (When Human Is Away / Gone to Bed)

1. Start/stop servers if needed for autonomous work
2. Run tests and development commands
3. Kill stuck processes
4. Document everything done
5. **Continue work to completion, meeting all quality standards**

---

## ✅ ALWAYS DO

### Code Quality
1. **Follow TypeScript strict mode** - Zero `any` types
2. **Write tests first** - >80% coverage required
3. **Handle all errors gracefully** - No silent failures
4. **Document your code** - Future developers will thank you
5. **Follow existing patterns** - See [ARCHITECTURE.md](ARCHITECTURE.md) Section 5 & 6
6. **Make it accessible** - WCAG 2.1 AA minimum
7. **Test on mobile** - Responsive design is required, not optional

### Workflow
1. **Read [CURRENT-STATE.md](CURRENT-STATE.md)** - Understand current priorities
2. **Check quality gates** - Every feature must meet production standards
3. **Ask human to run commands** - During active sessions
4. **Suggest packages, don't install** - Wait for approval
5. **Let human verify changes** - Especially breaking changes
6. **Update documentation** - Keep [CURRENT-STATE.md](CURRENT-STATE.md) current

### Communication
1. **Explain the "why"** - Not just the "what"
2. **Reference quality standards** - Link to [PHILOSOPHY.md](PHILOSOPHY.md)
3. **Call out quality issues** - Don't let them slide
4. **Suggest better approaches** - Even if it takes longer

---

## 🎯 Decision Framework

When making any decision, ask:

1. **Does this compromise quality?** → If yes: Find another way
2. **Will future developers thank us?** → If no: Reconsider
3. **Does this delight users?** → If no: Can we improve it?
4. **Would we be proud to show this?** → If no: Not ready yet
5. **Does this support long-term success?** → If no: Short-term gain, long-term pain

---

## 📋 Sprint Completion Criteria

A sprint/task is **NOT** complete when time runs out.

A sprint/task is complete when:
- ✅ All quality gates passed
- ✅ All tests passing (unit, integration, E2E)
- ✅ Code reviewed (by you) and meets standards
- ✅ Accessibility validated (WCAG 2.1 AA)
- ✅ Performance benchmarks met
- ✅ Mobile responsive verified
- ✅ Documentation updated
- ✅ You're satisfied with quality

**If this takes longer than estimated, that's okay.** Quality is not negotiable.

---

## 🚨 What We DON'T Do

- ❌ Ship on arbitrary deadlines - Launch when **ready**, not when calendar says
- ❌ Accept technical debt - "We'll fix it later" = we won't
- ❌ Skip testing - "It works on my machine" is not a quality standard
- ❌ Ignore accessibility - 10-20% of users have disabilities
- ❌ Compromise security - Security bugs are expensive
- ❌ Create "MVP" that's really "MLP" - We build **lovable** products
- ❌ Suggest "quick fixes" - Suggest **right fixes**

---

## ✅ What We DO

- ✅ Build to last - Code maintainable in 5 years, not just 5 months
- ✅ Test everything - If it's not tested, it's broken
- ✅ Design for humans - Real users, real devices, real accessibility needs
- ✅ Document thoroughly - Future developers will thank us
- ✅ Iterate relentlessly - Good → Great → Best-in-class
- ✅ Celebrate quality - Recognize doing it right, not doing it fast

---

## 📖 Full Documentation

**Root Documentation**:
- [PHILOSOPHY.md](PHILOSOPHY.md) - Development philosophy and quality standards
- [README.md](README.md) - Setup and quick start
- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete system architecture
- [CURRENT-STATE.md](CURRENT-STATE.md) - Current status and priorities
- [PROJECT-PLAN.md](PROJECT-PLAN.md) - Roadmap with quality-focused sprints
- [PROJECT-MAP.md](PROJECT-MAP.md) - Navigation guide
- [REVIEW-GUIDE.md](REVIEW-GUIDE.md) - Review checklist for team validation

**START-HERE Folder**:
- [START-HERE/DEVELOPMENT-GUIDELINES.md](START-HERE/DEVELOPMENT-GUIDELINES.md) - AI/human collaboration rules
- [START-HERE/TECHNICAL-PATTERNS.md](START-HERE/TECHNICAL-PATTERNS.md) - Code patterns
- [START-HERE/TESTING-CHECKLIST.md](START-HERE/TESTING-CHECKLIST.md) - Testing requirements

---

## 💡 Remember

**You write code. Human runs code.**

But more importantly:

**We build best-in-class software. Quality is the only metric.**

---

**Last Updated**: November 7, 2025
**Philosophy**: RightFit, not QuickFix
