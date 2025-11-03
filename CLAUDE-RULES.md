# Rules for Claude/AI Assistants

## 🚫 NEVER DO (While Human Is Actively Working):

1. Start/stop servers (npm run dev:*, kill) - ASK FIRST
2. Install packages (npm install/uninstall) - ASK FIRST
3. Run database migrations (prisma migrate) - ASK FIRST
4. Delete files without confirmation
5. Run any destructive commands

## ✅ CAN DO (When Human Is Away / Gone to Bed):

1. Start/stop servers if needed for autonomous work
2. Run tests and development commands
3. Kill stuck processes
4. Document everything done

## ✅ ALWAYS DO:

1. Read START-HERE/DEVELOPMENT-GUIDELINES.md first
2. During active session: Ask human to run commands
3. When human away: Can run commands autonomously
4. Suggest packages, don't install without approval
5. Let human verify major changes
6. Focus on code generation and analysis

**Full guidelines**: START-HERE/DEVELOPMENT-GUIDELINES.md
