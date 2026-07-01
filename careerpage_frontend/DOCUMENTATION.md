# South Point School — Career Portal (Frontend)

Recruitment / career portal for **South Point School, Guwahati**. It has two
distinct parts:

1. **Career Page** — the public-facing marketing + job-browsing site.
2. **Candidate Dashboard** — the authenticated area where a logged-in candidate
   manages their profile, resume and applications.

This document describes the architecture, folder layout, state model, and data
flow after the feature-based refactor.

---

## 1. Tech stack

| Concern | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) + inline style objects |
| Animation | `motion` (Framer Motion successor) |
| Icons | `lucide-react` |
| Toasts | `sonner` |
| Lint | ESLint 10 (`eslint.config.js`) |

There is currently **no router** — navigation between the career page and the
dashboard is handled by conditional rendering of modals/overlays driven by
state in [`App.jsx`](src/App.jsx). There is **no global state library**; state
lives in the `App` shell and is passed down via props.

---

## 2. Folder structure

```
src/
├── App.jsx                     # App shell — owns cross-cutting state, wires everything together
├── main.jsx                    # React entry point (createRoot)
├── index.css / App.css         # global styles
│
├── assets/                     # logo, campus photo, hero image, svgs
│
├── lib/                        # framework-agnostic shared helpers
│   ├── constants.js            # brand theme tokens: MAROON, GOLD, CREAM
│   └── keepAwake.js            # useKeepAwake() hook — pings the Render backend
│
├── data/                       # static content (the future API boundary)
│   └── jobs.js                 # jobs, CATEGORIES, benefits, milestones, stats, experienceById
│
├── components/
│   ├── common/                 # shared, cross-feature components
│   │   └── ImageWithFallback.jsx
│   └── ui/                     # shadcn/ui primitives (button, dialog, etc.) — design system
│
└── features/                   # the two product areas, each self-contained
    ├── careerpage/             # ===== PART 1: public site =====
    │   ├── CareerPage.jsx      # composes the page sections
    │   ├── components/         # one file per page section
    │   │   ├── Navbar.jsx
    │   │   ├── HeroSection.jsx
    │   │   ├── OpportunitiesSection.jsx
    │   │   ├── JobCard.jsx
    │   │   ├── TalentPoolSection.jsx
    │   │   ├── BenefitsSection.jsx
    │   │   ├── FeedbackForm.jsx
    │   │   └── Footer.jsx
    │   ├── hooks/
    │   │   └── useJobFilters.js # search + category filter + "see more" paging
    │   └── modals/             # overlays launched from the public site
    │       ├── LoginModal.jsx
    │       ├── ApplyModal.jsx
    │       └── JobApplicationModal.jsx
    │
    └── dashboard/              # ===== PART 2: candidate dashboard =====
        └── CandidateDashboard.jsx
```

### Layering rules

- `lib/`, `data/`, `components/ui/`, `components/common/` are **shared** and must
  not import from `features/`.
- `features/careerpage/` and `features/dashboard/` are **siblings**; they should
  not import each other directly. Anything genuinely shared between them is
  lifted into the shared layers above or passed through props from `App.jsx`.
- `App.jsx` is the only place allowed to know about *both* features at once.

---

## 3. The App shell ([`App.jsx`](src/App.jsx))

`App` renders the public `CareerPage` plus four overlays, and owns all
**cross-cutting state** — the state that must survive across the boundary
between browsing jobs, authenticating, applying, and viewing the dashboard.

### State owned by App

| State | Purpose |
|---|---|
| `loggedInUser` | Display name of the signed-in candidate; `""` when logged out |
| `signupData` | Raw signup payload (`{ name, lastName, email, phone }`) |
| `showLogin`, `loginTab` | Login/Signup modal visibility and active tab |
| `applyAfterSignup` | If `true`, open the ApplyModal right after a successful signup |
| `showApply` | Talent-pool general application modal visibility |
| `showDashboard`, `dashboardInitialTab` | Dashboard overlay visibility + which tab to open |
| `showJobApplicationModal`, `selectedJob` | Per-job application modal + the job being applied to |
| `appliedJobIds` | List of job ids the user has applied to |
| `applicationsData` | Map of `jobId → submitted form data` |
| `savedProfileData` | The candidate's persisted profile/resume info |
| `applicationDraft` | In-progress application data when bouncing to the profile editor |
| `cameFromApply`, `cameFromSection` | Navigation breadcrumbs for the apply ⇄ dashboard round-trip |

