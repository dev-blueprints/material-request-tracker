create table if not exists projects (
    id uuid default gen_random_uuid () primary key,
    name text not null,
    location text,
    company_id uuid not null,
    join_code text,
    created_at timestamptz default now()
);

alter table projects enable row level security;