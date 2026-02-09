# AI Collaboration Challenge - Bulk Operations Feature

## Feature Request
Add a bulk operations feature that allows users to select multiple products and perform batch actions (price updates, category changes, deletion) with confirmation dialogs and undo functionality.

## 1. AI Tool Selection

**Which AI tool would you choose and why?**
    ClaudeCode(Claude Opus 4.6)

## 2. Comprehensive Prompt


**Write your complete prompt including context about the codebase architecture and any constraints:**


### Core functional requirements

Implement a **bulk operations** capability on the product listing screen with the following behavior:

- **Product selection**
  - Allow users to **select multiple products** using row-level checkboxes (or the prevailing selection UI pattern).
  - Provide a **“Select All on page”** checkbox and, if applicable, respect any existing pagination or filtering.
  - Maintain a **clear visual indication** of how many items are selected.
  - Ensure selection state is **robust across re-renders, filtering, and pagination** (per existing UX expectations).

- **Bulk actions**
  - When one or more products are selected, show a **bulk actions bar / controls** in the most appropriate place according to current UI conventions (e.g. toolbar above table, sticky footer, existing actions menu).
  - Support at least these batch operations:
    - **Bulk price update**:
      - Allow the user to specify **how the price should be changed**:
        - Set a new absolute price.
        - Increase/decrease by a fixed amount.
        - Increase/decrease by a percentage (if consistent with business rules; otherwise, follow existing patterns).
      - Validate user input (non-negative values, sensible percentage ranges, currency/precision rules).
      - Show a **summary** of what will happen (e.g. “Update prices for 15 selected products”).
    - **Bulk category change**:
      - Allow assigning/changing the **category/categories** for all selected products in one action.
      - Respect existing category model constraints (single vs multiple categories, required fields).
      - Use the **existing category picker** or category input component to keep UX consistent.
    - **Bulk deletion**:
      - Support deletion for all selected products.
      - If the app uses **soft delete**, follow that pattern (e.g. `isDeleted` flag, `deletedAt` timestamp).
      - If it uses **hard delete**, call the appropriate delete endpoint(s), but design the undo mechanism accordingly (e.g. only local UI undo if backend can’t restore).

- **API / backend integration**
  - Prefer to use or add **dedicated bulk endpoints** (e.g. `/products/bulk-update`, `/products/bulk-delete`) if they don’t already exist and if adding them matches existing backend architecture.
  - If the project pattern is to loop over individual endpoints instead of true bulk APIs, follow that pattern while being mindful of **performance and error aggregation**.
  - Implement appropriate **request payload structures** (e.g. array of product IDs plus operation payload such as new price or category ID).
  - Handle **partial failures** gracefully:
    - If some products fail to update while others succeed, communicate this clearly to the user (e.g. “12 products updated, 3 failed” with error detail where appropriate).
    - Ensure UI state is consistent with the final backend state.

### Confirmation dialogs and UX

For each bulk operation, implement **confirmation dialogs** that adhere to existing dialog components and styling:

- **Before executing a bulk operation**, show a confirmation modal that includes:
  - The **type of action** (e.g. “Bulk price update”, “Bulk category change”, “Bulk delete”).
  - The **number of affected products**.
  - A **concise description** of the change (e.g. “Increase price by 10% for 25 selected products”).
  - Any **irreversible or risky consequences**, especially for deletion.
- Provide **clear primary/secondary actions**:
  - Primary CTA (e.g. “Apply changes”, “Delete 25 products”).
  - Secondary CTA to cancel/close.
- Ensure dialogs are **accessible** (focus management, ARIA, keyboard navigation) in line with existing accessibility patterns.

### Undo functionality

Implement **undo** behavior for all bulk operations, following existing application patterns. If there is already an undo/rollback pattern, **reuse it**. If not, implement a reasonable pattern such as:

- After a successful bulk operation, show a **toast/snackbar/banner** that:
  - Summarizes the change (e.g. “Price updated for 25 products”).
  - Includes an **“Undo” action**.
  - Persists for a sensible duration, configurable or consistent with existing notifications.

- **Undo semantics**:
  - For **price updates**:
    - Store the **previous values** (for each affected product) in memory (and/or a short-lived backend record, depending on existing architecture) so that clicking Undo will restore original prices.
  - For **category changes**:
    - Similarly store the **previous categories** for each affected product and restore on undo.
  - For **deletion**:
    - If the app supports **soft delete**, implement undo by clearing the deletion flags / restoring records.
    - If only **hard delete** exists and real restoration is impossible, then:
      - Prefer to change the backend to support **soft delete + restore** if this aligns with project conventions.
      - If changing backend semantics is not acceptable, implement undo as a **local UI-only undo** that is clearly labeled (and avoid misleading the user) or, if necessary, explicitly comment why true undo isn’t supported and keep the UX honest.

