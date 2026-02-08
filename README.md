# TaskLog

App for creating tasks, logging progress, favorites, and weekly stats. UI is in Ukrainian.

## Features

- **Tasks** — create, edit, delete with difficulty levels (Easy / Medium / Hard) and statuses
- **Progress logs** — log time in minutes with notes
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
2. In SQL Editor run:

```sql
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  level text not null default 'easy',
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  user_id text
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

3. Enable Realtime for `skills` and `skill_logs`
4. If using RLS — add policies or disable it for prototyping

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
├── composables/     # useSkills, useLogs, useFavorites, useToasts
├── pages/           # Pages (index, skills/new, skills/[id])
├── plugins/         # Fancybox etc.
└── types/           # TypeScript types
```

## License

Private project.
