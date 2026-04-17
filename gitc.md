# InfraLens — Git Commit & Branch Strategy

> **Conflict-free merge sequence for 4 team members working in parallel**

---

## Branch Strategy

```
main (protected)
  ├── feat/scaffolding-backend      [STAVAN]   → Phase 1
  ├── feat/scaffolding-frontend     [YASH]     → Phase 1
  ├── feat/backend-core             [STAVAN]   → Phase 2
  ├── feat/frontend-core            [YASH]     → Phase 3
  ├── feat/agents-group-a           [STAVAN]   → Phase 4
  ├── feat/agents-group-b           [PIYUSH]   → Phase 5
  ├── feat/agents-group-c           [AMIT]     → Phase 6
  ├── feat/frontend-citizen-worker  [YASH]     → Phase 7
  ├── feat/frontend-bmc-state       [YASH]     → Phase 8
  ├── feat/frontend-nexus           [YASH]     → Phase 9
  └── feat/integration              [ALL]      → Phase 10
```

---

## Merge Sequence (Follow This Exact Order)

### Phase 1 — ALL 4 Members Start Simultaneously (Day 1 Morning)

> ⚡ Everyone starts coding from minute one. Different directories = zero conflicts.

**Step 1: Stavan creates main + backend scaffold + models.py (PRIORITY: push models FAST)**
```bash
# Stavan (first person to commit — repo already initialized)
git checkout -b feat/scaffolding-backend

# Create backend structure + models.py (PUSH WITHIN 1 HOUR)
git add backend/
git commit -m "feat: backend scaffold + models.py + data_store.py + config.py"
git checkout main
git merge feat/scaffolding-backend
git push origin main
```

**Step 2: Yash scaffolds frontend (PARALLEL with Stavan)**
```bash
# Yash
git clone <repo-url>
git checkout -b feat/scaffolding-frontend
# ... scaffold frontend/ with Vite ...
git add frontend/
git commit -m "feat: frontend scaffold — Vite + React + TS + TailwindCSS + mapcn"
git checkout main && git pull
git merge feat/scaffolding-frontend
git push origin main
```

**Step 3: Amit creates seed data (PARALLEL — pure JSON, zero dependencies)**
```bash
# Amit
git clone <repo-url>
git checkout -b feat/seed-data
# ... create seed_data/ JSON files ...
git add backend/seed_data/
git commit -m "feat: seed data — issues, workers, MCs, reports"
git checkout main && git pull
git merge feat/seed-data
git push origin main
```

**Step 4: Piyush drafts agent logic (PARALLEL — pure Python, no imports)**
```bash
# Piyush
git clone <repo-url>
git checkout -b feat/agent-drafts-b
# ... draft vira.py, guardian.py as pure Python, no model imports ...
git add backend/agents/vira.py backend/agents/guardian.py
git commit -m "feat: agent drafts — VIRA + GUARDIAN logic (pure Python)"
git checkout main && git pull
git merge feat/agent-drafts-b
git push origin main
```

> ✅ **No conflict:** Stavan→`backend/*.py`, Yash→`frontend/`, Amit→`seed_data/`, Piyush→`agents/vira.py + guardian.py`. All different files.

---

### Phase 2 — Core Complete + Agents Start (ALL 4 in parallel)

**Stavan:**
```bash
git checkout main && git pull
git checkout -b feat/backend-core

git add backend/ws_manager.py backend/middleware/ backend/config.py
git commit -m "feat(backend): WebSocket manager + SENTINEL RBAC middleware"

git add backend/main.py backend/routers/issues_router.py backend/routers/__init__.py
git commit -m "feat(backend): FastAPI app with CORS, middleware, issue CRUD router"

git checkout main && git pull
git merge feat/backend-core
git push origin main
```

**Yash (PARALLEL):**
```bash
git checkout main && git pull
git checkout -b feat/frontend-core

git add frontend/src/index.css
git commit -m "feat(frontend): design system — CSS tokens, fonts, glassmorphism, animations"

git add frontend/src/App.tsx frontend/src/context/ frontend/src/pages/LoginPage.tsx
git commit -m "feat(frontend): routing, auth context, login page"

git add frontend/src/hooks/ frontend/src/lib/
git commit -m "feat(frontend): custom hooks — useWebSocket, useApi, useRealtime"

git add frontend/src/components/shared/
git commit -m "feat(frontend): 13 shared components — badges, cards, charts, map, timeline"

git checkout main && git pull
git merge feat/frontend-core
git push origin main
```

