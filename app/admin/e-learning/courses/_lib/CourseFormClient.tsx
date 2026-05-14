'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/app/components/atoms/Button'
import { Input } from '@/app/components/atoms/Input'
import { Textarea } from '@/app/components/atoms/Textarea'
import { Switch } from '@/app/components/atoms/Switch'
import { Label } from '@/app/components/atoms/Label'
import { Select } from '@/app/components/molecules/Select'
import { FormField } from '@/app/components/molecules/FormField'
import { FormSection } from '@/app/components/molecules/FormSection'
import {
  createCourseAction,
  softDeleteCourseAction,
  updateCourseAction,
  type UpsertCourseInput,
  type UpsertCourseResult,
} from '../_actions/upsert-course'

/**
 * C006/C007 コース新規作成・編集の共通フォーム（Client Component）。
 *
 * 設計：
 * - 基本情報のみ Phase 3 の今回スコープ
 * - カリキュラム / 資料タブは C008 で詳細実装（現状は「コース作成後に編集画面のタブで追加」案内）
 * - is_free=true の場合は price / stripe_price_id を無効化
 * - 編集モード時は論理削除ボタンを表示
 */

const SLUG_HINT = '英数字とハイフン（例：ai-foundation）'

export type CourseFormCategoryOption = { value: string; label: string }

export interface CourseFormClientProps {
  mode: 'create' | 'edit'
  /** 編集モード時のコース ID（mode='edit' 必須）。 */
  courseId?: string
  initial: UpsertCourseInput
  categories: CourseFormCategoryOption[]
}

const ERROR_MESSAGE: Record<string, string> = {
  UNAUTHORIZED: 'セッションが切れています。再ログインしてください。',
  FORBIDDEN: '権限がありません。',
  VALIDATION_ERROR: '入力内容に不備があります。',
  CONFLICT_SLUG: 'このスラッグは既に使われています。',
  CONFLICT_STRIPE_PRICE: 'この Stripe Price ID は既に使われています。',
  DB_ERROR: '保存に失敗しました。時間を置いて再度お試しください。',
}

export function CourseFormClient({
  mode,
  courseId,
  initial,
  categories,
}: CourseFormClientProps) {
  const router = useRouter()
  const [values, setValues] = React.useState<UpsertCourseInput>(initial)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const result: UpsertCourseResult =
        mode === 'create'
          ? await createCourseAction(values)
          : await updateCourseAction(courseId as string, values)

      if (result.success === true) {
        // 編集画面に遷移（編集モードは現在の画面に留まる）
        if (mode === 'create') {
          router.push(`/admin/e-learning/courses/${result.course_id}/edit?created=1`)
          return
        }
        router.refresh()
      } else {
        setError(result.message ?? ERROR_MESSAGE[result.code] ?? '保存に失敗しました')
      }
    } catch (err) {
      console.error('[c006/c007] submit error', err)
      setError('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleSoftDelete = async () => {
    if (!courseId) return
    const confirmed = window.confirm(
      'このコースを論理削除しますか？（公開も自動的に解除されます）',
    )
    if (!confirmed) return

    setDeleting(true)
    setError(null)
    try {
      const result = await softDeleteCourseAction(courseId)
      if (result.success === false) {
        setError(ERROR_MESSAGE[result.code] ?? '削除に失敗しました')
      }
      // 成功時は Server Action 内で redirect される
    } catch (err) {
      console.error('[c007] soft delete error', err)
      setError('削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  const update = <K extends keyof UpsertCourseInput>(key: K, value: UpsertCourseInput[K]) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FormSection title="基本情報" description="コース概要とカテゴリを設定します。">
        <FormField label="タイトル" htmlFor="title" required>
          <Input
            id="title"
            value={values.title}
            onChange={e => update('title', e.target.value)}
            maxLength={200}
            required
          />
        </FormField>
        <FormField label="スラッグ" htmlFor="slug" required helpText={SLUG_HINT}>
          <Input
            id="slug"
            value={values.slug}
            onChange={e => update('slug', e.target.value)}
            maxLength={100}
            required
          />
        </FormField>
        <FormField label="カテゴリ" htmlFor="category_id" required>
          <Select
            value={values.category_id}
            onValueChange={v => update('category_id', v)}
            options={categories}
            placeholder="カテゴリを選択"
          />
        </FormField>
        <FormField label="説明" htmlFor="description">
          <Textarea
            id="description"
            value={values.description ?? ''}
            onChange={e => update('description', e.target.value)}
            rows={4}
          />
        </FormField>
        <FormField label="サムネイル URL" htmlFor="thumbnail_url">
          <Input
            id="thumbnail_url"
            type="url"
            value={values.thumbnail_url ?? ''}
            onChange={e => update('thumbnail_url', e.target.value)}
          />
        </FormField>
      </FormSection>

      <FormSection title="価格" description="無料／有料を切り替えます。">
        <FormField label="無料コース" htmlFor="is_free">
          <Switch
            checked={values.is_free}
            onCheckedChange={next => update('is_free', next)}
          />
        </FormField>
        <FormField label="価格（円・税込）" htmlFor="price" required={!values.is_free}>
          <Input
            id="price"
            type="number"
            min={0}
            value={values.price ?? ''}
            onChange={e => update('price', e.target.value ? Number(e.target.value) : null)}
            disabled={values.is_free}
          />
        </FormField>
        <FormField
          label="Stripe Price ID"
          htmlFor="stripe_price_id"
          helpText="Stripe Dashboard で作成した price_xxx 形式 ID"
        >
          <Input
            id="stripe_price_id"
            value={values.stripe_price_id ?? ''}
            onChange={e => update('stripe_price_id', e.target.value)}
            disabled={values.is_free}
            maxLength={64}
          />
        </FormField>
      </FormSection>

      <FormSection title="公開設定">
        <FormField label="公開する" htmlFor="is_published">
          <Switch
            checked={values.is_published}
            onCheckedChange={next => update('is_published', next)}
          />
        </FormField>
        <FormField label="注目フラグ" htmlFor="is_featured" helpText="LP に表示されます">
          <Switch
            checked={values.is_featured}
            onCheckedChange={next => update('is_featured', next)}
          />
        </FormField>
      </FormSection>

      {mode === 'edit' && (
        <aside className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="text-foreground">カリキュラム・資料の編集について</p>
          <p className="mt-1">
            章・動画・資料の追加／並び替えは別タスク（C008）で詳細実装予定です。Phase 3 では Supabase
            ダッシュボードまたは dev-seed SQL を併用してください。
          </p>
        </aside>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <Button asChild variant="outline" type="button">
          <Link href="/admin/e-learning/courses">一覧に戻る</Link>
        </Button>
        <div className="flex items-center gap-2">
          {mode === 'edit' && (
            <Button
              type="button"
              variant="danger"
              onClick={handleSoftDelete}
              disabled={saving || deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  削除中...
                </>
              ) : (
                '論理削除'
              )}
            </Button>
          )}
          <Button type="submit" disabled={saving || deleting}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                保存中...
              </>
            ) : mode === 'create' ? (
              '作成する'
            ) : (
              '保存する'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
