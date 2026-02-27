-- Create 'clients' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('clients', 'clients', true) 
ON CONFLICT (id) DO NOTHING;

-- Create 'leads' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('leads', 'leads', true) 
ON CONFLICT (id) DO NOTHING;

-- Policies for 'clients' bucket
CREATE POLICY "Public Access Clients" ON storage.objects FOR SELECT USING ( bucket_id = 'clients' );
CREATE POLICY "Auth Upload Clients" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'clients' );
CREATE POLICY "Auth Update Clients" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'clients' );
CREATE POLICY "Auth Delete Clients" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'clients' );

-- Policies for 'leads' bucket
CREATE POLICY "Public Access Leads" ON storage.objects FOR SELECT USING ( bucket_id = 'leads' );
CREATE POLICY "Auth Upload Leads" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'leads' );
CREATE POLICY "Auth Update Leads" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'leads' );
CREATE POLICY "Auth Delete Leads" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'leads' );
