/**
 * サーバーとクライアントで一貫した日付フォーマットを提供
 * toLocaleDateStringはロケール設定により結果が異なる可能性があるため、
 * 手動でフォーマットすることでハイドレーションエラーを防ぐ
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}
