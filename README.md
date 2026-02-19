# TaskLog

App for creating tasks, logging progress, favorites, and weekly stats. UI is in Ukrainian.

## Features

- **Auth** — Supabase Auth: login and sign-up modals (email or username + password), Ukrainian UI. Forgot password (email → link → set new password on `/reset-password`, then sign in). Display name at registration. Toasts by type (success / danger / info–warning with icons and borders); toasts styled for dark theme. Logout redirects to home.
- **Guest landing** — unauthenticated users see a landing page (hero + CTAs); task list and app features are hidden until login/register. Auth middleware protects `/skills/new` and `/skills/[id]` and redirects guests to `/`.
- **Tasks** — create, edit, delete with difficulty levels (Easy / Medium / Hard), statuses, and time estimate
- **Task links** — link tasks to each other from the task detail page: «Блокує» / «Заблокована», «Пов’язана з», «Дублікат» / «Дубльована». Add or remove links between existing tasks; linked tasks are listed on the detail page.
- **Progress logs** — log time in minutes with notes; progress bar when estimate is set (primary blue fill; dark track on task edit page)
- **In-app timer** — start/stop tracking from the task page or from a “Старт таймер” button on each task card; one active timer at a time; when running, a bar under the header shows task name and elapsed time (aligned with main content); stop from the bar saves time to progress; state persisted in `localStorage`
- **Favorites** — add tasks to favorites (heart icon), “Favorites only” filter
- **Weekly stats** — minutes per week, active and total task counts
- **Realtime** — instant updates on changes (Supabase)
- **Tips** — modal with quick tips on the edit page
- **Theme** — light / dark mode with header toggle; preference saved in `localStorage` and optional system `prefers-color-scheme` on first visit
- **Search** — debounced search by name/description (350 ms) so you can type full words without requests on every keystroke
- **Skeleton loading** — softer skeleton colors; in dark mode skeletons are dimmer so they don’t overpower the UI
- **AI assistant (Groq)** — сформулювати назву та опис задачі з твоїх вводних (optional `GROQ_API_KEY`)

## Stack

- [Nuxt 4](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- [Supabase](https://supabase.com/) — database, realtime
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Fancybox](https://fancyapps.com/) — modals
- [Groq](https://groq.com/) — LLM для формулювання задачі з вводів користувача (безкоштовний tier)

## Getting started

### 1. Install

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In SQL Editor run the tables (skills, skill_logs, favorites):

```sql
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  level text not null default 'easy',
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  user_id text,
  estimate_minutes int default null,
  parent_id uuid references skills(id) on delete restrict
);
create index if not exists idx_skills_parent_id on skills(parent_id);

create table if not exists skill_logs (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skills(id) on delete cascade,
  note text,
  minutes int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skills(id) on delete cascade,
  user_id text not null
);

create table if not exists skill_links (
  id uuid primary key default gen_random_uuid(),
  from_skill_id uuid not null references skills(id) on delete cascade,
  to_skill_id uuid not null references skills(id) on delete cascade,
  link_type text not null check (link_type in ('blocks', 'relates_to', 'duplicates')),
  created_at timestamptz not null default now(),
  unique(from_skill_id, to_skill_id, link_type)
);
create index if not exists idx_skill_links_from on skill_links(from_skill_id);
create index if not exists idx_skill_links_to on skill_links(to_skill_id);
```

3. **Auth: create `profiles` table** (required for login/register). Run in SQL Editor:

```sql
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);
```

4. In Supabase Dashboard: enable **Authentication** (Email provider). In **URL Configuration** add your reset-password URL to **Redirect URLs** (e.g. `http://localhost:3000/reset-password` and your production URL). Optionally customize **Email** templates (Confirm signup, Reset password) in Ukrainian. Enable Realtime for `skills` and `skill_logs`. If using RLS — add policies for `skills`, `skill_logs`, `favorites`, and `profiles` (e.g. users can read/write own rows).

For existing projects — add `estimate_minutes` to skills if missing:

```sql
ALTER TABLE skills
ADD COLUMN IF NOT EXISTS estimate_minutes integer DEFAULT null;
```

For task links (blocks, relates to, duplicates), create `skill_links`:

```sql
create table if not exists skill_links (
  id uuid primary key default gen_random_uuid(),
  from_skill_id uuid not null references skills(id) on delete cascade,
  to_skill_id uuid not null references skills(id) on delete cascade,
  link_type text not null check (link_type in ('blocks', 'relates_to', 'duplicates')),
  created_at timestamptz not null default now(),
  unique(from_skill_id, to_skill_id, link_type)
);
create index if not exists idx_skill_links_from on skill_links(from_skill_id);
create index if not exists idx_skill_links_to on skill_links(to_skill_id);
```

If `profiles` already exists without `email`, add the column:

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text;
```

### 3. Environment variables

Create `.env` or `.env.local`:

```env
NUXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional: for AI “improve description” and “suggest subtasks” (get key at https://console.groq.com)
GROQ_API_KEY=your_groq_api_key
```

### 4. Run

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run generate` | Static export (SSG) |
| `npm run preview` | Preview production build |

## Pages

| Path | Description |
|------|-------------|
| `/` | Landing for guests (hero + login/register); task list and dashboard for logged-in users |
| `/reset-password` | Set new password (from email link); then redirect to login |
| `/skills/new` | Create new task (auth required; redirects to `/` if not logged in) |
| `/skills/:id` | Task details, edit, related tasks (links), timer, logs, favorites, tips (auth required; redirects to `/` if not logged in) |

## Project structure

```
app/
├── assets/          # CSS (themes, skeleton, toasts, etc.)
├── components/      # Vue components
│   ├── ui/          # UI components (Button, Input, Select, Card...)
│   ├── LandingView.vue
│   ├── SkillCard.vue
│   ├── FilterBar.vue
│   ├── StatusBadge.vue
│   ├── WeeklySummary.vue
│   └── ...
├── composables/     # useAuth, useSkills, useSkillLinks, useLogs, useFavorites, useToasts, useSupabase, useTaskTimer, useAiAssistant
├── middleware/      # auth.ts — protects /skills/new and /skills/[id]
├── pages/           # Pages (index, reset-password, skills/new, skills/[id])
├── plugins/         # auth.client, Fancybox
└── types/           # TypeScript types
```

## License

Private project.
