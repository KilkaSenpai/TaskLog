# TaskLog

App for creating tasks, logging progress, favorites, and weekly stats. UI is in Ukrainian.

## Features

- **Auth** — Supabase Auth: login and sign-up modals (email or username + password), Ukrainian UI. Forgot password (email → link → set new password on `/reset-password`, then sign in). Display name at registration. Toasts by type (success / danger / info–warning with icons and borders).
- **Tasks** — create, edit, delete with difficulty levels (Easy / Medium / Hard), statuses, and time estimate
- **Progress logs** — log time in minutes with notes; progress bar when estimate is set
- **Favorites** — add tasks to favorites (heart icon), “Favorites only” filter
- **Weekly stats** — minutes per week, active and total task counts
- **Realtime** — instant updates on changes (Supabase)
- **Tips** — modal with quick tips on the edit page

## Stack

- [Nuxt 4](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- [Supabase](https://supabase.com/) — database, realtime
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Fancybox](https://fancyapps.com/) — modals

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
  estimate_minutes int default null
);

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
| `/` | Task list, filters, weekly stats |
| `/reset-password` | Set new password (from email link); then redirect to login |
| `/skills/new` | Create new task |
| `/skills/:id` | Details, edit, logs, favorites, tips |

## Project structure

```
app/
├── assets/          # CSS
├── components/      # Vue components
│   ├── ui/          # UI components (Button, Input, Select, Card...)
│   ├── SkillCard.vue
│   ├── FilterBar.vue
│   ├── StatusBadge.vue
│   ├── WeeklySummary.vue
│   └── ...
├── composables/     # useAuth, useSkills, useLogs, useFavorites, useToasts, useSupabase
├── pages/           # Pages (index, reset-password, skills/new, skills/[id])
├── plugins/         # Fancybox etc.
└── types/           # TypeScript types
```

## License

Private project.
