-- 動画制作カテゴリのプロジェクトデータを確認
SELECT 
  id,
  title,
  category,
  technologies,
  duration,
  live_url,
  created_at
FROM projects
WHERE category = 'video'
ORDER BY created_at DESC;

-- 全カテゴリのプロジェクトで技術が登録されているものを確認
SELECT 
  category,
  COUNT(*) as total_projects,
  COUNT(CASE WHEN technologies IS NOT NULL AND array_length(technologies, 1) > 0 THEN 1 END) as projects_with_tech
FROM projects
GROUP BY category
ORDER BY category;