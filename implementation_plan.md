# Admin Panel Overhaul

We will completely rip out the existing fragmented, `localStorage`-based admin panel and replace it with a stunning, professional, server-connected CMS dashboard. 

## User Review Required

> [!WARNING]  
> The old admin panel saved data to `localStorage` and forced you to manually download a `notes.json` file. The new admin panel will directly save to the file system using Node.js API routes, entirely eliminating the manual export process.

> [!IMPORTANT]  
> Currently, the platform has two data sources: the legacy `data/notes.json` and the new `data/kd-method/` folder hierarchy. The old admin panel only managed `notes.json`. 
> **Question:** For this new admin panel, should we focus on building a management system for the new `data/kd-method/` file hierarchy (Subjects -> Chapters -> Topics -> Quizzes/Notes), or should we continue to manage the legacy `notes.json`?

## Proposed Changes

### 1. New Admin Layout Shell (`app/admin/layout.tsx`)
- [DELETE] Old fragmented sidebar.
- [NEW] A sleek, responsive Sidebar and Topbar using Framer Motion. 
- Links for Dashboard, Subjects, Content Editor, Quiz Manager, and Settings.
- Dark mode optimized with glassmorphic elements.

### 2. Beautiful Dashboard (`app/admin/page.tsx`)
- [DELETE] Hardcoded, broken quick links.
- [NEW] A unified dashboard showing real statistics (Total Subjects, Topics, Quizzes, Notes).
- Recent activity feed.
- Quick action cards to instantly create new content.

### 3. Subject & Chapter Manager (`app/admin/subjects/page.tsx`)
- [MODIFY] Replace `SubjectManager.tsx`.
- A beautiful nested tree view to manage Subjects > Chapters > Topics.
- Modals for creating/editing subjects with icon and color pickers.

### 4. Modular Content Editor (`app/admin/editor/page.tsx`)
- [DELETE] The unmaintainable 1440-line `NoteBoxCreatorModern.tsx`.
- [NEW] Break down the editor into modular components. 
- Sidebar for selecting the target node in the hierarchy.
- Main area with TipTap rich text editor.
- Visual component builders for the 30+ NoteBox types (Mnemonic Cards, Flashcards, etc.).
- Direct server saving—no more downloading JSON files.

### 5. API Backend for Direct Saving (`app/api/admin/...`)
- Implement robust Node.js `fs` operations to directly read and write the data files in the Next.js API routes.
- Add debounced auto-saving capabilities.

## Verification Plan
### Manual Verification
- Verify the dashboard loads real stats.
- Create a test subject and verify it appears in the data files immediately without downloading a JSON file.
- Verify the 30+ NoteBox types render perfectly in the new modular editor.
