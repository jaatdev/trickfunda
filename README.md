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
| **🏠 Stunning Landing Page** | **📚 KD Method Learning System** |
| Animated hero, 3D card effects, parallax | 7 subjects, chapter-based structured learning |
| **🧠 Exam-Simulation Quizzes** | **📊 Detailed Quiz Review** |
| Timed, keyboard shortcuts, bilingual | Per-question analytics, PDF export |

---

## ✨ Features

### 🎓 KD Method — The Core Learning Engine

The **KD Method** is TrickFunda's structured, chapter-by-chapter learning system spanning **7 subject areas**:

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

- **Interactive topic tree** — browse all KD Method subjects/chapters/topics with checkboxes and parent-child selection
- **Question count slider** — 10 to 200 questions (step of 5)
- **Random sampling** — questions are shuffled from selected topics via a dedicated API
- **Seamless transition** — enters fullscreen quiz mode after generation

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
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) + [html-to-image](https://github.com/bubkoo/html-to-image) |
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
│   │   ├── kd-method/            # Quiz generation API
│   │   ├── presence/             # Real-time presence (heartbeat)
│   │   ├── published/            # Published content API
│   │   └── upload/               # Image upload (Cloudinary + Supabase)
│   ├── blog/                     # Blog with categories & search
│   ├── careers/                  # Job listings
│   ├── community/                # Community hub
│   ├── contact/                  # Contact form
│   ├── features/                 # Feature showcase
│   ├── help-center/              # Help & documentation
│   ├── kd-method/                # ← THE CORE LEARNING SYSTEM
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
│   ├── kd-method/                # KD Method components
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
│   ├── kd-method/                # KD Method file-based content
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

> The build script automatically runs `node scripts/build-static-data.js` before the Next.js build to generate `data/notes-static.json` from the file-based KD Method content.

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
| `npm run build:data` | Generate `notes-static.json` from KD Method files |
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