- Carefully manage **race conditions and stale state**:
  - If the user navigates away, filters, or refreshes between action and undo, ensure behavior is predictable and doesn’t corrupt state.
  - If undo is no longer possible (e.g. due to timeouts), the UI should reflect that (e.g. no undo button, or disabled with tooltip).

### Error handling, loading states, and UX polish

- Show **loading states** (spinners, disabled buttons, or progress indicators) while bulk actions are being processed.
- Ensure **bulk actions are idempotent** on the client (avoid double-submission if the user double-clicks).
- Implement **robust error handling**:
  - Show clear error messages via existing notification/toast patterns.
  - For partial errors, indicate which products failed if feasible.
- Ensure the feature respects:
  - **Existing permissions/roles** (e.g. only admins can bulk delete).
  - **Localization/i18n** if used in the project (add new strings to translation files).
  - **Responsive design** and mobile/tablet layouts if the product listing is responsive.

### Code organization and quality

- Conform strictly to:
  - Existing **file/folder structure**.
  - **Componentization patterns** (e.g. separate `BulkActionsBar`, `BulkPriceDialog`, `BulkCategoryDialog`, `BulkDeleteDialog` components if appropriate).
  - Existing **hooks/state management** patterns for selection and server interaction.
- Add or update **types/interfaces** (e.g. TypeScript types for bulk payloads and responses).
- Maintain or improve **test coverage**:
  - Add **unit tests** for new helpers, reducers, hooks, and components related to bulk operations.
  - Add **integration tests** for the product listing with bulk select + bulk actions.
  - Add or extend **e2e tests** (if present) to cover a realistic user flow:
    - Select multiple products.
    - Perform a bulk price update.
    - Confirm the change in the UI.
    - Trigger undo and verify restoration.

### Documentation and discoverability

- Update or create any relevant **README / feature docs / in-app help** so that future developers and users understand:
  - How to use the bulk operations UI.
  - Any limitations (e.g. max number of items per bulk operation, role restrictions).
  - How undo works and what guarantees it provides.

### Implementation expectations

- **Do not ask the user for more clarification** unless something is impossible to infer from the codebase (e.g. truly missing API endpoints or ambiguous business rules). In such rare cases:
  - Make a **reasonable assumption**, document it clearly in comments and in your final explanation, and proceed.
- Use the **Cursor tools** (search, read, patch, lints, tests) to:
  - Discover relevant existing code.
  - Make minimal but well-structured changes.
  - Run linters/tests where applicable and fix any issues you introduce.

At the end, provide a **concise summary** of:
- Which files you touched and what responsibilities they now have.
- How to trigger and use the bulk operations feature in the UI.
- How undo works and any important limitations or assumptions you made.


## 3. Collaboration Approach

**How would you iterate and collaborate with the AI tool to implement this feature?**

When implementing this feature, follow this collaboration approach:

1. **Initial exploration and design**
   - Start by exploring the project structure to locate **product listing UI**, **product models**, **API clients/endpoints**, and existing **dialog/notification/undo** patterns.
   - Propose a **short, concrete implementation plan** (e.g. new components/hooks, backend changes, test updates) and ensure it clearly maps to the functional requirements above.

2. **Incremental implementation**
   - Implement the feature in **small, reviewable steps**:
     - First, add the **selection mechanism** and basic bulk actions bar.
     - Next, implement each **bulk operation** (price, category, delete) with its dialog and backend integration.
     - Then, add **undo behavior** and notification UX.
   - After each logical batch of changes, **run lints/tests** (where supported) and adjust as needed.

3. **Validation and refinement**
   - Ensure the final behavior matches all requirements:
     - Multiple selection works across typical user flows.
     - Confirmations appear as expected.
     - Undo correctly restores state.
     - Errors and partial failures are clearly surfaced.
   - If any requirement cannot be met exactly due to architectural constraints, **document the limitation and the trade-offs** you chose in code comments and in the final summary.

4. **Final pass**
   - Refine naming, factor out any duplicated logic, and ensure **code readability**.
   - Confirm that the feature is **discoverable and intuitive** in the UI without additional instructions.
   - Provide a final, **brief summary** describing the approach, important components, and how to maintain or extend the bulk operations feature in the future.