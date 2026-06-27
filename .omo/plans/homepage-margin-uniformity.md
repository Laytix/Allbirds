# Homepage Section Margin Uniformity

## TL;DR

> **Quick Summary**: Fix featured-collections double-margin by adding the `full-width` CSS class, then document the pattern in AGENTS.md so all future homepage sections stay uniform.
>
> **Deliverables**:
> - `sections/featured-collections.liquid` — line 1: add `full-width` class
> - `AGENTS.md` — new "Section margin uniformity" section documenting the pattern
>
> **Estimated Effort**: Quick
> **Parallel Execution**: YES — 2 tasks, same wave
> **Critical Path**: Task 1 → Task 2 (documentation references the fix)

---

## Context

### Original Request
User wants the featured collections section margin to align with the hero section on the homepage. Also wants all future homepage sections to follow the same margin pattern for uniformity.

### Interview Summary
**Root Cause**: The Horizon theme (`assets/critical.css`) wraps every `.shopify-section` in a 3-column CSS Grid:
```
[--page-margin] [content] [--page-margin]
```
- Default children are constrained to column 2 (content), inheriting `--page-margin` on both sides.
- Children with the `full-width` class span `grid-column: 1 / -1` (edge-to-edge), bypassing the grid margins.

**Hero slider** already has `class="hero-slider full-width"`. Its own CSS (`margin: 0.75rem; width: calc(100% - 1.5rem)`) creates the 0.75rem inset.

**Featured collections** lacks `full-width`, so it gets the grid's `--page-margin` PLUS its own `margin: 0.75rem` → double margins, making it visually narrower than the hero.

**Fix**: Add `full-width` class to the featured-collections wrapper. Document the pattern in AGENTS.md.

### Research Findings
- `assets/critical.css:94-117` — `.shopify-section` grid layout and `.full-width` utility
- `sections/hero-slider.liquid:2` — existing `full-width` usage pattern
- `sections/featured-collections.liquid:69-76` — current CSS already has `margin: 0.75rem; width: calc(100% - 1.5rem)`

---

## Work Objectives

### Core Objective
Align featured-collections section margin with hero section by adding `full-width` class, and document the pattern for future sections.

### Concrete Deliverables
- `sections/featured-collections.liquid` line 1: `<div class="featured-collections">` → `<div class="featured-collections full-width">`
- `AGENTS.md`: new section documenting the section margin uniformity pattern

### Definition of Done
- [ ] Featured collections visually aligns with hero slider (same 0.75rem inset)
- [ ] AGENTS.md contains documented pattern for future sections
- [ ] `npm run build` succeeds
- [ ] No layout regressions on mobile/tablet

### Must Have
- Featured collections margin matches hero slider
- Pattern documented for future sections
- No changes to hero slider or other existing sections

### Must NOT Have (Guardrails)
- Do NOT edit `assets/critical.css` (Horizon base theme file)
- Do NOT edit `assets/application.css` (Tailwind-generated)
- Do NOT change any margin/padding values in existing CSS
- Do NOT create new CSS files
- Do NOT modify sections other than `featured-collections.liquid`
- Do NOT delete or reorder elements in `featured-collections.liquid`

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Framework**: N/A

### QA Policy
Every task includes agent-executed QA scenarios using visual build verification.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Add full-width class to featured-collections [quick]
└── Task 2: Document section margin pattern in AGENTS.md [writing]

Wave FINAL (After ALL tasks):
├── Task F1: Plan Compliance Audit (oracle)
├── Task F2: Build Verification (unspecified-high)
├── Task F3: Visual QA Check (unspecified-high)
└── Task F4: Scope Fidelity Check (deep)
```

### Dependency Matrix
- **1**: — 2, — (no dependencies)
- **2**: — —, — (no dependencies — but references fix from 1)

### Agent Dispatch Summary
- **Wave 1**: 2 — T1 → `quick`, T2 → `writing`
- **FINAL**: 4 — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Add `full-width` class to featured-collections wrapper

  **What to do**:
  - In `sections/featured-collections.liquid`, line 1, change:
    ```html
    <div class="featured-collections">
    ```
    to:
    ```html
    <div class="featured-collections full-width">
    ```
  - No other changes to the file

  **Must NOT do**:
  - Do not add or remove any other classes
  - Do not add Tailwind margin/padding classes
  - Do not change the CSS block or schema

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-line change in a known file
  - **Skills**: [`shopify-liquid-themes`]
    - `shopify-liquid-themes`: Theme file conventions and schema awareness

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `assets/critical.css:94-117` — `.shopify-section` grid layout with `.full-width` utility (pattern to understand why this works)
  - `sections/hero-slider.liquid:2` — existing `full-width` usage pattern: `<div class="hero-slider full-width" ...>`
  - `sections/featured-collections.liquid:69-76` — CSS block that already has `margin: 0.75rem; width: calc(100% - 1.5rem)` (will now match hero)

  **Acceptance Criteria**:
  - [ ] `sections/featured-collections.liquid` line 1 reads `<div class="featured-collections full-width">`
  - [ ] File has no other changes (verify with `git diff` — only line 1 changed)

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Build compiles without error after change
    Tool: Bash
    Preconditions: Working directory is project root, node_modules installed
    Steps:
      1. Run: npm run build
      2. Check exit code is 0
    Expected Result: Build completes successfully (exit code 0)
    Failure Indicators: Non-zero exit code, CSS compilation error
    Evidence: .omo/evidence/task-1-build-success.txt

  Scenario: Featured collections div has full-width class
    Tool: Bash (grep)
    Preconditions: Task 1 implemented
    Steps:
      1. Run: grep -n "class=\"featured-collections" sections/featured-collections.liquid
      2. Verify the output contains "full-width"
    Expected Result: Output shows `class="featured-collections full-width"` on line 1
    Failure Indicators: Output missing "full-width" string
    Evidence: .omo/evidence/task-1-class-check.txt
  ```

  **Commit**: YES
  - Message: `fix(featured-collections): add full-width class to align margin with hero`
  - Files: `sections/featured-collections.liquid`

