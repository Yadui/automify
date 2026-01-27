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

- [ ] **Auto-save** - Periodically save workflow changes
- [ ] **Empty states** - Better illustrations for "no workflows" etc.
- [ ] **Onboarding tour** - Guide new users through creating first workflow
- [ ] **Toast notifications** - More descriptive success/error messages

### Visual Polish

- [ ] **Dark/Light mode** - Verify ModeToggle works throughout app
- [ ] **Loading animations** - Smoother transitions between pages
- [ ] **Mobile responsiveness** - Optimize for tablet/mobile views

---

## Lower Priority (Advanced Features)

### New Node Types

- [ ] **Conditional logic node** - If/else branching in workflows
- [ ] **Loop node** - Iterate over arrays/collections
- [ ] **HTTP Request node** - Make API calls to external services
- [ ] **Code/Script node** - Run custom JavaScript

### Scheduling & Triggers

- [ ] **Scheduled triggers** - Run workflows at specific times (cron)
- [ ] **Custom webhook URLs** - Unique webhook per workflow
- [ ] **Multiple triggers** - Support multiple entry points

### Data & Configuration

- [ ] **Workflow templates** - Pre-built starter workflows
- [ ] **Variables/secrets manager** - Store reusable API keys/values
- [ ] **Import/Export workflows** - JSON export for backup/sharing

---

## Technical Improvements

### Performance

- [ ] **Server-side editor data fetch** - Move from client useEffect to SSR
- [ ] **Prefetch on hover** - Preload workflow data on card hover
- [ ] **Database indexes** - Add indexes on frequently queried fields

### Reliability

- [ ] **Error boundaries** - Graceful error handling in editor
- [ ] **Retry logic** - Auto-retry failed workflow steps
- [ ] **Rate limiting** - Prevent API abuse on automations

### Developer Experience

- [ ] **Test coverage** - Unit/integration tests for core flows
- [ ] **API documentation** - OpenAPI spec for webhook endpoints
- [ ] **Logging/monitoring** - Better observability for debugging

---

## Completed ✅

- [x] User dropdown menu with logout (navbar + sidebar)
- [x] Loading skeletons for all pages
- [x] OAuth redirect back to workflow editor
- [x] Workflow creation button lock
- [x] Sticky page headers
- [x] Wait/End node consolidation
- [x] Debounced hover menus