**Piyush (PARALLEL — now has models.py from Phase 1):**
```bash
git checkout main && git pull  # Gets models.py from Stavan's Phase 1
git checkout -b feat/agents-group-b

# Add real imports to VIRA + GUARDIAN, continue building
git add backend/agents/vira.py backend/agents/guardian.py
git commit -m "feat(backend): VIRA + GUARDIAN agents with real model imports"

# Start PRESCIENT + FLEET
git add backend/agents/prescient.py backend/agents/fleet.py
git commit -m "feat(backend): PRESCIENT + FLEET agents"
```

**Amit (PARALLEL — now has models.py from Phase 1):**
```bash
git checkout main && git pull  # Gets models.py from Stavan's Phase 1
git checkout -b feat/agents-group-c

# Start LOOP + ORACLE + FIELD_COPILOT with real imports
git add backend/agents/loop.py backend/agents/oracle.py backend/agents/field_copilot.py
git commit -m "feat(backend): LOOP + ORACLE + FIELD_COPILOT agents"
```

> ✅ **No conflict:** Stavan→core files, Yash→frontend/, Piyush→his agents, Amit→his agents.

---

### Phase 4 + 5 + 6 — All Agent Groups (PARALLEL)

> ⚠️ **IMPORTANT:** Piyush and Amit must pull Phase 2 (`feat/backend-core`) before starting.

**Stavan (Phase 4):**
```bash
git checkout main && git pull
git checkout -b feat/agents-group-a

git add backend/agents/nexus.py backend/agents/cognos.py
git commit -m "feat(backend): NEXUS orchestrator + COGNOS classification engine"

git add backend/agents/sentinel.py backend/agents/commander.py
git commit -m "feat(backend): SENTINEL RBAC agent + COMMANDER assignment engine"

git add backend/routers/nexus_router.py backend/routers/cognos_router.py backend/routers/sentinel_router.py backend/routers/commander_router.py
git commit -m "feat(backend): routers for NEXUS, COGNOS, SENTINEL, COMMANDER"

# Update main.py to include new routers
git add backend/main.py
git commit -m "feat(backend): wire agent group A routers into main app"

git checkout main && git pull
git merge feat/agents-group-a
git push origin main
```

**Piyush (Phase 5) — PARALLEL with Phase 4:**
```bash
git checkout main && git pull  # Must have Phase 2 merged
git checkout -b feat/agents-group-b

git add backend/agents/vira.py
git commit -m "feat(backend): VIRA citizen voice/chat agent"

git add backend/agents/guardian.py
git commit -m "feat(backend): GUARDIAN deadline monitor + escalation agent"

git add backend/agents/prescient.py
git commit -m "feat(backend): PRESCIENT reporting + forecasting agent"

git add backend/agents/fleet.py
git commit -m "feat(backend): FLEET cross-MC pattern analytics agent"

git add backend/routers/vira_router.py backend/routers/guardian_router.py backend/routers/prescient_router.py backend/routers/fleet_router.py
git commit -m "feat(backend): routers for VIRA, GUARDIAN, PRESCIENT, FLEET"

# DO NOT modify main.py — Stavan will import your routers
git checkout main && git pull
git merge feat/agents-group-b
git push origin main
```

**Amit (Phase 6) — PARALLEL with Phase 4 & 5:**
```bash
git checkout main && git pull  # Must have Phase 2 merged
git checkout -b feat/agents-group-c

# Seed data first
git add backend/seed_data/
git commit -m "feat(backend): seed data — issues, workers, MCs, reports"

git add backend/agents/loop.py
git commit -m "feat(backend): LOOP completion verification + feedback agent"

git add backend/agents/oracle.py
git commit -m "feat(backend): ORACLE fund + resource allocation agent"

git add backend/agents/field_copilot.py
git commit -m "feat(backend): FIELD_COPILOT worker AI assistant agent"

git add backend/routers/loop_router.py backend/routers/oracle_router.py backend/routers/field_copilot_router.py backend/routers/notifications_router.py
git commit -m "feat(backend): routers for LOOP, ORACLE, FIELD_COPILOT, notifications"

# DO NOT modify main.py — Stavan will import your routers
git checkout main && git pull
git merge feat/agents-group-c
git push origin main
```

> ✅ **No conflict:** Each person touches DIFFERENT files in `backend/agents/` and `backend/routers/`.
> ⚠️ **Only Stavan modifies `main.py`** — he imports Piyush's and Amit's routers after their merges.

