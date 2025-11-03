# 🛠️ Development Guidelines

**Rules for AI Assistants & Developers Working on This Project**

---

## 🚫 CRITICAL RULES - DO NOT BREAK

### **Rule 1: Server Management (Context-Dependent)**

**⚠️ IMPORTANT**: Server management depends on whether human is actively working.

**When human is ACTIVELY working (in session):**
- ❌ DO NOT run `npm run dev:*` commands
- ❌ DO NOT run `npm start` or similar
- ❌ DO NOT kill running processes
- ❌ DO NOT restart servers
- ❌ DO NOT run `pkill`, `kill`, `killall`, etc.
- ✅ Ask human to start/stop servers
- ✅ Assume servers are already running

**When human is AWAY (gone to bed, not responding):**
- ✅ CAN run server commands if needed for testing
- ✅ CAN kill/restart servers to fix issues
- ✅ Should still document what was done
- ✅ Should clean up before human returns

**Why this rule?**
- Prevents port conflicts during active collaboration
- Human knows what's running while they work
- Avoids unexpected restarts mid-development
- But allows autonomous work when human is away

**How to tell if human is away?**
- Human says "gone to bed", "stepping away", "see you tomorrow"
- No response for extended period (30+ minutes)
- End of work day (typically after 10pm)

**Example - CORRECT:**
```
Please start the maintenance server if it's not already running:

Terminal 1:
npm run dev:api

Terminal 2:
npm run dev:maintenance

Then I'll help you test the endpoint.
```

**Example - INCORRECT:**
```
Let me start the server for you...
[Runs npm run dev:maintenance]  ❌ WRONG!
```

---

### **Rule 2: Never Modify Package Dependencies Without Approval**

**What NOT to do:**
- ❌ DO NOT run `npm install <package>`
- ❌ DO NOT run `npm uninstall <package>`
- ❌ DO NOT modify package.json directly
- ❌ DO NOT run `npm update`

**What TO do instead:**
- ✅ Suggest packages that might be needed
- ✅ Explain why the package is needed
- ✅ Wait for human approval before suggesting installation
- ✅ Use existing packages whenever possible

---

### **Rule 3: Never Run Database Migrations Without Approval**

**What NOT to do:**
- ❌ DO NOT run `npx prisma migrate dev`
- ❌ DO NOT run `npx prisma db push`
- ❌ DO NOT run `npx prisma migrate reset`
- ❌ DO NOT modify schema.prisma without discussion

**What TO do instead:**
- ✅ Propose schema changes
- ✅ Explain the migration needed
- ✅ Let human run migrations
- ✅ Use `npx prisma studio` to VIEW database (read-only is OK)

---

## ✅ WHAT AI ASSISTANTS CAN DO

### **Code Generation & Editing**
- ✅ Read any file
- ✅ Write new files
- ✅ Edit existing files
- ✅ Create components, services, utilities
- ✅ Fix bugs and refactor code

### **Documentation**
- ✅ Create documentation
- ✅ Update documentation
- ✅ Generate code examples
- ✅ Write README files

