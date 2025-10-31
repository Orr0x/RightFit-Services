# Guest AI Dashboard Wireframes

**Target User:** Lodge Guests - Short-term rental guests staying at properties
**Device:** Wall-mounted tablet (iPad/Android) in each property
**Primary Use Case:** Self-service Q&A, issue reporting, and emergency triage
**Key Objective:** Reduce calls to property manager, auto-triage maintenance issues, guide DIY fixes

---

## Dashboard Overview

### 1. Home/Idle Screen - Welcome & Quick Actions

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                                                                           ║
║                         🏔️  WELCOME TO                                  ║
║                          BEAR CABIN                                       ║
║                                                                           ║
║                    Your home in the Smokies                               ║
║                                                                           ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                      │ ║
║  │                                                                      │ ║
║  │               👋  Hi, welcome to your cabin!                        │ ║
║  │                                                                      │ ║
║  │              I'm your AI assistant, here to help                     │ ║
║  │              with anything you need during your stay.               │ ║
║  │                                                                      │ ║
║  │                                                                      │ ║
║  │   ┌────────────────────────────────────────────────────────────┐   │ ║
║  │   │                                                             │   │ ║
║  │   │               ❓  ASK ME ANYTHING                           │   │ ║
║  │   │                                                             │   │ ║
║  │   │          WiFi password? Check-out time? Best                │   │ ║
║  │   │          restaurants? I can answer instantly!               │   │ ║
║  │   │                                                             │   │ ║
║  │   └────────────────────────────────────────────────────────────┘   │ ║
║  │                                                                      │ ║
║  │                                                                      │ ║
║  │   ┌────────────────────────────────────────────────────────────┐   │ ║
║  │   │                                                             │   │ ║
║  │   │         🔧  REPORT AN ISSUE                                 │   │ ║
║  │   │                                                             │   │ ║
║  │   │         Something not working? I'll help fix it             │   │ ║
║  │   │         or get help on the way fast.                        │   │ ║
║  │   │                                                             │   │ ║
║  │   └────────────────────────────────────────────────────────────┘   │ ║
║  │                                                                      │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🌟 QUICK HELP                                                       │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │   📶  WiFi Password          🌡️  Thermostat Help                   │ ║
║  │   🕐  Check-out Info         🍽️  Local Restaurants                 │ ║
║  │   🚗  Parking Info           🎣  Things to Do                       │ ║
║  │   📺  TV Guide               🏞️  Hiking Trails                     │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📞 EMERGENCY CONTACT                                                │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │  Property Manager: Jane Smith                                       │ ║
║  │  Phone: (865) 555-0123                                              │ ║
║  │                                                                      │ ║
║  │  For life-threatening emergencies, dial 911                         │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║                                                                           ║
║                    [Tap anywhere to get started]                         ║
║                                                                           ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Large Touch Targets**: Buttons optimized for finger taps (even with cold hands!)
- **Simple Language**: No technical jargon, friendly and welcoming
- **Dual Pathways**: Questions (AI chat) vs. Issues (triage workflow)
- **Quick Help Tiles**: Common questions answered with one tap
- **Emergency Contact**: Always visible for urgent situations
- **Auto-Sleep Mode**: Screen dims after 2 minutes, wakes on tap

**Integration Points:**
- RAG knowledge base (property-specific Q&A)
- Maintenance Dashboard (issue reporting feeds directly to Alex)
- Photo storage (guests can upload issue photos)

**Data Model Extensions:**
- `guest_sessions` table: property_id, session_start, session_end, interactions_count
- `guest_questions` table: session_id, question, answer, answered_by (AI/human), timestamp
- `guest_issues` table: session_id, issue_type, photos, ai_assessment, maintenance_job_id

**Success Metrics:**
- Usage rate: > 60% of guests interact with tablet during stay
- AI resolution rate: > 70% of questions answered without human intervention
- Issue detection rate: > 80% of maintenance issues reported via tablet (vs. phone calls)
- Guest satisfaction: > 4.5/5 with AI assistant experience

---

