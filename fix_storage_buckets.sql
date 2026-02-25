-- Nastavenie "documents" bucketu (bez obmedzení na typ súboru, max 50MB)
UPDATE storage.buckets
SET allowed_mime_types = NULL, 
    file_size_limit = 52428800 -- 50 MB v bytoch
WHERE name = 'documents';

-- Nastavenie "products" bucketu (povolené všemožné formáty obrázkov a videí, max 50MB)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf'], 
    file_size_limit = 52428800 -- 50 MB v bytoch
WHERE name = 'products';
