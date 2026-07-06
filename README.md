# OyaPlan 🇳🇬
**Find where to go. Know what it'll cost. In seconds.**

OyaPlan is a mobile-first web application that eliminates chaotic group-chat planning by generating decisive, cost-transparent outing plans for Lagos squads.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (Postgres)
- **Deployment:** Vercel

## How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd oyaplan
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Initialize Database:**
   Run the SQL in `supabase/migrations/0001_create_tables.sql` and `supabase/seed.sql` in your Supabase SQL Editor.

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Add your Supabase environment variables in the Vercel project settings.
4. Deploy!

## Core Matching Engine
The engine uses a deterministic algorithm to rank Lagos spots based on:
- Start area proximity (simulated transport cost).
- Vibe matching.
- Budget constraints (Transport <= 35% of total budget).
- Group size food cost calculation (+10% buffer).

## Documentation

See [`docs/README.md`](docs/README.md) for the full documentation map (product strategy, architecture decisions, and the source-of-truth hierarchy between them) and [`CLAUDE.md`](CLAUDE.md) for the engineering charter.

---
Built by OyaPlan Team.
