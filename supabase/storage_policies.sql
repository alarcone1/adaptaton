-- Create the storage bucket 'evidence-media' if it doesn't exist
insert into storage.buckets (id, name, public)
values ('evidence-media', 'evidence-media', true)
on conflict (id) do nothing;

-- Enable RLS (although it's on by default for storage.objects, good practice to be explicit if we were altering table)
-- storage.objects is in a separate schema, usually handled by Supabase Storage API, but policies apply.

-- Policy: Allow authenticated users to upload files to 'evidence-media'
create policy "Authenticated users can upload evidence media"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'evidence-media' );

-- Policy: Allow public/anyone to view files in 'evidence-media' (since it's a public bucket)
create policy "Anyone can view evidence media"
on storage.objects for select
to public
using ( bucket_id = 'evidence-media' );

-- Policy: Allow users to update/delete their own files? 
-- For now, maybe just upload. If we need delete, we can add it.
-- create policy "Users can update own evidence media" ...
