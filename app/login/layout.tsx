export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ログインページ用のレイアウト
  // 親の/admin/layout.tsxの認証チェックを継承しないようにする
  return <>{children}</>
}