### Derived state

- **`mergedProfileData`** (`useMemo`) — merges `savedProfileData`,
  `applicationDraft`, and `signupData` into the single profile object the
  dashboard renders. `applicationDraft` takes precedence (most recent edits),
  then `savedProfileData`, then `signupData`/defaults.

### Handlers passed to CareerPage

| Prop | Action |
|---|---|
| `onLogin` | Open login modal on the "login" tab |
| `onSignup` | Set `applyAfterSignup` and open the "signup" tab |
| `onOpenDashboard` | Open dashboard on the "dashboard" tab |
| `onLogout` | Clear `loggedInUser` |
| `onApplyJob(job)` | If logged out → open login; else open the job application modal |
| `appliedJobIds` | So cards can render the "✓ Applied" state |

---

## 4. Part 1 — Career Page

[`CareerPage.jsx`](src/features/careerpage/CareerPage.jsx) is **presentation
only**. It receives auth/apply handlers from `App` and composes the sections in
order:

```
Navbar → HeroSection → OpportunitiesSection → TalentPoolSection*
       → BenefitsSection → FeedbackForm → Footer
```
`* TalentPoolSection renders only when logged out.`

### Sections

| Component | Responsibility | Local state |
|---|---|---|
| [`Navbar`](src/features/careerpage/components/Navbar.jsx) | Sticky nav; Login/Sign Up vs Dashboard/Log Out; mobile `<details>` menu | none |
| [`HeroSection`](src/features/careerpage/components/HeroSection.jsx) | Hero banner, CTAs, trust indicators, stats | none |
| [`OpportunitiesSection`](src/features/careerpage/components/OpportunitiesSection.jsx) | Search, category filters, job grid, paging | via `useJobFilters` |
| [`JobCard`](src/features/careerpage/components/JobCard.jsx) | One job card; Apply + Share; "See More" overlay | none |
| [`TalentPoolSection`](src/features/careerpage/components/TalentPoolSection.jsx) | "Don't see your role?" general-application CTA | none |
| [`BenefitsSection`](src/features/careerpage/components/BenefitsSection.jsx) | Grid of employee benefits | none |
| [`FeedbackForm`](src/features/careerpage/components/FeedbackForm.jsx) | Star-rated feedback form | **self-contained** |
| [`Footer`](src/features/careerpage/components/Footer.jsx) | Logo, links, copyright | none |

### `useJobFilters` hook

[`hooks/useJobFilters.js`](src/features/careerpage/hooks/useJobFilters.js) owns
the listing's interactive state and derives the visible list:

- `search`, `activeCategory`, `showAll`
- `filteredJobs` — memoised filter by category + title/department text match
- `visibleJobs` — first `JOBS_VISIBLE` (4) unless `showAll`
- `onSearchChange`, `onCategoryChange` — also reset paging

The last visible card shows a blurred **"See More"** overlay when more results
are hidden; clicking it sets `showAll`.

### Modals (launched from the public site)

| Modal | Trigger | Notes |
|---|---|---|
| [`LoginModal`](src/features/careerpage/modals/LoginModal.jsx) | Login / Sign Up | Tabs for login, signup, and a 4-step forgot-password flow (OTP is demo-mode: any 6 digits) |
| [`ApplyModal`](src/features/careerpage/modals/ApplyModal.jsx) | "Submit Profile" / talent pool | General application; multi-select roles & skills; resume upload (≤ 5 MB) |
| [`JobApplicationModal`](src/features/careerpage/modals/JobApplicationModal.jsx) | "Apply Now" on a job card | Per-job application; can bounce to the dashboard profile editor and back |

