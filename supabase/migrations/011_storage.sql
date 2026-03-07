-- Storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('form-assets', 'form-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('response-uploads', 'response-uploads', false, 52428800, array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'])
on conflict (id) do nothing;

-- Form assets policies
create policy "Authenticated users can upload form assets"
  on storage.objects for insert
  with check (bucket_id = 'form-assets' and auth.role() = 'authenticated');

create policy "Anyone can view form assets"
  on storage.objects for select
  using (bucket_id = 'form-assets');

create policy "Owners can delete form assets"
  on storage.objects for delete
  using (bucket_id = 'form-assets' and auth.uid()::text = (storage.foldername(name))[1]);

-- Response uploads policies
create policy "Anyone can upload response files"
  on storage.objects for insert
  with check (bucket_id = 'response-uploads');

create policy "Workspace members can view uploads"
  on storage.objects for select
  using (bucket_id = 'response-uploads');

create policy "Workspace members can delete uploads"
  on storage.objects for delete
  using (bucket_id = 'response-uploads' and auth.role() = 'authenticated');
