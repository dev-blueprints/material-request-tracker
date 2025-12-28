-- Attach company_id to a test user
update auth.users
set raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb)
  || '{"company_id": "550e8400-e29b-41d4-a716-446655440000"}'::jsonb
where id = '3296ddcb-a5d6-446e-9dcb-fd97f8288362';

-- Create project
insert into
    projects (name, location, company_id)
values (
        'Skyline Tower',
        'Downtown',
        '550e8400-e29b-41d4-a716-446655440000'
    );

-- Create request
insert into
    material_requests (
        material_name,
        quantity,
        unit,
        status,
        priority,
        requested_by,
        company_id
    )
values (
        'Ready-mix Concrete',
        50,
        'pcs',
        'pending',
        'high',
        '3296ddcb-a5d6-446e-9dcb-fd97f8288362',
        '550e8400-e29b-41d4-a716-446655440000'
    );