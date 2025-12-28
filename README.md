# Material Tracker

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```

## Database Migration

Run the following SQL scripts in your Supabase SQL Editor in order:

1. `src/supabase/migrations/001_create_projects.sql`
2. `src/supabase/migrations/002_create_material_requests.sql`
3. `src/supabase/migrations/003_create_companies.sql`
4. `src/supabase/migrations/004_rls_policies.sql`
5. `src/supabase/migrations/005_seed_dev_data.sql`
