# Automify - Future Features Roadmap

## High Priority (UX/Functionality)

### Workflow Management

- [x] **Workflow duplication** - Clone existing workflows to create variations
- [x] **Workflow search** - Filter/search workflows on the list page
- [x] **Run history/logs** - View past workflow executions and their results

### Editor Improvements

- [x] **Undo/Redo** - Track node changes and allow reverting
- [x] **Node copy/paste** - Duplicate nodes within editor
- [x] **Keyboard shortcuts** - Delete nodes (Del), save (Cmd+S), undo/redo (Cmd+Z)

---

## Medium Priority (Polish)

### User Experience

- [x] **Auto-save** - Periodically save workflow changes
- [x] **Empty states** - Better illustrations for "no workflows" etc.
- [x] **Onboarding tour** - Guide new users through creating first workflow
- [x] **Toast notifications** - More descriptive success/error messages

### Visual Polish

- [x] **Dark/Light mode** - Verify ModeToggle works throughout app
- [x] **Loading animations** - Smoother transitions between pages
- [x] **Mobile responsiveness** - Optimize for tablet/mobile views

---

## Lower Priority (Advanced Features)

### New Node Types

- [x] **Conditional logic node** - If/else branching in workflows
- [ ] **Loop node** - Iterate over arrays/collections
- [x] **HTTP Request node** - Make API calls to external services
- [ ] **Code/Script node** - Run custom JavaScript

### Scheduling & Triggers

- [ ] **Scheduled triggers** - Run workflows at specific times (cron)
- [ ] **Custom webhook URLs** - Unique webhook per workflow
- [ ] **Multiple triggers** - Support multiple entry points

### Data & Configuration

- [x] **Workflow templates** - Pre-built starter workflows (Email, Slack, API, Drive)
- [ ] **Variables/secrets manager** - Store reusable API keys/values
- [x] **Import/Export workflows** - JSON export for backup/sharing

---

## Technical Improvements

### Performance

- [x] **Server-side editor data fetch** - Move from client useEffect to SSR
- [x] **Prefetch on hover** - Preload workflow data on card hover
- [x] **Progressive Page Loading** - Shell-first rendering with Suspense & Skeletons
- [ ] **Database indexes** - Add indexes on frequently queried fields

### Reliability

- [x] **Error boundaries** - Graceful error handling in editor
- [x] **Retry logic** - Auto-retry failed workflow steps (3 attempts with exponential backoff)
- [x] **Rate limiting** - Prevent API abuse on automations (sliding window, 30 runs/min/user)

### Developer Experience

- [x] **Test coverage** - Unit/integration tests for core flows (19 passing tests)
- [x] **API documentation** - OpenAPI spec for webhook endpoints (`docs/openapi.yaml`)
- [x] **Logging/monitoring** - Structured logging with levels and context tracking

---

## Completed ✅

- [x] User dropdown menu with logout (navbar + sidebar)
- [x] Loading skeletons for all pages
- [x] OAuth redirect back to workflow editor
- [x] Workflow creation button lock
- [x] Sticky page headers
- [x] Wait/End node consolidation
- [x] Debounced hover menus
- [x] Trigger node as workflow starter (enforces single trigger per workflow)
- [x] Wait node execution (proper duration and until-time waiting)
- [x] Credit deduction on workflow runs (not on publish)
- [x] Billing dashboard cleanup (removed CreditTracker, added tier icons)
- [x] Starter node filtering (empty canvas shows only trigger nodes)
