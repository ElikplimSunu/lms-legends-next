-- ═══════════════════════════════════════════════════════════════
-- Supabase Storage Bucket Policies (idempotent — safe to re-run)
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
-- Drop existing policies (if any) so we can recreate them cleanly
-- ────────────────────────────────────────────────────────────────

DO $$ BEGIN
  -- Avatars
  DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;
  -- Thumbnails
  DROP POLICY IF EXISTS "Public thumbnail access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update thumbnails" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete thumbnails" ON storage.objects;
  -- Attachments
  DROP POLICY IF EXISTS "Public attachment access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update attachments" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete attachments" ON storage.objects;
  -- Videos
  DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can read videos" ON storage.objects;
  -- Lesson attachments table
  DROP POLICY IF EXISTS "Authenticated users can insert lesson attachments" ON lesson_attachments;
  DROP POLICY IF EXISTS "Lesson attachments are readable" ON lesson_attachments;
  DROP POLICY IF EXISTS "Authenticated users can delete lesson attachments" ON lesson_attachments;
END $$;

-- ────────────────────────────────────────────────────────────────
-- AVATARS bucket policies
-- ────────────────────────────────────────────────────────────────

CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

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
-- VIDEOS bucket policies (private — only authenticated)
-- ────────────────────────────────────────────────────────────────

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated users can read videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'videos');

-- ────────────────────────────────────────────────────────────────
-- LESSON_ATTACHMENTS table RLS policies
-- ────────────────────────────────────────────────────────────────

CREATE POLICY "Authenticated users can insert lesson attachments"
  ON lesson_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Lesson attachments are readable"
  ON lesson_attachments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can delete lesson attachments"
  ON lesson_attachments FOR DELETE
  TO authenticated
  USING (true);

-- ────────────────────────────────────────────────────────────────
-- LESSON_PROGRESS table RLS policies (if missing)
-- ────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lesson_progress' AND policyname = 'Users manage own progress'
  ) THEN
    CREATE POLICY "Users manage own progress"
      ON lesson_progress FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
