create table if not exists companies (
    id uuid default gen_random_uuid () primary key,
    name text not null,
    invite_code text unique not null, -- Short code like 'BUILD-123'
    created_at timestamp
    with
        time zone default now()
);