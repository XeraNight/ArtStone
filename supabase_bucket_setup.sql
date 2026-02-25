-- Create the bucket if it does not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO NOTHING;

-- Policies for public reading
CREATE POLICY "Public Access" 
    ON storage.objects FOR SELECT 
    USING ( bucket_id = 'products' );

-- Policies for authenticated uploading
CREATE POLICY "Auth Upload" 
    ON storage.objects FOR INSERT 
    TO authenticated 
    WITH CHECK ( bucket_id = 'products' );

-- Policies for authenticated updating
CREATE POLICY "Auth Update" 
    ON storage.objects FOR UPDATE 
    TO authenticated 
    USING ( bucket_id = 'products' );

-- Policies for authenticated deleting
CREATE POLICY "Auth Delete" 
    ON storage.objects FOR DELETE 
    TO authenticated 
    USING ( bucket_id = 'products' );
