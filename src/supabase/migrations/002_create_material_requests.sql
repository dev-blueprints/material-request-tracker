create table if not exists material_requests (
    id uuid default gen_random_uuid () primary key,
    project_id uuid references projects (id) on delete set null,
    material_name text not null,
    quantity numeric not null check (quantity > 0),
    unit text not null,
    status text not null default 'pending' check (
        status in (
            'pending',
            'approved',
            'rejected',
            'fulfilled'
        )
    ),
    priority text not null default 'medium' check (
        priority in (
            'low',
            'medium',
            'high',
            'urgent'
        )
    ),
    requested_by uuid references auth.users (id) not null,
    company_id uuid not null,
    notes text,
    requested_at timestamptz default now()
);

alter table material_requests enable row level security;