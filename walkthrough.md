# TrickFunda Admin Panel Overhaul (Phase 1 & Phase 2)

The admin panel has been completely rebuilt from the ground up, moving away from the fragile `localStorage` approach to a robust, server-connected CMS that directly interacts with the `data/kd-method` directory.

## What was accomplished in Phase 2 (Content & Assets)

### 1. Media & Assets Manager
- Built a brand new `/admin/media` page to visually manage images and PDFs.
- Created `/api/admin/upload/route.ts` which securely handles multipart file uploads directly to your `public/uploads` or `public/figures` directories.
- You can now upload images, preview them in a gallery, delete them, and instantly copy their URL to embed in your notes.

### 2. Advanced Rich Text Editor (WYSIWYG)
- Upgraded the Modular Editor to include a **Visual Mode**. 
- Integrated the `@tiptap/react` rich text editor specifically optimized for the KD Method.
- When you open any `.md` file, you can now toggle between raw code editing and a beautiful WYSIWYG editor featuring Bold, Italic, Headings, Lists, Code Blocks, and Image Insertion tools.

### 3. Global Settings Panel
- Built a new `/admin/settings` page to manage global configurations.
- Created a robust `/api/admin/settings/route.ts` API that saves preferences to `data/settings.json`.
- You can now easily edit your Site Name, SEO Description, toggle Maintenance Mode, and flip feature flags (like enabling/disabling the Leaderboard) directly from the GUI.

## What was accomplished in Phase 1 (Foundation)
1. **Robust Server API**: `/api/admin/fs` for reading/writing directly to the filesystem.
2. **Beautiful Admin Shell**: Framer motion transitions, glassmorphic dark/light sidebars.
3. **Live Dashboard**: Real-time KD Method statistics parser.
4. **Content Explorer**: Server-side file manager to navigate the Subject > Chapter hierarchy visually.
5. **Quiz Builder GUI**: Dedicated visual interface for constructing complex `quiz.json` arrays.

## Screenshots

> [!TIP]
> Navigate to `/admin/media` to try uploading some images, and then go to `/admin/editor` to try out the new Visual Markdown editor!