## 2. AI Chat Interface - RAG-Powered Q&A

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Bear Cabin AI Assistant                              [Home 🏠] [Help ❓] ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💬 CHAT                                         [Clear] [Minimize]   │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  🤖 AI Assistant                                       2:15 PM       │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ Hi! I'm your cabin assistant. Ask me anything about:           │ ║
║  │  │ • WiFi and tech                                                 │ ║
║  │  │ • Appliances and systems                                        │ ║
║  │  │ • Check-in/check-out info                                       │ ║
║  │  │ • Local recommendations                                         │ ║
║  │  │ • House rules and amenities                                     │ ║
║  │  │                                                                  │ ║
║  │  │ What can I help you with?                                       │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │                                        👤 Guest            2:16 PM  │ ║
║  │                        ┌────────────────────────────────────────┐   │ ║
║  │                        │ What's the wifi password?              │   │ ║
║  │                        └────────────────────────────────────────┘   │ ║
║  │                                                                      │ ║
║  │  🤖 AI Assistant                                       2:16 PM       │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ The WiFi network and password are:                             │ ║
║  │  │                                                                  │ ║
║  │  │ Network: BearCabin-Guest                                        │ ║
║  │  │ Password: Smoky2024!                                            │ ║
║  │  │                                                                  │ ║
║  │  │ Tips for best WiFi:                                             │ ║
║  │  │ • Router is in the living room closet                           │ ║
║  │  │ • Bedrooms may have weaker signal                               │ ║
║  │  │ • If you have issues, try restarting your device                │ ║
║  │  │                                                                  │ ║
║  │  │ Was this helpful?  [👍 Yes]  [👎 No, I need more help]        │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │                                        👤 Guest            2:17 PM  │ ║
║  │                        ┌────────────────────────────────────────┐   │ ║
║  │                        │ How do I work the hot tub?             │   │ ║
║  │                        └────────────────────────────────────────┘   │ ║
║  │                                                                      │ ║
║  │  🤖 AI Assistant                                       2:17 PM       │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ Great question! Here's how to use the hot tub:                 │ ║
║  │  │                                                                  │ ║
║  │  │ ♨️ TURNING IT ON:                                               │ ║
║  │  │ 1. Remove the cover (lift from the side handles)                │ ║
║  │  │ 2. Press the power button on the control panel (glows blue)     │ ║
║  │  │ 3. Set temp to 102°F using +/- buttons                          │ ║
║  │  │ 4. Wait 15-20 minutes to reach temperature                      │ ║
║  │  │                                                                  │ ║
║  │  │ 💦 JETS & FEATURES:                                             │ ║
║  │  │ • Press "Jets 1" for main jets                                  │ ║
║  │  │ • Press "Jets 2" for massage jets                               │ ║
║  │  │ • Press "Light" for underwater LED lights                       │ ║
║  │  │                                                                  │ ║
║  │  │ ⚠️ IMPORTANT SAFETY:                                            │ ║
║  │  │ • Max 15 minutes per session                                    │ ║
║  │  │ • No glass containers near hot tub                              │ ║
║  │  │ • Please replace cover when done (saves energy!)                │ ║
║  │  │                                                                  │ ║
║  │  │ Want me to show you a video tutorial? [📺 Show Video]          │ ║
║  │  │                                                                  │ ║
║  │  │ Was this helpful?  [👍 Yes]  [👎 No, I need more help]        │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │                                        👤 Guest            2:19 PM  │ ║
║  │                        ┌────────────────────────────────────────┐   │ ║
║  │                        │ Where can we get good BBQ nearby?      │   │ ║
║  │                        └────────────────────────────────────────┘   │ ║
║  │                                                                      │ ║
║  │  🤖 AI Assistant                                       2:19 PM       │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ You're in luck - the Smokies have amazing BBQ! Here are my     │ ║
║  │  │ top picks near Bear Cabin:                                      │ ║
║  │  │                                                                  │ ║
║  │  │ 🥩 BEST OVERALL: Bennett's Pit Bar-B-Que                       │ ║
║  │  │    • 5 min drive down the Parkway                               │ ║
║  │  │    • Famous for ribs and pulled pork                            │ ║
║  │  │    • Casual, family-friendly                                    │ ║
║  │  │    • $$  4.8/5 stars (850 reviews)                              │ ║
║  │  │    [📍 Get Directions] [📞 Call to Reserve]                    │ ║
║  │  │                                                                  │ ║
║  │  │ 🏆 LOCAL FAVORITE: Calhoun's Restaurant                        │ ║
║  │  │    • 10 min to downtown Gatlinburg                              │ ║
║  │  │    • Award-winning ribs, river views                            │ ║
║  │  │    • $$-$$$  4.6/5 stars (1,200 reviews)                        │ ║
║  │  │    [📍 Get Directions]                                         │ ║
║  │  │                                                                  │ ║
║  │  │ 🌟 HIDDEN GEM: Smoky Mountain Brewery                          │ ║
║  │  │    • 15 min drive, craft beer + BBQ                             │ ║
║  │  │    • Try the smoked brisket!                                    │ ║
║  │  │    • $$  4.5/5 stars (650 reviews)                              │ ║
║  │  │    [📍 Get Directions]                                         │ ║
║  │  │                                                                  │ ║
║  │  │ Want more options or different cuisine? Just ask!               │ ║
║  │  │                                                                  │ ║
║  │  │ Was this helpful?  [👍 Yes]  [👎 No, I need more help]        │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ Type your question here...                          [Send →]   │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ 💡 QUICK QUESTIONS:                                            │ ║
║  │  │ [Check-out time?] [Parking info?] [Where's the coffee maker?]  │ ║
║  │  │ [How to use fireplace?] [Best hiking trails?] [Grocery stores?]│ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [Home 🏠] [Report Issue 🔧] [Knowledge Base 📚] [Emergency 📞]        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **RAG-Powered Answers**: AI retrieves property-specific info from knowledge base
- **Conversational UI**: Natural chat interface (feels like texting)
- **Rich Responses**: Formatted answers with step-by-step instructions, links, maps
- **Suggested Questions**: Quick-tap buttons for common queries
- **Video Tutorials**: Embedded videos for complex instructions (hot tub, fireplace)
- **Local Recommendations**: Restaurant, attractions, hiking trails (pre-loaded database)
- **Feedback Loop**: Thumbs up/down to improve AI responses

**Integration Points:**
- RAG knowledge base (Pinecone/Weaviate for vector search)
- OpenAI/Claude API for conversational AI
- Google Maps API for directions
- Property management system (check-out times, house rules)

**Data Model Extensions:**
- `rag_knowledge_base` table: property_id, category, question, answer, embedding_vector
- `guest_chat_logs` table: session_id, message, sender (guest/AI), timestamp, helpful_rating
- `ai_feedback` table: chat_id, thumbs_up/down, follow_up_needed (boolean)

**Success Metrics:**
- AI accuracy: > 85% of answers rated "helpful" by guests
- Response time: < 2 seconds average (RAG retrieval + LLM generation)
- Containment rate: > 70% of questions resolved without escalation
- Common questions: Track top 20 questions to pre-populate quick tiles

---

## 3. AI Triages Guest Issue - Photo Analysis with Severity

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Report an Issue                                      [← Back] [Help ❓] ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ STEP 1: WHAT'S THE ISSUE?                               1 of 3       │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  Tap the area that needs attention:                                 │ ║
║  │                                                                      │ ║
║  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │ ║
║  │  │                │  │                │  │                │        │ ║
║  │  │   💧 Plumbing  │  │  ⚡ Electrical │  │  🌡️ HVAC      │        │ ║
║  │  │                │  │                │  │                │        │ ║
║  │  │  Toilet, sink, │  │  Lights, power │  │  Heat, AC,     │        │ ║
║  │  │  shower, etc.  │  │  outlets, etc. │  │  ventilation   │        │ ║
║  │  │                │  │                │  │                │        │ ║
║  │  └────────────────┘  └────────────────┘  └────────────────┘        │ ║
║  │                                                                      │ ║
║  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │ ║
║  │  │                │  │                │  │                │        │ ║
║  │  │ 🚪 Door/Window │  │  🧹 Cleaning   │  │  🛋️ Furniture  │        │ ║
║  │  │                │  │                │  │                │        │ ║
║  │  │  Locks, stuck  │  │  Mess, spills, │  │  Broken, worn, │        │ ║
║  │  │  broken, etc.  │  │  stains, etc.  │  │  damaged       │        │ ║
║  │  │                │  │                │  │                │        │ ║
║  │  └────────────────┘  └────────────────┘  └────────────────┘        │ ║
║  │                                                                      │ ║
║  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │ ║
║  │  │                │  │                │  │                │        │ ║
║  │  │ 🍳 Appliances  │  │  📺 TV/WiFi    │  │  ❓ Other      │        │ ║
║  │  │                │  │                │  │                │        │ ║
║  │  │  Stove, fridge,│  │  Remote, sound,│  │  Something     │        │ ║
║  │  │  microwave     │  │  connectivity  │  │  else          │        │ ║
║  │  │                │  │                │  │                │        │ ║
║  │  └────────────────┘  └────────────────┘  └────────────────┘        │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [Let's say guest taps "💧 Plumbing"]                                   ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ STEP 2: DESCRIBE THE ISSUE                          2 of 3           │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  Tell me more about the plumbing issue:                             │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ The toilet won't flush - handle is broken                       │ │ ║
║  │  │                                                                  │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ⦿ Can you still use it safely?  ○ Yes  ● No (it's unusable)       │ ║
║  │                                                                      │ ║
║  │  ⦿ Which bathroom?  ● Master  ○ Guest  ○ Other                     │ ║
║  │                                                                      │ ║
║  │  [NEXT: Take a Photo →]                                            │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ STEP 3: TAKE A PHOTO (OPTIONAL BUT HELPFUL!)        3 of 3           │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  A photo helps us diagnose the problem faster!                      │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │                       📷                                         │ │ ║
║  │  │                                                                  │ │ ║
║  │  │              [TAP TO TAKE PHOTO]                                │ │ ║
║  │  │                                                                  │ │ ║
║  │  │     Tips for a good photo:                                       │ │ ║
║  │  │     • Get close to the problem                                   │ │ ║
║  │  │     • Show the full area (not just close-up)                     │ │ ║
║  │  │     • Turn on lights for clarity                                 │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  [SKIP PHOTO] [SUBMIT WITHOUT PHOTO]                                │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [After photo is taken, AI analyzes it...]                               ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🤖 AI ANALYSIS                                      ⏳ Analyzing...  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  Analyzing your photo and description...                            │ ║
║  │                                                                      │ ║
║  │  🔍 Detected: Broken toilet handle (plastic lever)                  │ ║
║  │  📊 Confidence: 92%                                                 │ ║
║  │  ⚠️  Severity: MEDIUM (Bathroom is usable but inconvenient)        │ ║
║  │  ⏱️  Urgency: Fix before your next guest checks in                 │ ║
║  │                                                                      │ ║
║  │  🛠️ DIAGNOSIS:                                                      │ ║
║  │  The plastic flush handle has snapped off. This is a common issue   │ ║
║  │  and is usually an easy fix. The toilet can still be flushed        │ ║
║  │  manually by lifting the flapper inside the tank.                   │ ║
║  │                                                                      │ ║
║  │  ✅ GOOD NEWS: This is not an emergency!                           │ ║
║  │     • Toilet is still functional (see workaround below)             │ ║
║  │     • Easy repair (15-minute fix)                                   │ ║
║  │     • Low cost (~$45 parts + labor)                                 │ ║
║  │                                                                      │ ║
║  │  🎯 YOUR OPTIONS:                                                   │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │  OPTION 1: TRY A DIY FIX (5 minutes)                            │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  I can show you how to flush manually until we replace          │ │ ║
║  │  │  the handle. It's super easy!                                   │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  [📺 SHOW ME HOW TO FIX IT MYSELF]                              │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │  OPTION 2: SEND A TECHNICIAN (15 min arrival)                  │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  We can send Tom (handyman) to replace the handle.              │ │ ║
║  │  │  He's nearby and can arrive in ~15 minutes.                     │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  Estimated cost: $45 (parts + labor)                            │ │ ║
║  │  │  Estimated time: 15 minutes to fix                              │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  [🚨 SEND HELP NOW]                                             │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │  OPTION 3: NOTIFY PROPERTY MANAGER                              │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  We'll let Jane (property manager) know. She'll coordinate      │ │ ║
║  │  │  a repair time that works for you.                              │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  [📧 NOTIFY MANAGER]                                            │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  [← GO BACK] [CHANGE MY REPORT]                                    │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **3-Step Wizard**: Category → Description → Photo (simple and fast)
- **Computer Vision Analysis**: AI analyzes photo to identify issue, severity
- **Severity Scoring**: Critical (no water) > High (guest-impacting) > Medium (inconvenient) > Low (cosmetic)
- **Smart Triage**: AI recommends DIY fix, send tech, or notify manager based on severity
- **Transparent Diagnosis**: Explain what's wrong in plain language (builds trust)
- **Multiple Options**: Guest chooses their preferred resolution path

**Integration Points:**
- Computer vision API (OpenAI Vision, Google Cloud Vision)
- Maintenance Dashboard (auto-create job if "Send Help" is selected)
- SMS/Email gateway (notify property manager)
- Photo storage (cloud-hosted with thumbnails)

**Data Model Extensions:**
- `guest_issues` table: session_id, category, description, severity, ai_confidence
- `issue_photos` table: issue_id, photo_url, analysis_results (JSON), timestamp
- `ai_triage_decisions` table: issue_id, recommended_action, guest_selected_action, outcome

**Success Metrics:**
- Photo upload rate: > 70% of issues include photos (better for diagnosis)
- AI accuracy: > 80% of severity assessments match technician's final report
- DIY success rate: > 50% of "DIY suggested" issues resolved without tech dispatch
- Escalation rate: < 30% of issues require immediate tech dispatch (AI filters effectively)

---

## 4. AI Guides DIY Fix - Step-by-Step Instructions

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ DIY Fix: Manual Toilet Flush                        [← Back] [Help ❓] ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🛠️ DIY FIX GUIDE                                                    │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  🎯 GOAL: Flush the toilet manually until the handle is replaced    │ ║
║  │                                                                      │ ║
║  │  ⏱️ TIME: 1 minute (once you know how)                              │ ║
║  │  🔧 TOOLS: None needed!                                             │ ║
║  │  😊 DIFFICULTY: Very Easy                                           │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📺 VIDEO TUTORIAL                                                   │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │                     [▶️ PLAY VIDEO]                              │ │ ║
║  │  │                                                                  │ │ ║
║  │  │         Watch a quick 60-second tutorial                         │ │ ║
║  │  │         showing exactly how to do this.                          │ │ ║
║  │  │                                                                  │ │ ║
║  │  │                      🎬 1:02                                     │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  [⏸️ Pause] [⏮️ Replay] [🔊 Volume] [⛶ Fullscreen]                │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📝 STEP-BY-STEP INSTRUCTIONS                                        │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  STEP 1: REMOVE THE TANK LID                                        │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │  • Lift the ceramic lid off the toilet tank                     │ │ ║
║  │  │  • Set it on the floor carefully (it's heavy and breakable!)    │ │ ║
║  │  │  • You'll see the inside of the tank with water and parts       │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  [📷 See Example Photo]                                         │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  STEP 2: FIND THE FLAPPER                                           │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │  • Look for a rubber flap at the bottom of the tank             │ │ ║
║  │  │  • It's usually black or red, round, and about 3 inches wide    │ │ ║
║  │  │  • It has a chain attached that connects to the broken handle   │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  💡 This flap normally lifts when you push the handle,          │ │ ║
║  │  │     which drains the tank and flushes the toilet.               │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  [📷 See Example Photo - Flapper Highlighted]                   │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  STEP 3: LIFT THE FLAPPER MANUALLY                                  │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │  • Reach into the tank (the water is clean - don't worry!)      │ │ ║
║  │  │  • Lift the flapper straight up with your fingers               │ │ ║
║  │  │  • Hold it up for 2-3 seconds                                   │ │ ║
║  │  │  • The water will drain and the toilet will flush!              │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  ⚠️  Note: The tank will refill automatically after 30 seconds. │ │ ║
║  │  │      This is normal!                                             │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  [📷 See Example Photo - Lifting Flapper]                       │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  STEP 4: REPLACE THE LID (OPTIONAL)                                 │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │  • You can leave the lid off for easier access                  │ │ ║
║  │  │  • Or replace it between flushes                                │ │ ║
║  │  │  • Either way works fine!                                       │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  💡 TIP: We'll send someone to fix the handle properly          │ │ ║
║  │  │     before your next guest checks in, so this is just           │ │ ║
║  │  │     a temporary workaround.                                     │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ ❓ DID THIS WORK?                                                   │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │            ✅  YES! IT WORKED - THANKS!                         │ │ ║
║  │  │                                                                  │ │ ║
║  │  │    Tap here if you successfully flushed the toilet              │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │         ❌  NO, IT DIDN'T WORK - I NEED HELP                    │ │ ║
║  │  │                                                                  │ │ ║
║  │  │    We'll send a technician to fix it properly                   │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [If guest taps "YES! IT WORKED"]                                        ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🎉 GREAT JOB!                                                       │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  ✅ Issue resolved!                                                 │ ║
║  │                                                                      │ ║
║  │  You can use this workaround for the rest of your stay. We've       │ ║
║  │  notified the property manager to fix the handle properly before    │ ║
║  │  the next guests check in.                                          │ ║
║  │                                                                      │ ║
║  │  Thanks for your patience! Enjoy your stay! 🏔️                    │ ║
║  │                                                                      │ ║
║  │  [← BACK TO HOME] [ASK ANOTHER QUESTION]                           │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Video Tutorial**: Short, property-specific videos for common fixes
- **Step-by-Step Instructions**: Clear, numbered steps with photos
- **Success Confirmation**: Track if DIY fix worked (feedback loop for AI)
- **Escalation Path**: Easy "Send Help" button if DIY doesn't work
- **Simplified Language**: No technical jargon (e.g., "lift the flapper" not "actuate the flush valve")

**Integration Points:**
- Video hosting (YouTube, Vimeo, or self-hosted)
- Photo library (pre-captured photos of common issues)
- Maintenance Dashboard (log DIY attempts, escalations)

**Data Model Extensions:**
- `diy_guides` table: issue_type, steps (JSON array), video_url, success_rate
- `diy_attempts` table: issue_id, guide_id, successful (boolean), timestamp
- `guest_feedback` table: attempt_id, worked (yes/no), comments

**Success Metrics:**
- DIY success rate: > 50% of guided fixes work on first attempt
- Escalation rate: < 50% of DIY attempts require tech dispatch
- Video completion rate: > 70% of guests watch full video (indicates clarity)
- Guest satisfaction: > 4.5/5 with DIY guidance experience

---

## 5. AI Creates Maintenance Job - Auto-Dispatch

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Sending Help                                         [← Back] [Help ❓] ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🚨 TECHNICIAN DISPATCHED                                            │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  ✅ We're sending help right away!                                  │ ║
║  │                                                                      │ ║
║  │  👨‍🔧 Technician: Tom Lewis (Handyman)                               │ ║
║  │  📍 Current Location: Finishing nearby job (Deer Cabin)             │ ║
║  │  🚗 Estimated Arrival: 15 minutes                                   │ ║
║  │  📞 Contact: (865) 555-0303                                         │ ║
║  │                                                                      │ ║
║  │  🛠️ What he's bringing:                                             │ ║
║  │  • Replacement toilet handle (universal fit)                        │ ║
║  │  • Basic plumbing tools                                             │ ║
║  │                                                                      │ ║
║  │  ⏱️ Estimated repair time: 15 minutes                               │ ║
║  │  💰 Estimated cost: $45 (parts + labor)                             │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🗺️ LIVE TRACKING                                                    │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                  │ │ ║
║  │  │          [Map showing Tom's location and route]                 │ │ ║
║  │  │                                                                  │ │ ║
║  │  │          🚗 Tom (1.2 miles away, heading your way)              │ │ ║
║  │  │           ↓                                                      │ │ ║
║  │  │           ↓  2.3 min drive                                       │ │ ║
║  │  │           ↓                                                      │ │ ║
║  │  │          🏠 Bear Cabin (your location)                          │ │ ║
║  │  │                                                                  │ │ ║
║  │  │  Traffic: Light | ETA: 2:45 PM (updating every 30 sec)          │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  [REFRESH MAP] [CALL TOM] [CANCEL REQUEST]                          │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📋 WHAT TO EXPECT                                                   │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  1️⃣ Tom will arrive in ~15 minutes                                 │ ║
║  │     He'll knock on the door and introduce himself                   │ ║
║  │                                                                      │ ║
║  │  2️⃣ He'll assess the toilet issue                                  │ ║
║  │     Quick inspection to confirm the diagnosis                       │ ║
║  │                                                                      │ ║
║  │  3️⃣ He'll replace the handle (~15 minutes)                         │ ║
║  │     You can watch or relax - totally up to you!                     │ ║
║  │                                                                      │ ║
║  │  4️⃣ He'll test everything to make sure it works                    │ ║
║  │     Flush a few times to confirm the fix                            │ ║
║  │                                                                      │ ║
║  │  5️⃣ You're all set!                                                │ ║
║  │     Invoice sent to property manager (nothing for you to pay)       │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 💬 UPDATES                                          🔔 Notifications │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  2:30 PM - 🚨 Help requested (toilet handle issue)                  │ ║
║  │  2:31 PM - 👨‍🔧 Tom dispatched (ETA: 15 min)                         │ ║
║  │  2:32 PM - 📧 Property manager notified                             │ ║
║  │  2:35 PM - 🚗 Tom is en route (7 min away)                          │ ║
║  │  2:42 PM - 🔔 Tom is 2 min away (arriving soon!)                    │ ║
║  │  2:45 PM - ✅ Tom arrived, starting repair                          │ ║
║  │  3:00 PM - ✅ Repair complete! (Toilet handle replaced)             │ ║
║  │  3:01 PM - 📄 Invoice sent to property manager ($45)                │ ║
║  │                                                                      │ ║
║  │  🎉 All done! Thanks for your patience.                             │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ ⭐ RATE YOUR EXPERIENCE                                             │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  How was your experience with Tom?                                  │ ║
║  │                                                                      │ ║
║  │  [⭐] [⭐] [⭐] [⭐] [⭐]                                             │ ║
║  │                                                                      │ ║
║  │  Optional feedback:                                                  │ ║
║  │  ┌────────────────────────────────────────────────────────────────┐ │ ║
║  │  │ Tom was great - very professional and fixed it quickly!         │ │ ║
║  │  │                                                                  │ │ ║
║  │  └────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                      │ ║
║  │  [SUBMIT RATING] [SKIP]                                             │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [← BACK TO HOME] [ASK ANOTHER QUESTION] [REPORT ANOTHER ISSUE]         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Auto-Dispatch**: AI creates maintenance job and assigns best worker automatically
- **Live GPS Tracking**: Real-time map showing technician's location and ETA
- **Timeline of Events**: Clear communication of every step (dispatched → en route → arrived → completed)
- **What to Expect**: Set guest expectations (arrival time, repair duration, cost)
- **Post-Service Rating**: Collect feedback to improve service quality
- **Zero Guest Billing**: Property manager handles payment (guest doesn't pay directly)

**Integration Points:**
- Maintenance Dashboard (auto-creates job, assigns worker, tracks completion)
- GPS tracking (worker mobile app)
- SMS/Email gateway (notify property manager, send receipts)
- Payment system (auto-bill property manager)

**Data Model Extensions:**
- `maintenance_jobs` table: Auto-populated from guest issue report
- `worker_dispatch_log` table: job_id, worker_id, dispatched_at, arrived_at, completed_at
- `guest_ratings` table: job_id, rating, feedback, timestamp

**Success Metrics:**
- Auto-dispatch accuracy: > 95% (right worker with right skills/parts)
- Average response time: < 20 minutes (guest report → worker arrival)
- Guest satisfaction: > 4.7/5 rating for maintenance response
- Property manager notification: 100% (always loop in manager for billing)

---

## 6. Property Knowledge Base - Manuals & Past Jobs

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ Property Knowledge Base                             [← Back] [Help ❓] ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📚 KNOWLEDGE BASE                                   🔍 [Search...]   │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  Everything you need to know about Bear Cabin!                      │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🏠 GETTING STARTED                                                  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  📶 WiFi & Internet                                                 │ ║
║  │     Network: BearCabin-Guest | Password: Smoky2024!                 │ ║
║  │     Router location: Living room closet                             │ ║
║  │     [VIEW DETAILS]                                                  │ ║
║  │                                                                      │ ║
║  │  🕐 Check-in/Check-out                                              │ ║
║  │     Check-in: 4:00 PM | Check-out: 10:00 AM                         │ ║
║  │     Late checkout available (call property manager)                 │ ║
║  │     [VIEW DETAILS]                                                  │ ║
║  │                                                                      │ ║
║  │  🚗 Parking & Access                                                │ ║
║  │     Lockbox code: 4782# | Gate code: 9876                           │ ║
║  │     Parking: Driveway (2 cars max)                                  │ ║
║  │     [VIEW DETAILS]                                                  │ ║
║  │                                                                      │ ║
║  │  📋 House Rules                                                     │ ║
║  │     No smoking | No parties | Pet-friendly ($50 fee)                │ ║
║  │     [VIEW FULL RULES]                                               │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🛠️ APPLIANCES & SYSTEMS                                             │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  🌡️ Thermostat/HVAC                                                │ ║
║  │     Brand: Nest Learning Thermostat                                 │ ║
║  │     How to adjust temperature | Energy-saving tips                  │ ║
║  │     [VIEW MANUAL] [VIDEO TUTORIAL]                                  │ ║
║  │                                                                      │ ║
║  │  📺 TV & Entertainment                                              │ ║
║  │     Brand: Samsung 65" Smart TV                                     │ ║
║  │     How to use Roku | Netflix/Hulu apps | Sound system              │ ║
║  │     [VIEW MANUAL] [VIDEO TUTORIAL]                                  │ ║
║  │                                                                      │ ║
║  │  ♨️ Hot Tub                                                         │ ║
║  │     Brand: Jacuzzi J-375                                            │ ║
║  │     How to turn on | Temperature control | Safety tips              │ ║
║  │     [VIEW MANUAL] [VIDEO TUTORIAL]                                  │ ║
║  │                                                                      │ ║
║  │  🔥 Fireplace (Gas)                                                 │ ║
║  │     How to light | Safety precautions | Troubleshooting             │ ║
║  │     [VIEW MANUAL] [VIDEO TUTORIAL]                                  │ ║
║  │                                                                      │ ║
║  │  🍳 Kitchen Appliances                                              │ ║
║  │     Stove/oven | Microwave | Dishwasher | Coffee maker              │ ║
║  │     [VIEW MANUALS]                                                  │ ║
║  │                                                                      │ ║
║  │  🧺 Washer/Dryer                                                    │ ║
║  │     Location: Laundry room (2nd floor)                              │ ║
║  │     Detergent provided | How to use                                 │ ║
║  │     [VIEW MANUAL]                                                   │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🌲 LOCAL RECOMMENDATIONS                                            │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  🍽️ Restaurants (20+ recommendations)                               │ ║
║  │     BBQ | Italian | Southern | Breakfast | Fine Dining              │ ║
║  │     [VIEW ALL]                                                      │ ║
║  │                                                                      │ ║
║  │  🏞️ Things to Do (30+ activities)                                  │ ║
║  │     Great Smoky Mountains NP | Dollywood | Hiking trails            │ ║
║  │     [VIEW ALL]                                                      │ ║
║  │                                                                      │ ║
║  │  🥾 Hiking Trails (15+ trails)                                      │ ║
║  │     Easy: Laurel Falls | Moderate: Alum Cave | Hard: Mt. LeConte    │ ║
║  │     [VIEW ALL]                                                      │ ║
║  │                                                                      │ ║
║  │  🛒 Grocery Stores                                                  │ ║
║  │     Kroger (5 min) | Publix (7 min) | Walmart (10 min)              │ ║
║  │     [VIEW ALL]                                                      │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 🔧 MAINTENANCE HISTORY (Property Insights)                          │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  Recent service history at Bear Cabin:                              │ ║
║  │                                                                      │ ║
║  │  ✅ Water heater repair (Today, Oct 31) - Thermocouple replaced    │ ║
║  │  ✅ HVAC filter replacement (Oct 25) - System running perfectly     │ ║
║  │  ✅ Deck repair (Sep 15) - All boards secured and stained           │ ║
║  │                                                                      │ ║
║  │  💡 FYI: This property is well-maintained with regular inspections! │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ 📞 EMERGENCY CONTACTS                                               │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                      │ ║
║  │  🏠 Property Manager: Jane Smith                                    │ ║
║  │     Phone: (865) 555-0123 | Email: jane@mountainlodge.com           │ ║
║  │     [CALL NOW] [EMAIL]                                              │ ║
║  │                                                                      │ ║
║  │  🚨 Emergency Services:                                             │ ║
║  │     Police/Fire/Medical: 911                                        │ ║
║  │     Non-emergency police: (865) 555-1000                            │ ║
║  │                                                                      │ ║
║  │  🏥 Nearest Hospital:                                               │ ║
║  │     LeConte Medical Center (8 min drive)                            │ ║
║  │     [GET DIRECTIONS]                                                │ ║
║  │                                                                      │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  [← BACK TO HOME] [ASK AI ASSISTANT] [REPORT ISSUE]                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Key Features:**
- **Comprehensive Documentation**: All property info, appliances, local recommendations
- **Searchable**: Guests can search for specific topics
- **Video Tutorials**: Embedded videos for complex systems (hot tub, fireplace)
- **Appliance Manuals**: PDF manuals for all major appliances
- **Local Recommendations**: Curated lists of restaurants, activities, trails
- **Maintenance History**: Show recent service (builds trust in property quality)

**Integration Points:**
- RAG knowledge base (for AI chat Q&A)
- Video hosting (YouTube, Vimeo)
- PDF storage (appliance manuals)
- Google Maps API (directions to restaurants, stores)

**Data Model Extensions:**
- `property_knowledge_base` table: property_id, category, title, content, video_url, pdf_url
- `local_recommendations` table: category, name, description, distance, rating, map_url
- `appliance_manuals` table: property_id, appliance_name, brand, model, manual_pdf_url

**Success Metrics:**
- Knowledge base usage: > 50% of guests access at least once during stay
- Search effectiveness: > 80% of searches return relevant results
- Calls to property manager: Reduce by 40% (guests find answers themselves)
- Guest satisfaction: > 4.5/5 with property documentation

---

## Data Model Summary

### New Tables Required:

1. **guest_sessions**
   - id, property_id, session_start, session_end, device_id
   - total_interactions, questions_asked, issues_reported

2. **guest_questions**
   - id, session_id, question, answer, answered_by (AI/human/knowledge_base)
   - confidence_score, helpful_rating, timestamp

3. **guest_issues**
   - id, session_id, category, description, severity, ai_confidence
   - photos (JSON array), recommended_action, guest_selected_action
   - maintenance_job_id (nullable), resolved_at

4. **ai_assessments**
   - id, issue_id, diagnosis, confidence_score, severity
   - recommended_parts, diy_guide_id, estimated_cost, estimated_time

5. **diy_guides**
   - id, issue_type, title, steps (JSON array), video_url
   - difficulty_level, estimated_time, success_rate

6. **diy_attempts**
   - id, issue_id, guide_id, successful (boolean), time_spent
   - escalated_to_tech (boolean), feedback

7. **property_knowledge_base**
   - id, property_id, category, title, content, video_url, pdf_url
   - embedding_vector (for RAG), view_count, last_updated

8. **local_recommendations**
   - id, category, name, description, address, distance_from_property
   - rating, reviews_count, map_url, phone

---

## Technical Architecture Notes

### AI/ML Components:
- **RAG System**: Pinecone/Weaviate for vector search + OpenAI/Claude for responses
- **Computer Vision**: OpenAI Vision API for photo analysis
- **Severity Scoring**: ML model trained on historical maintenance data
- **Natural Language Processing**: Intent classification for routing (question vs. issue)

### Hardware Requirements:
- **Tablet**: iPad (10.2" or larger) or Android tablet (Samsung Galaxy Tab)
- **Wall Mount**: Secure, theft-resistant mount near entrance
- **Power**: Always-on charging (USB-C or Lightning cable)
- **Internet**: Property WiFi with backup cellular (4G/5G failover)

### Security & Privacy:
- **No Personal Data Collection**: No login required, anonymous sessions
- **Auto-Reset**: Session clears after 30 min inactivity (next guest sees fresh screen)
- **Photo Storage**: Guest issue photos stored securely, deleted after 90 days
- **Encryption**: All API calls encrypted (HTTPS/TLS)

### Integration Architecture:
- **Maintenance Dashboard**: Real-time job creation via WebSocket
- **SMS Gateway**: Twilio for property manager notifications
- **GPS Tracking**: Worker mobile app provides real-time location
- **Payment System**: Stripe/Square for auto-billing property manager

---

## Implementation Priority - Phase 1

**Week 1-2: Core Chat & Q&A**
1. Home screen with "Ask" and "Report Issue" buttons
2. RAG-powered AI chat for Q&A
3. Knowledge base content population (property-specific)
4. Video tutorial embedding

**Week 3-4: Issue Reporting & Triage**
5. Issue category selection wizard
6. Photo upload and computer vision analysis
7. Severity scoring and recommended actions
8. DIY guide display with step-by-step instructions

**Week 5-6: Maintenance Integration**
9. Auto-create maintenance jobs from guest issues
10. Live GPS tracking of technicians
11. Timeline updates and notifications
12. Post-service rating collection

---

## Design Principles

1. **Simplicity First**: Guests are on vacation - make it effortless
2. **Large Touch Targets**: Fingers, not cursors (minimum 60px buttons)
3. **Fast Response**: AI answers in < 2 seconds (instant gratification)
4. **Transparent Triage**: Explain what AI is doing and why
5. **DIY Encouraged, Not Required**: Always offer "Send Help" option
6. **Zero Billing for Guests**: Property manager handles all payments (reduces friction)

---

## Success Metrics

### Guest Engagement:
- Usage rate: > 60% of guests interact with tablet during stay
- Questions asked: 3-5 average per stay
- Knowledge base views: > 50% of guests access at least once

### AI Performance:
- AI resolution rate: > 70% of questions answered without human intervention
- DIY success rate: > 50% of guided fixes work on first attempt
- Triage accuracy: > 85% (AI severity matches technician assessment)

### Operational Impact:
- Calls to property manager: Reduce by 40-50%
- Maintenance response time: < 20 minutes average (report → arrival)
- Guest satisfaction: > 4.7/5 with AI assistant experience
- Issue detection rate: > 80% of maintenance issues reported via tablet (vs. phone calls)

---

**Version:** 1.0
**Last Updated:** October 31, 2025
**Owner:** Bear Cabin Guests (Target User)
