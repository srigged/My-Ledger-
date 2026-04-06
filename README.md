# My Ledger: Financial Management Dashboard

A high-precision, role-based financial management system with a dark editorial aesthetic.

## Aesthetic Direction
- **Editorial Design:** Bloomberg-inspired "data-journalism" look.
- **Typography:** DM Serif Display (Numerals/Headers) paired with IBM Plex Mono (Data/Labels).
- **Color Palette:** Deep Charcoal (#0E0F11), Off-White (#F0EDE6), and Electric Amber (#F5A623).
- **Precision:** Grid-based layout with 1px hairline borders and SVG noise textures.

## Features
- **Role-Based Access Control:**
  - **Admin:** Full CRUD on records and user management.
  - **Analyst:** View records, edit own entries, access deep insights.
  - **Viewer:** Read-only access to dashboard and records.
- **Real-time Analytics:** Dashboard summaries and trend charts.
- **Interactive Records:** Paginated table with inline expansion and slide-in drawers.
- **User Management:** Admin-only portal for inviting and managing personnel.

## Technical Details
- **Framework:** React 19 + Vite.
- **Routing:** React Router v6 with Protected Routes.
- **State Management:** React Context for Auth/Role state.
- **Charts:** Recharts for trend and allocation analysis.
- **Motion:** motion/react for staggered animations and crisp transitions.

## Running the Project
1. `npm install`
2. `npm run dev`

## API Mode
The application currently uses **Mock Data** by default (defined in `src/api/mockData.ts`). 
To switch to the live backend, set `USE_MOCK = false` in `src/api/index.ts`.

## Design Decisions
- **Hidden UI:** Unauthorized actions (like 'Edit' or 'Delete' for Viewers) are not rendered at all to maintain a clean interface.
- **Uncompromising Typography:** System fonts are completely avoided in favor of the editorial pairing to reinforce the "precision instrument" feel.
- **Grid-Breaking Elements:** Subtle rotated watermarks are used to add visual interest to the rigid grid layout.
