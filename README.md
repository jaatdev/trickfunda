<div align="center">

# 🎯 TrickFunda

### *Learn, Master, Excel — Ace Your Dream Exam*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Offline_Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](#-pwa--performance)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#-license)

**A modern, world-class competitive exam preparation platform** built for Indian students preparing for **UPSC, JEE, NEET, SSC, Banking, CAT**, and **50+ competitive exams**.

TrickFunda combines beautiful UI design with learning science — spaced repetition, interactive quizzes, bilingual content (English/Hindi), and a custom quiz builder — all wrapped in a blazing-fast Progressive Web App that works offline.

[🚀 Get Started](#-getting-started) · [✨ Features](#-features) · [🏗️ Architecture](#-project-architecture) · [🤝 Contributing](#-contributing)

</div>

---

## 📸 Highlights

| | |
|:---:|:---:|
| **🏠 Stunning Landing Page** | **📚 Study Material Learning System** |
| Animated hero, 3D card effects, parallax | 7 subjects, chapter-based structured learning |
| **🧠 Exam-Simulation Quizzes** | **📊 Detailed Quiz Review** |
| Timed, keyboard shortcuts, bilingual | Per-question analytics, PDF export |

---

## ✨ Features

### 🎓 Study Material — The Core Learning Engine

The **Study Material** is TrickFunda's structured, chapter-by-chapter learning system spanning **7 subject areas**:

| Subject | Description |
|---------|-------------|
| 🔢 **Maths TrickFunda** | Algebra, Geometry, Number System, Time-Speed-Distance with subtopics |
| 📝 **English 100 Concepts** | 100 grammar rules with individual notes and quizzes |
| 📖 **English Chapterwise** | Chapter-based English learning |
| 🌍 **GS TrickFunda** | General Studies & General Knowledge |
| 🧩 **Reasoning TrickFunda** | Logical & Analytical Reasoning |
| 📚 **Vocab TrickFunda** | Vocabulary building with tricks |
| ➕ **Abhinay Sir Maths** | Mensuration 2D/3D and advanced topics |

Each subject features a stats banner, branded color theme, and deep folder hierarchy of topics and subtopics.

---

### 🧠 Exam-Simulation Quiz Engine

A sophisticated, full-featured quiz interface that replicates a real exam environment:

- **One-question-at-a-time** with smooth animated transitions
- **Question sidebar** — color-coded grid showing answered / marked / skipped / unanswered
- **Mark for Review** — bookmark questions and revisit before submission
- **Live timer** — running stopwatch throughout the session
- **Animated progress bar** — gradient bar showing completion percentage
- **Keyboard shortcuts** — `1–4` select option, `←→` navigate, `M` mark, `S` skip, `Space` next
- **Fullscreen mode** — hides navbar/footer during the quiz for zero distractions

#### Rich Question Types
- **MathJax rendering** — LaTeX math formulas in questions and options
- **Dice layout renderer** — visual 3D dice/cube reasoning questions
- **SVG geometry renderer** — triangles, circles, quadrilaterals, composite figures
- **Exam tags** — each question tagged with its source exam (e.g., 🎓 SSC CGL 2023)
- **Difficulty badges** — easy / medium / hard indicators
- **Bilingual support** — English ↔ Hindi toggle (`prompt_hi`, `options_hi`, `reason_hi`)

---

### 🛠️ Custom Quiz Builder

Build your own personalized quiz from any combination of topics:

- **Interactive topic tree** — browse all Study Material subjects/chapters/topics with checkboxes and parent-child selection
- **Question count slider** — 10 to 200 questions (step of 5)
- **Random sampling** — questions are shuffled from selected topics via a dedicated API
- **Seamless transition** — enters fullscreen quiz mode after generation

---

### 🎨 Cosmic Canvas (Infinite PDF & Drawing Workspace)

A built-in 3D infinite canvas application for brainstorming and interactive learning:

- **Native PDF Support** — directly open PDFs from the study material into the canvas
- **TrickFunda Teaching Pages & Themes** — automatically insert branded pages with custom TrickFunda color themes. Set a "Default Theme" to automatically apply branding to all new pages!
- **High-Fidelity PDF Export** — exact visual matching of canvas to PDF using `pdf-lib`, embedding standard and bold fonts (`HelveticaBold`, `TimesRomanBold`), drawing SVG vector paths for logos (like YouTube), stripping unsupported emojis to prevent crashes, and precisely matching watermark opacities.
- **Drawing & Annotation** — uses `perfect-freehand` for smooth, realistic drawing capabilities with pen, highlighter, and shape tools.
- **Page Virtualization** — seamlessly load hundreds of PDF pages without memory crashes using `react-pdf`

---

### 🗜️ High-Performance PDF Compressor

Built-in client-side PDF compression engine that works entirely in the browser:

- **World's Fastest Browser Compression** — reduces 500MB PDFs to 20MB in seconds
- **100% Private** — zero server uploads, all processing happens locally on your device
- **Web Worker Architecture** — offloads heavy image recompression to background threads (zero UI freezing)
- **Advanced Optimization Pipeline** — includes image recompression, stream deduplication, font optimization, and metadata stripping
- **Three Quality Presets** — Ultra (Zero Visual Loss), Balanced (Smart Compression), Maximum (Maximum Savings)
- **Zero-Copy Transfers** — uses Transferable `ArrayBuffer` for blazing fast memory management

---

### ☁️ Headless CMS via Google Drive

TrickFunda's entire `data/` layer is fully decoupled and powered by a headless Google Drive architecture:

- **Zero-Dependency Sync** — uses a custom Node.js script to sync the Google Drive folder via Service Account JWTs
- **Automated CI/CD & Cron Jobs** — automatically downloads all new study materials on every Vercel build (`npm run sync-data`) and runs a Daily Cron Job at midnight (`0 0 * * *`) to keep the live site up-to-date without triggering new deployments.
- **1-Click Admin Sync** — A dedicated Sync button in the Admin Dashboard allows admins to instantly sync the latest Google Drive files to the live website.
- **Frictionless Content Management** — content creators simply drag and drop PDFs, JSONs, and Markdown into Google Drive, and TrickFunda automatically picks them up!
- **Edge Optimized** — fully optimized to run within Vercel's Hobby tier constraints by aggressively utilizing static generation (SSG) and the Vercel Edge Runtime.

---

### 📊 Detailed Quiz Review & PDF Export

After quiz completion, a comprehensive review system:

- **Filterable views** — All / Correct / Incorrect / Skipped / Sort by Time
- **Per-question review cards** — shows your answer, correct answer, and detailed explanation
- **Time analytics panel** — fastest question, average time, slowest question
- **Download as PDF** — multi-page A4 PDF export with animated progress indicator. Each question is captured individually and placed on its own page — never cut in half across pages.

---

### 📖 Reading Experience

Premium note-reading interface with:

- **Auto-generated Table of Contents** with live progress tracking
- **3 font sizes**, adjustable line heights, and customizable reading width
- **Dyslexia-friendly font** — toggle OpenDyslexic
- **Focus mode** — distraction-free reading
- **Keyboard navigation** — `J`/`K` for sections, `G` for top
- **Image zoom lightbox**, syntax-highlighted code blocks with copy button
- **Collapsible sections**, breadcrumb trail, URL hash deep-linking

---

### 🔬 Learning Science

- **SM-2 Spaced Repetition** — scientifically optimized review intervals for long-term retention
- **Flashcards** with flip animations and quality ratings
- **Achievement system** — 10 badges tracking your learning milestones
- **Study streaks** — 3, 7, and 30-day streak tracking
- **Mastery milestones** — track cards mastered (10, 50, 100+)
- **Progress tracking** with real-time statistics

---

### 🔍 Smart Search

- **Command palette** — `Cmd/Ctrl + K` opens a fuzzy search powered by [Fuse.js](https://fusejs.io/)
- Search across all subjects, topics, notes, and quizzes instantly

---

### 👑 Admin Panel

A full-featured admin dashboard at `/admin`:

- **Stats overview** — subjects, topics, subtopics, and content item counts
- **Content management** — create and browse subjects, manage notes
- **Rich text editor** — TipTap-based editor for creating and editing notes
- **File explorer** — browse and manage the content hierarchy
- **Supabase health check** — test database connectivity
- **Role-based access** — admin email allowlist via environment variable

---

### 💰 Pricing Tiers

| Feature | Free | Pro ($9/mo) | Lifetime ($199) |
|---|:---:|:---:|:---:|
| Subjects | 5 | All | All + Exclusive |
| Flashcards | Basic | Advanced | Everything |
| Quizzes | ✓ | Unlimited | ✓ |
| Spaced Repetition | ✗ | SM-2 | ✓ |
| Advanced Analytics | ✗ | ✓ | ✓ |
| Offline Mode | ✗ | Full | ✓ |
| AI Study Plans | ✗ | ✓ | ✓ |
| API Access | ✗ | ✗ | ✓ |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) — 3D card effects, parallax, particles |
| **Authentication** | [Clerk](https://clerk.com/) (`@clerk/nextjs`) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Image Storage** | [Cloudinary](https://cloudinary.com/) |
| **Math Rendering** | [MathJax](https://www.mathjax.org/) via `better-react-mathjax` |
| **Rich Text Editor** | [TipTap](https://tiptap.dev/) (`@tiptap/react`) |
| **Search** | [Fuse.js](https://fusejs.io/) — fuzzy search with command palette |
| **PDF Generation** | [pdf-lib](https://pdf-lib.js.org/) + [@pdf-lib/fontkit](https://github.com/Hopding/pdf-lib/tree/master/packages/fontkit) |
| **Drawing** | [perfect-freehand](https://github.com/steveruizok/perfect-freehand) — canvas annotation |
| **Markdown** | `react-markdown` + rehype/remark plugins |
| **PWA** | `next-pwa` with Workbox service worker |
| **Theme** | `next-themes` — dark/light mode with system preference |
| **Fonts** | Inter, JetBrains Mono via `next/font` |
| **Testing** | Vitest + Testing Library |
| **Performance** | `web-vitals`, `@next/bundle-analyzer` |
| **Rate Limiting** | Upstash Redis |
| **Celebrations** | `canvas-confetti` 🎉 |

---

## 📂 Project Architecture

```
trickfunda/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers, Clerk)
│   ├── page.tsx                  # Landing page (hero, features, testimonials)
│   ├── about/                    # About TrickFunda
│   ├── admin/                    # Admin dashboard & content management
│   │   ├── notes/                # Notes editor (new, list)
│   │   ├── subjects/             # Subject management
│   │   └── test-supabase/        # DB health check
│   ├── analytics/                # Analytics dashboard
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin APIs
│   │   ├── drafts/               # Content draft management
│   │   ├── study-material/            # Quiz generation API
│   │   ├── presence/             # Real-time presence (heartbeat)
│   │   ├── published/            # Published content API
│   │   └── upload/               # Image upload (Cloudinary + Supabase)
│   ├── blog/                     # Blog with categories & search
│   ├── careers/                  # Job listings
│   ├── community/                # Community hub
│   ├── contact/                  # Contact form
│   ├── features/                 # Feature showcase
│   ├── help-center/              # Help & documentation
│   ├── study-material/                # ← THE CORE LEARNING SYSTEM
│   │   ├── [subject]/            # Dynamic subject pages
│   │   │   └── [...path]/        # Deep nested topic pages
│   │   ├── custom-quiz/          # Custom Quiz Builder
│   │   └── english-100-concepts/ # 100 English grammar concepts
│   ├── login/                    # Auth pages
│   ├── offline/                  # PWA offline fallback
│   ├── pricing/                  # Pricing tiers
│   ├── privacy/                  # Privacy policy
│   ├── resources/                # Study resources
│   ├── roadmap/                  # Product roadmap
│   ├── sign-in/                  # Clerk sign-in
│   ├── sign-up/                  # Clerk sign-up
│   ├── study-guides/             # Study guide library
│   └── terms/                    # Terms of service
│
├── components/                   # React components
│   ├── command/                  # Command palette (Cmd+K search)
│   ├── home/                     # Landing page sections
│   │   ├── HeroSection.tsx       # Animated hero with parallax
│   │   ├── FeaturesShowcase.tsx  # 3D tilt feature cards
│   │   ├── SubjectsGrid.tsx      # Dynamic subject grid
│   │   └── TestimonialsSection.tsx
│   ├── study-material/                # Study Material components
│   │   └── ConceptInteractiveViewer.tsx
│   ├── layout/                   # Navbar & Footer
│   ├── quiz/                     # Quiz system
│   │   ├── QuizPanel.tsx         # Main quiz interface (795 lines)
│   │   ├── QuizReview.tsx        # Post-quiz review with PDF export
│   │   ├── QuizConfigurator.tsx  # Quiz settings UI
│   │   ├── DiceLayoutRenderer.tsx
│   │   └── geometry/             # SVG geometry renderers
│   │       ├── FigureRenderer.tsx
│   │       ├── TriangleRenderer.tsx
│   │       ├── CircleRenderer.tsx
│   │       ├── QuadrilateralRenderer.tsx
│   │       ├── LinesAndAnglesRenderer.tsx
│   │       └── CompositeRenderer.tsx
│   ├── notes/                    # Notes system components
│   └── ui/                       # Shared UI components
│
├── data/                         # Content data
│   ├── study-material/                # Study Material file-based content
│   │   ├── maths-trickfunda/     # Math chapters & quizzes
│   │   ├── english-100-concepts/ # 100 English concept files
│   │   ├── english-chapterwise/
│   │   ├── gs-trickfunda/
│   │   ├── reasoning-trickfunda/
│   │   ├── vocab-trickfunda/
│   │   └── abhinay-sir-maths/
│   ├── subjects/                 # Legacy JSON subjects
│   ├── notes.json                # Original notes content
│   └── notes-static.json         # Build-generated static data
│
├── lib/                          # Core utilities
│   ├── types.ts                  # TypeScript interfaces
│   ├── learningProgress.ts       # SM-2 spaced repetition
│   ├── performance.ts            # Web Vitals monitoring
│   ├── preload.ts                # Resource preloading
│   ├── supabase.ts               # Supabase client
│   └── theme-variants.ts         # Quiz theme system
│
├── utils/                        # Utility functions
│   └── kdMethodParser.ts         # File-system → content tree parser
│
├── scripts/                      # Build scripts
│   └── build-static-data.js      # Pre-build data generation
│
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   ├── logo.jpg                  # TrickFunda logo
│   ├── banner.jpg                # Hero banner
│   └── icons/                    # App icons (all sizes)
│
└── styles/
    └── globals.css               # Global styles, CSS variables, themes
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x (or yarn / pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/jaatdev/notty.git
cd notty

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Admin Access
ADMIN_USERS=admin@example.com,another@example.com

# Optional
ANALYZE=true  # Enable bundle analyzer
```

### Development

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see TrickFunda running locally.

### Build for Production

```bash
# Build static data + Next.js production bundle
npm run build

# Start production server
npm start
```

> The build script automatically runs `node scripts/build-static-data.js` before the Next.js build to generate `data/notes-static.json` from the file-based Study Material content.

---

## ⚡ PWA & Performance

TrickFunda is a **Progressive Web App** with full offline support:

- **Service Worker** — Workbox-powered with intelligent caching strategies:
  - `CacheFirst` for fonts and static assets
  - `StaleWhileRevalidate` for images and scripts
  - `NetworkFirst` for API calls and dynamic content
- **Offline fallback page** — graceful offline experience at `/offline`
- **Installable** — add to home screen on any device

### Performance Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** | < 2.5s | Largest Contentful Paint |
| **FID** | < 100ms | First Input Delay |
| **CLS** | < 0.1 | Cumulative Layout Shift |
| **PWA Score** | 100 | Lighthouse PWA audit |
| **Accessibility** | 100 | WCAG compliant |

---

## 🎨 Design Philosophy

TrickFunda's UI is built around these principles:

- **Premium feel** — glassmorphic navbar, gradient orbs, 3D card tilt effects
- **Smooth animations** — every interaction is powered by Framer Motion
- **Dark mode first** — optimized for late-night study sessions with `next-themes`
- **Mobile responsive** — works flawlessly on phones, tablets, and desktops
- **Accessible** — keyboard navigation, screen reader support, dyslexia-friendly font

---

## 🧪 Testing

```bash
# Run unit tests
npx vitest run

# Run tests in watch mode
npx vitest
```

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build static data + production bundle |
| `npm run build:data` | Generate `notes-static.json` from Study Material files |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🌟 Mega Feature Showcase (100+ Capabilities)

*A comprehensive technical and functional breakdown showcasing the scale, depth, and capabilities of TrickFunda:*

### 🎨 Cosmic Canvas & PDF Mastery
1. **Infinite 3D Workspace** — Pan, zoom, and navigate seamlessly.
2. **High-Fidelity PDF Export** — `pdf-lib` powered robust client-side generation.
3. **Smart Font Embedding** — Native embedding of HelveticaBold & TimesRomanBold.
4. **SVG Path Tracing** — Exact vector replication of YouTube logos in PDF.
5. **Emoji Sanitization Engine** — Prevents crashes by cleanly stripping unsupported unicode.
6. **Dynamic Watermarking** — Layered, opacity-matched brand watermarks on all pages.
7. **TrickFunda Brand Themes** — 10+ custom color themes for teaching pages.
8. **Default Theme Memory** — Saves your preferred teaching theme to IndexedDB automatically.
9. **Perfect Freehand Drawing** — Pressure-sensitive, buttery-smooth pen strokes.
10. **Multi-color Highlighter** — Overlay highlighting with blend modes.
11. **Shape Primitives** — Instantly draw rectangles, circles, arrows, and lines.
12. **Background Patterns** — Grid, ruled, dots, isometric, music, and Cornell layouts.
13. **Page Virtualization** — `react-pdf` integration to handle 1000+ page PDFs without crashing.
14. **PDF Merging Tool** — Combine multiple PDFs directly in the browser.
15. **Extreme PDF Compression** — Web Worker-based engine reducing 500MB to 20MB locally.

### 🧠 Advanced Quiz Engine
16. **Exam-Simulation UI** — Distraction-free, fullscreen competitive exam layout.
17. **One-by-One Rendering** — Smooth animations between question transitions.
18. **Mark for Review** — Bookmark tough questions for later.
19. **Live Analytics Stopwatch** — Tracks time spent per question and overall.
20. **Keyboard Navigation** — `1-4` for answers, `M` for mark, `Arrow Keys` for next/prev.
21. **MathJax Integration** — Flawless LaTeX rendering for complex algebra & calculus.
22. **Dice & Cube Renderer** — 3D layout simulation for reasoning puzzles.
23. **SVG Geometry Engine** — Draws perfect triangles, circles, and composite figures on the fly.
24. **Bilingual Toggle** — Switch questions between English and Hindi instantly.
25. **Granular Tagging** — Shows previous year exam tags (e.g., "SSC CGL 2023").
26. **Difficulty Color Coding** — Visual indicators for easy/medium/hard questions.
27. **Custom Quiz Builder** — Generate random quizzes from thousands of topics.
28. **Detailed Post-Quiz Analytics** — Fastest, slowest, and average time insights.
29. **PDF Quiz Export** — Download your quiz results as a beautiful paginated PDF.
30. **Spaced Repetition (SM-2)** — Algorithmic flashcards for optimal retention.

### ☁️ Headless CMS & Data Architecture
31. **Google Drive Integration** — Folders and files map directly to Next.js routes.
32. **Automated CI/CD Sync** — GitHub actions & Next.js build steps fetch latest Google Drive data.
33. **Zero-Database Content Management** — Markdown & JSON files dictate course structures.
34. **Cron Job Updates** — Automated midnight syncs to keep content fresh.
35. **Admin 1-Click Sync** — Instantly pull live updates from the admin dashboard.
36. **Smart Caching** — Intelligent static generation (SSG) for blazing-fast page loads.
37. **Folder Hierarchy Parsing** — Deep nested topic trees parsed automatically (`kdMethodParser`).

### 🤖 AI & Automation Tools
38. **Gemini AI Integration** — Powered by `@google/genai` for smart study interactions.
39. **OCR Text Recognition** — `tesseract.js` integration to extract text from images and notes.
40. **TrickFunda Chatbot** — Intelligent conversational agent for student doubts.
41. **AI Image Generation** — Custom asset generation workflows via API.
42. **Telegram Bot Integration** — `gramjs` powered background downloader and session manager.
43. **Video Sniffer API** — Advanced networking tools to extract educational media streams.
44. **Automated Content Structuring** — Scripts to split, combine, and validate JSON data structures.

### 💻 UI/UX & Design System
45. **Framer Motion Animations** — 3D card tilts, parallax heroes, and micro-interactions.
46. **Dark/Light Mode** — `next-themes` integration respecting system preferences.
47. **Glassmorphism Design** — Premium frosted glass navbars and panels.
48. **Responsive Grid Layouts** — Fluid scaling across mobile, tablet, and ultra-wide screens.
49. **Command Palette (Cmd+K)** — `Fuse.js` fuzzy search across the entire platform.
50. **Auto Table of Contents** — Dynamic reading progress trackers in study materials.
51. **Dyslexia-Friendly Fonts** — OpenDyslexic integration for accessible reading.
52. **Focus Mode** — Distraction-free reading environment.
53. **Adjustable Typography** — User-controlled font sizes and line heights.
54. **Image Lightbox** — Tap to zoom embedded educational diagrams.
55. **Syntax Highlighting** — `lowlight` & TipTap code blocks for programming tutorials.

### 🔐 Security & Admin
56. **Clerk Authentication** — Secure, passwordless, and social logins.
57. **Role-Based Access Control** — Hardcoded admin allowlists to protect sensitive routes.
58. **Supabase PostgreSQL** — Robust relational database for user progress and analytics.
59. **TipTap Rich Text Editor** — Custom admin note builder with image and code support.
60. **Cloudinary Asset Storage** — Optimized cloud image delivery and transformation.
61. **Upstash Redis Rate Limiting** — Protection against API abuse and DDoS.
62. **Database Health Dashboard** — Real-time ping testing to Supabase.
63. **Live Presence System** — Real-time heartbeat tracking for concurrent users.

### ⚡ Performance & PWA
64. **100 Lighthouse Score** — Heavily optimized for Core Web Vitals (LCP < 2.5s).
65. **Next.js App Router** — Utilizing React Server Components for zero-bundle-size rendering.
66. **Next-PWA Service Workers** — `Workbox` caching strategies for offline studying.
67. **Offline Fallback Routes** — Custom `/offline` UI when internet drops.
68. **Resource Preloading** — Intelligent eager fetching of critical assets and fonts.
69. **Edge Runtime APIs** — Low-latency serverless function execution.
70. **Transferable ArrayBuffers** — Zero-copy memory management in Web Workers.

### 🎓 Content & Curriculum
71. **7 Massive Subjects** — Covering Maths, English, GS, Reasoning, and Vocab.
72. **100 English Concepts** — Specialized grammar rule breakdowns.
73. **Abhinay Sir Maths** — Advanced 2D/3D mensuration interactive sheets.
74. **Bilingual Vocabulary** — Thousands of OWS and Idioms in English and Hindi.
75. **Achievement Badges** — Gamified learning milestones and celebrations (confetti!).

...and dozens of background utilities, automated tests (`vitest`), developer productivity scripts, and scalable architectural patterns!

---

## 🔗 Connect with TrickFunda

<div align="center">

[![YouTube](https://img.shields.io/badge/YouTube-@TrickFunda-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@TrickFunda)
[![Telegram](https://img.shields.io/badge/Telegram-TrickFunda-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/trickfunda)

</div>

---

<div align="center">

**Built with 💚 by the TrickFunda Team**

*Empowering 10,000+ students to ace their dream exams*

</div>