**Stavan: After Piyush & Amit merge (wire their routers):**
```bash
git checkout main && git pull  # Get Piyush's + Amit's agents
git checkout -b feat/wire-all-routers

# Update main.py to import all routers
git add backend/main.py
git commit -m "feat(backend): wire all 11 agent routers into main app"

git checkout main
git merge feat/wire-all-routers
git push origin main
```

---

### Phase 7 + 8 + 9 — Frontend Dashboards (Yash only, sequential)

```bash
# Phase 7
git checkout main && git pull
git checkout -b feat/frontend-citizen-worker

git add frontend/src/components/citizen/ frontend/src/pages/citizen/
git commit -m "feat(frontend): citizen dashboard — 4 pages + 6 components"

git add frontend/src/components/worker/ frontend/src/pages/worker/
git commit -m "feat(frontend): worker dashboard — 4 pages + 7 components"

git checkout main && git pull
git merge feat/frontend-citizen-worker
git push origin main
```

```bash
# Phase 8
git checkout -b feat/frontend-bmc-state

git add frontend/src/components/bmc/ frontend/src/pages/bmc/
git commit -m "feat(frontend): BMC dashboard — 4 pages + 9 components"

git add frontend/src/components/state/ frontend/src/pages/state/
git commit -m "feat(frontend): state government dashboard — 4 pages + 9 components"

git checkout main && git pull
git merge feat/frontend-bmc-state
git push origin main
```

```bash
# Phase 9
git checkout -b feat/frontend-nexus

git add frontend/src/components/nexus/ frontend/src/pages/nexus/
git commit -m "feat(frontend): NEXUS agent dashboard — 3 pages + 11 components (constellation, events, pipeline)"

git checkout main && git pull
git merge feat/frontend-nexus
git push origin main
```

> ✅ **No conflict:** Yash is the ONLY person touching `frontend/`.

---

### Phase 10 — Integration (All Members)

```bash
# Everyone pulls latest main first
git checkout main && git pull

# Each person creates their own integration branch:
# Stavan:
git checkout -b feat/integration-backend
# ... fix backend integration issues, wire WebSocket ...
git commit -m "feat: backend integration — all 11 agents operational, WebSocket verified"
git checkout main && git pull && git merge feat/integration-backend && git push origin main

# Yash (AFTER backend integration is merged):
git checkout -b feat/integration-frontend
# ... connect to real APIs, WebSocket, voice ...
git commit -m "feat: frontend integration — API connected, WebSocket live, voice enabled"
git checkout main && git pull && git merge feat/integration-frontend && git push origin main

# Piyush:
git checkout -b fix/agents-group-b-integration
# ... fix bugs in VIRA, GUARDIAN, PRESCIENT, FLEET ...
git commit -m "fix: integration fixes for VIRA, GUARDIAN, PRESCIENT, FLEET"
git checkout main && git pull && git merge fix/agents-group-b-integration && git push origin main

# Amit:
git checkout -b fix/agents-group-c-integration
# ... fix bugs in LOOP, ORACLE, FIELD_COPILOT, seed data ...
git commit -m "fix: integration fixes for LOOP, ORACLE, FIELD_COPILOT, seed data"
git checkout main && git pull && git merge fix/agents-group-c-integration && git push origin main
```

> ✅ **No conflict:** Integration branches are sequential. Backend merges first, then frontend connects.

---

## Conflict Prevention Summary

| Rule | Why |
|---|---|
| Stavan ONLY modifies `main.py` | Single point of router assembly prevents conflicts |
| Stavan ONLY modifies `models.py` and `data_store.py` | Shared data layer must have one owner |
| Piyush and Amit NEVER touch each other's agent files | Completely separate file ownership |
| Yash ONLY touches `frontend/` | No backend developer enters this directory |
| All merges go to `main` via feature branches | Clean git history, easy rollback |
| Phase 10 merges are sequential, not parallel | Backend first → frontend second → bug fixes last |
| Always `git pull` before `git merge` | Ensures latest main before merge |

---

## Emergency: If a Conflict Happens

```bash
# 1. Don't panic
# 2. Do NOT force push
# 3. Resolve locally:
git checkout main && git pull
git checkout <your-branch>
git rebase main
# Resolve conflicts in your OWN files only
# If conflict is in a shared file → call Stavan
git add .
git rebase --continue
git checkout main
git merge <your-branch>
git push origin main
```

---

*InfraLens Git Strategy — Zero Merge Conflicts Guaranteed (if rules followed)*
