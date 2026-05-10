# Feature Specification: Custom Categories

**Feature Branch**: `006-custom-categories`
**Created**: 2025-01-10
**Status**: Draft
**Input**: User description: "complete the foundation layer by adding a feature to create and manage custom categories for both expenses and income"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Create Custom Categories (Priority: P1)

Users can create custom categories to organize their transactions, with the ability to specify whether each category is for expenses or income. Each category has a name and an icon from a curated Lucide icon list for visual distinction.

**Why this priority**: This is the foundational capability required for all other category management features. Without the ability to create categories, users cannot customize their financial tracking beyond default categories.

**Independent Test**: Can be fully tested by creating a new category through the UI and verifying it appears in the category list. Delivers immediate value by allowing users to organize transactions according to their personal needs.

**Acceptance Scenarios**:

1. **Given** a user is on the categories management page, **When** they click "Add Category" and enter a valid name, select type (expense/income), and select an icon from the Lucide icon list, **Then** the category is created and appears in the category list
2. **Given** a user attempts to create a category, **When** they leave the name field empty, **Then** the system displays an error message indicating the name is required
3. **Given** a user attempts to create a category, **When** they enter a name that already exists for the same type, **Then** the system displays an error message indicating the category name must be unique

---

### User Story 2 - Edit Custom Categories (Priority: P2)

Users can modify existing custom categories, including changing the name, type, or icon.

**Why this priority**: Users need the ability to correct mistakes or adapt their categorization scheme as their financial tracking needs evolve. This is important for long-term usability but less critical than initial creation.

**Independent Test**: Can be fully tested by editing an existing category and verifying the changes persist. Delivers value by allowing users to maintain accurate and relevant categorization over time.

**Acceptance Scenarios**:

1. **Given** a user has created custom categories, **When** they select a category and modify its name, type, or icon, **Then** the changes are saved and reflected in the category list
2. **Given** a user attempts to edit a category, **When** they change the name to one that already exists for the same type, **Then** the system displays an error message indicating the category name must be unique
3. **Given** a user edits a category, **When** they save the changes, **Then** all existing transactions using that category retain their categorization

---

### User Story 3 - Delete Custom Categories (Priority: P3)

Users can delete custom categories they no longer need. Deleted categories are hidden from the UI but retained in the system to preserve historical transaction data (soft delete).

**Why this priority**: Users need the ability to clean up unused categories to maintain a clean and manageable category list. Soft delete preserves audit trail integrity by keeping historical transaction categorization intact. This is less critical than creation and editing but important for long-term system usability.

**Independent Test**: Can be fully tested by deleting a category and verifying it no longer appears in the category list. Delivers value by allowing users to maintain an organized category structure.

**Acceptance Scenarios**:

1. **Given** a user has custom categories, **When** they select a category and delete it, **Then** the category is hidden from the category list but retained in the system with a deleted timestamp
2. **Given** a user has deleted a category with associated transactions, **When** they view historical transaction reports, **Then** those transactions still display their original category for audit trail integrity
3. **Given** a user attempts to delete a category, **When** they cancel the deletion, **Then** the category remains unchanged and visible in the category list

---

### User Story 4 - View and Filter Categories (Priority: P4)

Users can view all their custom categories in a list, with the ability to filter by type (expense or income) and search by name.

**Why this priority**: While viewing categories is essential, the filtering and search capabilities are convenience features that enhance usability but are not critical for basic functionality. Users can still work with categories even without advanced filtering.

**Independent Test**: Can be fully tested by viewing the category list and applying filters/search. Delivers value by making it easier for users to manage large numbers of categories.

**Acceptance Scenarios**:

1. **Given** a user has created multiple custom categories, **When** they navigate to the categories page, **Then** they see all their categories displayed in a list
2. **Given** a user is viewing the category list, **When** they apply a filter for "expense" categories, **Then** only expense categories are displayed
3. **Given** a user is viewing the category list, **When** they enter a search term, **Then** the list shows only categories matching the search term

### Edge Cases

- What happens when a user attempts to create a category with an extremely long name (e.g., over 100 characters)?
- How does system handle category creation when the user has reached a maximum number of categories (e.g., 100 categories)?
- How does system handle special characters or emojis in category names?
- What happens when two users attempt to edit the same category simultaneously?
- How does system handle soft-deleted categories when they appear in historical reports?
- What happens when a user attempts to restore a soft-deleted category (if restore functionality is added)?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow users to create custom categories with a unique name
- **FR-002**: System MUST allow users to specify category type as expense or income (mutually exclusive)
- **FR-003**: System MUST allow users to select an icon from a curated Lucide icon list for each category
- **FR-004**: System MUST validate that category names are not empty
- **FR-005**: System MUST validate that category names are unique within the same type
- **FR-006**: System MUST allow users to edit existing category properties (name, type, icon)
- **FR-007**: System MUST preserve transaction categorization when a category is edited
- **FR-008**: System MUST allow users to delete custom categories
- **FR-009**: System MUST implement soft delete for categories by updating the deleted_at timestamp while preserving historical transaction data
- **FR-010**: System MUST display all custom categories in a list view
- **FR-011**: System MUST allow users to filter categories by type (expense or income)
- **FR-012**: System MUST allow users to search categories by name
- **FR-013**: System MUST limit category names to a reasonable maximum length (e.g., 100 characters)
- **FR-014**: System MUST handle special characters and emojis in category names appropriately
- **FR-015**: System MUST persist all category data
- **FR-016**: System MUST use Shadcn/ui components for all interactive UI elements including forms, modals, and buttons

### Key Entities *(include if feature involves data)*

- **Category**: Represents a custom classification for transactions, with attributes including name, type (expense/income only), icon from Lucide icon list, creation timestamp, modification timestamp, and optional deletion timestamp for soft delete
- **Transaction**: Represents a financial transaction that can be associated with one or more categories (relationship to Category entity)

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can create a new custom category in under 30 seconds
- **SC-002**: Users can edit an existing category in under 20 seconds
- **SC-003**: 95% of users successfully complete category creation on their first attempt without errors
- **SC-004**: Category list loads and displays within 2 seconds for users with up to 100 categories
- **SC-005**: Category names are validated and errors are displayed within 1 second of user input

## Assumptions

- Users have basic familiarity with web applications and form interactions
- Users will primarily access the application on desktop or laptop devices with standard screen resolutions
- The application already has a user authentication system in place
- The application already has a transaction management system that categories can be linked to
- Icons are selected from a curated Lucide icon list to ensure consistent, minimalist, and premium UI appearance
- There is a reasonable maximum limit on the number of categories a user can create (e.g., 100)
- The system will use the existing data persistence layer (e.g., database) for storing category data