---

## 5. Part 2 — Candidate Dashboard

[`CandidateDashboard.jsx`](src/features/dashboard/CandidateDashboard.jsx) is the
authenticated overlay. It is currently **one large component** (~3,200 lines)
covering all tabs (overview, resume/profile, applications, settings).

### Props in

| Prop | Meaning |
|---|---|
| `userName` | `loggedInUser` |
| `signupData` | Raw signup payload |
| `appliedJobIds`, `allJobs`, `applicationsData` | To render the applications view |
| `initialProfileData` | The merged profile (`mergedProfileData`) |
| `initialTab`, `initialSection` | Which tab/section to open |

### Callbacks out

| Callback | Effect in App |
|---|---|
| `onClose` | Hide dashboard; if it was opened mid-apply, reopen the job application modal |
| `onLogout` | Clear session |
| `onProfileUpdate(data)` | Persist into `savedProfileData`, clear `applicationDraft` |

> **Planned split:** this file is the main outstanding refactor. The intended
> shape is `features/dashboard/` with `CandidateDashboard.jsx` as a thin
> shell + `components/tabs/*` (one file per tab) + `hooks/` for shared logic.

---

## 6. Key data flow — "Apply to a job"

```
JobCard "Apply Now"
   → CareerPage onApplyJob → App.handleApplyJob(job)
        ├─ not logged in → open LoginModal
        └─ logged in → setSelectedJob + open JobApplicationModal
                           ├─ Submit → App pushes jobId into appliedJobIds,
                           │            stores form in applicationsData,
                           │            merges professional info into savedProfileData
                           └─ "Edit profile" → stash applicationDraft, set
                                        cameFromApply, open Dashboard on "resume" tab
                                        → on Dashboard close, reopen the application modal
```

This round-trip is why `App` (not a feature) holds `applicationDraft`,
`cameFromApply`, and `cameFromSection`.

---

## 7. Shared conventions

- **Brand colors** come from [`lib/constants.js`](src/lib/constants.js):
  `MAROON #72102a`, `GOLD #c9a84c`, `CREAM #faf8f5`. Import these rather than
  hardcoding hex values. *(Note: the modals still inline these constants
  locally; migrating them to `lib/constants` is a nice cleanup.)*
- **Static content** lives in [`data/jobs.js`](src/data/jobs.js). This is the
  seam where a real backend/API will plug in — components import from here, not
  from inline literals.
- **Fonts**: `'Playfair Display'` (serif headings) and `'Inter'` (body), applied
  via inline `fontFamily`.

---

## 8. Running the project

> **Setup quirk:** `node_modules` currently lives in `frontend/my-react-app/`,
> but the actual app root (with `index.html`, `vite.config.js`, `package.json`)
> is `frontend/`. Run a fresh install at the real root so the scripts resolve:

```bash
cd careerpage/frontend
npm install          # installs into frontend/node_modules
npm run dev          # start Vite dev server
npm run build        # production build → dist/
npm run lint         # eslint
npm run preview      # preview the production build
```

### Backend

`lib/keepAwake.js` pings `https://career-page-ksip.onrender.com` every 10s to
keep the free Render instance warm. The `careerpage/backend/` directory exists
but is currently empty — the API is not yet implemented.

---

## 9. Known issues / cleanup backlog

- **CandidateDashboard.jsx** — split into per-tab components (see §5).
- **Pre-existing ESLint errors** in `LoginModal.jsx` (`setState` synchronously
  in an effect) and `CandidateDashboard.jsx` (several unused vars,
  `no-unexpected-multiline`). These predate the refactor.
- **Duplicated theme constants** inside the modals — migrate to
  `lib/constants.js`.
- **`ImageWithFallback.jsx`** is currently unused (a leftover from the Figma
  export) and is written as transpiled `React.createElement` calls rather than
  JSX; rewrite or remove if not needed.
- **No tests** and **no router** yet.
```