### **Testing & Verification**
- ✅ Read test results
- ✅ Analyze logs
- ✅ Check git status
- ✅ Review code
- ✅ Suggest test commands (but don't run them)

### **Database (Read-Only)**
- ✅ View Prisma Studio (if human starts it)
- ✅ Read schema.prisma
- ✅ Suggest queries
- ✅ Explain database structure

### **Analysis**
- ✅ Search codebase (grep, glob)
- ✅ Analyze architecture
- ✅ Find bugs
- ✅ Review patterns
- ✅ Check for issues

---

## 📋 WORKFLOW WITH HUMAN DEVELOPER

### **Typical Interaction Pattern**

**AI Assistant does:**
1. Understand the task
2. Read relevant files
3. Generate code
4. Write/edit files
5. Explain what was done

**Human developer does:**
1. Review changes
2. Run servers if needed
3. Test in browser
4. Run database commands if needed
5. Commit changes when ready

### **Example Workflow: Adding New API Endpoint**

**AI:**
```
I'll add the contractor assignment endpoint.

Files to edit:
1. apps/api/src/services/MaintenanceJobsService.ts
   - Add assignInternalContractor() method

2. apps/api/src/routes/maintenance-jobs.ts
   - Add PUT /api/maintenance-jobs/:id/assign route

[Creates/edits files]

Done! To test:
1. Make sure API server is running (npm run dev:api)
2. Use this curl command:
   curl -X PUT http://localhost:3001/api/maintenance-jobs/JOB_ID/assign ...
```

**Human:**
```
[Checks that API server is running in Terminal 1]
[Runs the curl command]
[Reports results]
```

---

## 🎯 BEST PRACTICES

### **For AI Assistants**

**Communication:**
- ✅ Always explain what you're about to do
- ✅ Show full code examples
- ✅ Provide test commands (but don't run them)
- ✅ Ask for clarification if unsure
- ✅ Tell human what to verify after changes

**Code Quality:**
- ✅ Follow TypeScript strict mode
- ✅ Add proper error handling
- ✅ Include helpful comments
- ✅ Use existing patterns from codebase
- ✅ Reuse existing components/utilities

**Safety:**
- ✅ Never delete files without confirmation
- ✅ Never run destructive commands
- ✅ Back up important changes
- ✅ Warn about breaking changes

### **For Human Developers**

**Server Management:**
- Keep servers running in separate terminals
- Monitor server logs for errors
- Restart servers manually when needed
- Know which ports are in use

**Testing:**
- Test changes in browser
- Use Prisma Studio to verify database changes
- Run curl/Postman for API testing
- Check Network tab in browser DevTools

**Version Control:**
- Review AI-generated code before committing
- Write meaningful commit messages
- Test before pushing

---

## 🚨 EMERGENCY PROCEDURES

### **If AI Accidentally Starts a Server**

```bash
# 1. Find the process
lsof -i :3001  # or whatever port
ps aux | grep node

# 2. Kill it
kill <PID>

# 3. Restart properly in your terminal
npm run dev:api
```

### **If Database Gets Corrupted**

```bash
# 1. Reset database (WARNING: loses data)
cd packages/database
npx prisma migrate reset

# 2. Reseed
npm run db:seed
```

### **If Ports Are Conflicted**

```bash
# Find and kill processes on specific ports
lsof -ti:3001 | xargs kill
lsof -ti:5175 | xargs kill
lsof -ti:5176 | xargs kill
```

---

## 📞 WHEN TO ASK HUMAN

**AI Should Ask Human When:**
- Need to start/stop a server
- Need to install a package
- Need to run a migration
- About to make breaking changes
- Unsure about approach
- Need to test something
- Database changes needed

**Example:**
```
I need to test this endpoint. Could you please:

1. Make sure the API server is running (npm run dev:api)
2. Run this curl command:
   curl -X PUT ...
3. Let me know what response you get

Then I can help debug if there are any issues.
```

---

## ✅ SUMMARY

**AI Assistants:**
- 📝 Write code, documentation, tests
- 🔍 Read files, analyze, search
- 🤔 Suggest solutions, explain concepts
- 🚫 NEVER start/stop servers
- 🚫 NEVER modify dependencies
- 🚫 NEVER run migrations

**Human Developers:**
- 🖥️ Manage all running servers
- 📦 Install/update packages
- 🗄️ Run database migrations
- ✅ Test changes in browser
- 🔬 Verify AI-generated code
- 💾 Commit and push code

**Together:**
- AI generates code quickly
- Human tests and verifies
- Human manages infrastructure
- AI focuses on code quality
- Both collaborate efficiently

---

## 🎓 FOR AI ASSISTANTS: READ THIS FIRST

**Before starting any task:**

1. ✅ Read CURRENT_STATUS.md to understand project state
2. ✅ Check which files exist before creating
3. ✅ Ask human about server status
4. ✅ Never assume servers need to be started
5. ✅ Focus on code generation, not infrastructure

**Remember:**
- You write code
- Human runs code
- You suggest commands
- Human executes commands
- You analyze results
- Human makes final decisions

---

*Follow these guidelines to work effectively with human developers!*
*Last Updated: 2025-11-02*