- [ ] 2. Document section margin uniformity pattern in AGENTS.md

  **What to do**:
  - Insert a new section in `AGENTS.md` after the "Upgradeability rule" section (after line 77, before ".shopifyignore" section)
  - Section content:

    ```markdown
    ## Section margin uniformity

    All homepage sections MUST use the **0.75rem card-inset** pattern to stay visually aligned:

    1. **Always add `full-width` to the section's root element** — this bypasses the `.shopify-section` CSS Grid's default `--page-margin` column constraint and spans the viewport edge-to-edge. Without it, sections get double margins (grid margin + own margin).
    2. **Use these CSS values** in the section's `{% stylesheet %}` block:
       ```css
       .your-section {
         margin: 0.75rem;
         width: calc(100% - 1.5rem);
       }
       ```
    3. **Reference sections that follow this pattern**:
       - `sections/hero-slider.liquid` — `class="hero-slider full-width"`
       - `sections/featured-collections.liquid` — `class="featured-collections full-width"`

    The grid layout is defined in `assets/critical.css:94-117`. Read it before creating new sections.
    ```

  **Must NOT do**:
  - Do not edit any other section of AGENTS.md
  - Do not add Tailwind classes to the documentation (the pattern uses raw CSS)
  - Do not remove existing content

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation addition in markdown format
  - **Skills**: None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: None
  - **Blocked By**: None (but references the fix from Task 1)

  **References**:
  - `AGENTS.md:75-78` — "Upgradeability rule" section (insert after this, before `.shopifyignore`)
  - `assets/critical.css:94-117` — Grid layout pattern to reference in docs
  - `sections/hero-slider.liquid:2` — Example of correct `full-width` usage
  - `sections/featured-collections.liquid:1` — Will be fixed to match the documented pattern

  **Acceptance Criteria**:
  - [ ] AGENTS.md contains new "Section margin uniformity" section between Upgradeability rule and .shopifyignore
  - [ ] Section includes the `full-width` requirement, CSS pattern, and reference examples
  - [ ] Section includes pointer to `assets/critical.css` for the grid layout definition

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: AGENTS.md has the new section in correct location
    Tool: Bash (grep)
    Preconditions: Task 2 implemented
    Steps:
      1. Run: grep -n "Section margin uniformity" AGENTS.md
      2. Verify output shows a line number between 78 and 82
      3. Run: grep -A 15 "Section margin uniformity" AGENTS.md
      4. Verify output contains "full-width", "0.75rem", "calc(100% - 1.5rem)"
      5. Verify output contains "hero-slider" and "featured-collections" as references
    Expected Result: Section exists at correct position with all required content
    Failure Indicators: Section missing, wrong position, missing key terms
    Evidence: .omo/evidence/task-2-section-check.txt
  ```

  **Commit**: YES (squash with Task 1)
  - Message: `docs(agents): document section margin uniformity pattern`
  - Files: `AGENTS.md`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify: featured-collections.liquid has `full-width` class (grep), AGENTS.md has new section (grep). Confirm no changes to `assets/critical.css`, `application.css`, or other sections. Check `npm run build` output exists.
  Output: `Must Have [2/2] | Must NOT Have [4/4] | Tasks [2/2] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build`. Review both changed files: featured-collections.liquid has exactly one change (line 1, full-width added), AGENTS.md has exactly one new section. No unintended changes. Check diff is clean — only the two intended modifications.
  Output: `Build [PASS/FAIL] | Diff [CLEAN/N issues] | Files [2 changed/0 unintended] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Verify the fix is correct by reading the files: featured-collections.liquid line 1 should read `<div class="featured-collections full-width">`, AGENTS.md should contain the new section with all required keywords. Cross-reference: featured-collections CSS block still has `margin: 0.75rem; width: calc(100% - 1.5rem)`.
  Output: `Checks [N/N pass] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: verify exactly what was asked was done. Task 1: only line 1 of featured-collections.liquid changed. Task 2: only AGENTS.md changed (one new section added). No contamination: no other files touched. No scope creep: no CSS values changed, no new files created.
  Output: `Tasks [2/2 compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `fix(featured-collections): add full-width class to align margin with hero` — `sections/featured-collections.liquid`, `AGENTS.md`

---

## Success Criteria

### Verification Commands
```bash
# Task 1 verification
grep "class=\"featured-collections" sections/featured-collections.liquid
# Expected: class="featured-collections full-width"

# Task 2 verification
grep -A 15 "Section margin uniformity" AGENTS.md
# Expected: full pattern with full-width, 0.75rem, calc, hero-slider, featured-collections

# Build check
npm run build
# Expected: exit code 0
```

### Final Checklist
- [ ] Featured collections has `full-width` class
- [ ] AGENTS.md contains margin uniformity documentation
- [ ] Build succeeds (`npm run build` exits 0)
- [ ] No other files modified
- [ ] No changes to Horizon base theme files
