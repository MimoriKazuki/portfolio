-- 既存のストレージバケットを確認
SELECT id, name, public, created_at FROM storage.buckets
WHERE id IN ('column-thumbnails', 'document-thumbnails', 'documents');

-- 既存のストレージポリシーを確認
SELECT 
  policyname,
  schemaname,
  tablename,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;