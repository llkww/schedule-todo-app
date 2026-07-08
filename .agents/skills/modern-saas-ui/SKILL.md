---
name: modern-saas-ui
description: Use when building or reviewing frontend UI for a modern SaaS-style web application. Apply this skill to create polished, minimal, responsive, accessible, production-quality React interfaces.
---

# Modern SaaS UI Skill

Use this skill whenever building, editing, or reviewing frontend UI.

The goal is to create a polished modern SaaS productivity interface, not a rough demo page.

The final UI should be suitable for course project demonstration screenshots or portfolio screenshots.

---

## 1. Visual direction

Create an interface in the style of a modern SaaS productivity tool.

Reference style direction:

- Linear
- Notion
- Todoist
- Cron Calendar
- clean admin dashboards
- modern task management tools

Use these design keywords:

- minimal
- premium
- calm
- professional
- spacious
- consistent
- clean
- efficient
- readable
- low-noise

Avoid:

- browser-default styling
- Bootstrap-default look
- cheap gradients
- noisy colors
- large heavy shadows
- inconsistent cards
- random spacing
- overuse of icons
- overly playful visuals
- cluttered layouts

The application should look like a real productivity tool.

---

## 2. Design system first

Before building full pages, create a small but consistent design system.

Use one of these approaches:

- CSS variables in a central tokens file
- Tailwind theme configuration
- CSS Modules with shared tokens
- a combination of the above

Define and reuse:

- colors
- typography
- spacing
- border radius
- shadows
- transitions
- z-index
- layout widths
- responsive breakpoints

Do not hard-code random colors, margins, shadows, or font sizes in every component.

Recommended files:

```text
client/src/styles/tokens.css
client/src/styles/global.css
client/src/styles/components.css
```

Or with Tailwind:

```text
tailwind.config.ts
client/src/styles/global.css
client/src/lib/cn.ts
```

---

## 3. Color system

Use a restrained, professional color palette.

Recommended base colors:

- app background: near-white or light gray
- card background: white or slightly translucent white
- main text: dark slate / dark gray
- secondary text: neutral gray
- border: light gray
- primary: indigo / blue / blue-violet
- success: muted green
- warning: muted amber / orange
- danger: muted red

Avoid:

- saturated pure red, green, blue everywhere
- rainbow tags without harmony
- strong gradients as default page background
- text with insufficient contrast
- large colored blocks without purpose

Priority colors:

- important + urgent: muted red
- important + not urgent: muted indigo / blue
- not important + urgent: muted amber / orange
- not important + not urgent: muted gray / green

Use subtle backgrounds and borders for priority states instead of aggressive full-color blocks.

---

## 4. Typography

Use a modern system font stack.

Recommended font family:

