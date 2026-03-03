-- ═══════════════════════════════════════════════════════════════
-- Supabase Storage Bucket Policies
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- AVATARS bucket policies
-- ────────────────────────────────────────────────────────────────

-- Anyone can view avatars (public bucket)
CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatars
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Users can update/replace their own avatars
CREATE POLICY "Users can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- Users can delete their own avatars
CREATE POLICY "Users can delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');

-- ────────────────────────────────────────────────────────────────
-- THUMBNAILS bucket policies
-- ────────────────────────────────────────────────────────────────

CREATE POLICY "Public thumbnail access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can update thumbnails"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can delete thumbnails"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'thumbnails');

-- ────────────────────────────────────────────────────────────────
-- ATTACHMENTS bucket policies
-- ────────────────────────────────────────────────────────────────

CREATE POLICY "Public attachment access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can update attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can delete attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'attachments');

-- ────────────────────────────────────────────────────────────────
-- VIDEOS bucket policies (private — only owners)
-- ────────────────────────────────────────────────────────────────

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated users can read videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'videos');
