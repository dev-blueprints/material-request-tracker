create policy "projects_select_by_company"
on projects for select
using (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

create policy "requests_select_by_company"
on material_requests for select
using (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

create policy "requests_insert_by_company"
on material_requests for insert
with check (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

create policy "requests_update_by_company"
on material_requests for update
using (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

create policy "view_company_by_code" on companies for
select using (true);

create policy "create_project_authenticated" ON projects FOR
insert
    TO authenticated
with
    check (true);