```css
Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Recommended scale:

- page title: 24px-32px
- section title: 18px-22px
- body: 14px-16px
- helper text: 12px-14px
- line-height: around 1.5

Rules:

- Use font weight intentionally.
- Page titles can use 600 or 700.
- Body text should usually use 400 or 500.
- Do not make everything bold.
- Do not use tiny unreadable text.
- Keep hierarchy obvious.

---

## 5. Layout

Use a professional SaaS layout.

Desktop:

- Sidebar + Header + Content layout
- fixed or sticky sidebar when appropriate
- content area with controlled max width
- consistent page padding
- cards and sections for grouping
- dashboard grid
- clear page header with title, subtitle, and actions

Mobile:

- collapse sidebar to drawer or top menu
- convert tables to cards
- use single-column forms
- prevent horizontal overflow
- ensure touch-friendly buttons

Spacing:

- use an 8px spacing system
- page padding: 24px or more on desktop
- card padding: 16px-24px
- card gap: 16px-24px
- form field gap: 12px-16px
- avoid cramped layouts

---

## 6. Core components

Build reusable components before building many pages.

Recommended components:

- Button
- Input
- Textarea
- Select
- Checkbox
- RadioCard or SegmentedControl
- Badge
- TagPill
- Card
- Modal
- ConfirmDialog
- Toast
- EmptyState
- LoadingSpinner
- Skeleton
- PageHeader
- Sidebar
- Topbar
- StatCard
- TaskCard
- FilterBar
- CalendarCell
- PriorityBadge
- StatusBadge

Component requirements:

- consistent border radius
- consistent spacing
- consistent typography
- consistent hover states
- consistent focus-visible states
- consistent disabled states
- clear error states
- clear loading states

Do not repeat component styling separately on every page.

---

## 7. Buttons

Button variants should include:

- primary
- secondary
- ghost
- danger

Button sizes should include:

- small
- medium
- large

Button requirements:

- visible hover state
- visible active state
- visible focus-visible state
- disabled state
- loading state
- consistent height
- icon alignment when icons are used

Avoid:

- default HTML button appearance
- inconsistent colors
- harsh shadows
- oversized icons
- unclear disabled states

---

## 8. Forms

Form design requirements:

- labels associated with inputs
- clear required fields
- helper text when useful
- validation messages near fields
- focus-visible ring
- comfortable input height
- consistent spacing
- disabled and error states
- password strength indicator on registration
- clean date/time inputs

Do not rely only on placeholder text as labels.

Do not show vague error messages.

Do not create dense, cramped forms.

---

## 9. Cards and lists

Task cards should show:

- title
- description summary if available
- date/time
- status
- importance
- urgency
- tags
- completion state
- overdue state

Visual treatment:

- light border
- subtle shadow or no shadow
- clean hover state
- consistent padding
- clear hierarchy

Completed tasks:

- lower opacity or muted text
- optional strikethrough
- still readable

Overdue tasks:

- subtle danger badge or muted red border/background
- do not make the whole UI visually aggressive

---

## 10. Page requirements

### Login and register pages

Create polished centered auth pages.

Include:

- app name
- short product description
- clean auth card
- clear input labels
- password strength indicator on register
- error and loading states
- link between login and register

Do not produce plain unstyled forms.

### Dashboard

Create a productivity dashboard.

Include:

- welcome header
- quick create button
- stat cards
- today tasks
- upcoming tasks
- recently created tasks
- priority matrix preview
- tag statistics

Use a balanced grid layout with good spacing.

### Schedule list

Include:

- PageHeader
- create button
- FilterBar
- search input
- status filter
- importance filter
- urgency filter
- tag filter
- date range filter
- sort control
- task cards or responsive table
- pagination
- loading state
- empty state
- error state

### Schedule detail

Use cards and sections.

Show:

- title
- description
- time fields
- status
- importance
- urgency
- tags
- created/updated time
- actions

Actions:

- edit
- complete / uncomplete
- delete with ConfirmDialog

### Schedule create/edit

Use a clean form layout.

Fields:

- title
- description
- start time
- end time
- due time
- importance
- urgency
- status
- tags

Importance and urgency can be:

- select
- segmented control
- radio cards

Tags should be shown as pills.

### Tag management

Show tags as cards or clean list rows.

Each tag should show:

- color dot
- tag name
- task count
- edit action
- delete action

Use ConfirmDialog before delete.

Use EmptyState when no tags exist.

### Priority matrix

Use a 2x2 grid on desktop.

Quadrants:

- Important + Urgent
- Important + Not Urgent
- Not Important + Urgent
- Not Important + Not Urgent

Each quadrant should show:

- title
- short description
- task count
- task cards

On mobile, stack quadrants in one column.

### Calendar view

Use a clean monthly calendar grid.

Show:

- current month
- previous/next controls
- today highlight
- selected date highlight
- task count or dots on days with tasks
- selected day task list
- quick create for selected date

Prevent mobile overflow.

### Settings

Use sectioned cards:

- profile information
- password update
- security note
- logout

### 404 page

Create a minimal but polished 404 page.

Include:

- title
- short message
- button back to dashboard/home

Do not show plain text only.

---

## 11. Interaction states

Every interactive element should support:

- hover
- active
- focus-visible
- disabled
- loading where applicable
- error where applicable
- success feedback where applicable

Every data page should support:

- loading
- empty
- error
- success

Loading should use Skeleton or Spinner, not only text.

Empty states should include:

- simple icon
- clear message
- suggested action

Errors should include:

- clear message
- retry action when reasonable

---

## 12. Motion

Use subtle motion only.

Allowed:

- hover shadow transition
- button press feedback
- modal fade/scale
- toast slide/fade
- lightweight page fade
- skeleton loading

Recommended timing:

- 150ms-250ms
- ease-out or ease-in-out

Respect:

```css
prefers-reduced-motion
```

Avoid:

- animated backgrounds
- excessive bouncing
- distracting transitions
- performance-heavy effects

---

## 13. Accessibility

Implement basic accessibility.

Requirements:

- semantic HTML
- correct label/input association
- aria-label for icon-only buttons
- clear focus-visible style
- keyboard navigability
- readable contrast
- do not rely only on color
- modal focus management where practical
- touch targets around 40px-44px

Use text labels or icons plus text for important statuses.

---

## 14. Icons

Use one consistent icon library.

Recommended:

- lucide-react
- heroicons

Rules:

- do not mix multiple icon styles
- use consistent icon sizes
- use icons to support meaning, not decorate everything
- use aria-hidden for decorative icons
- use aria-label for icon-only buttons

---

## 15. Dark mode

Dark mode is optional, but if implemented it must be polished.

Requirements:

- not simple color inversion
- no pure black background unless intentional
- readable text
- visible borders
- tags remain readable
- priority colors remain balanced
- persisted theme preference

If time is limited, prioritize a polished light theme first.

---

## 16. UI self-review

Before final delivery, review the UI and report:

1. whether all pages share a consistent style
2. whether any browser-default styling remains
3. whether there is overflow or layout breakage
4. whether desktop and mobile layouts work
5. whether loading, empty, and error states exist
6. whether forms show useful validation
7. whether priority and overdue tasks are visually clear
8. whether the matrix page is intuitive
9. whether the calendar page is readable
10. whether tag colors are harmonious
11. whether accessibility basics are present
12. whether placeholder text has been replaced

Do not claim the UI is polished unless these items were checked.