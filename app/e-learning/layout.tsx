import * as React from 'react'
import MainLayout from '@/app/components/MainLayout'

/**
 * E ラーニング共通レイアウト（Atomic Design / templates 上位の Next.js App Router layout）
 *
 * 起点：
 * - docs/wbs/phase2.md P2-L-01「会員側 Header / Footer 整備」
 * - docs/frontend/page-templates.md § 0 共通レイアウト（既存 MainLayout の踏襲）
 * - docs/frontend/design-system/ng-patterns.md §12 line 101
 *   「既存 Header / MobileHeader / Sidebar / Footer を Eラーニングローカルで複製しない」
 *
 * 設計方針：
 * - `app/e-learning/**` 配下のページに共通ヘッダー・サイドバー・フッターを適用する
 * - 既存 `app/components/MainLayout.tsx` をそのまま利用（ng-patterns §12 line 101 遵守）
 *
 * 認証ガード：
 * - `/e-learning` は middleware（既存）で `auth.users` セッションを要件としていないため
 *   未ログイン閲覧も許容（LP / 公開コンテンツ表示）
 * - 視聴権限は Server Component 内の access-service で判定（B005/B007）
 *
 * メモ：
 * - 本 layout は Server Component。MainLayout は 'use client' のため
 *   children を server で取得した上で client レイアウト内に流し込む形になる
 * - 配下ページが Server Component / Client Component どちらでも問題なく機能する
 */
export default function ELearningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
