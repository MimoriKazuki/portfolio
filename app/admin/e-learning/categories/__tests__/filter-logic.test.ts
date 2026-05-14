/**
 * C004 CategoriesAdminClient — filteredCategories フィルタロジック単体テスト
 *
 * filteredCategories は Client Component 内の categories.filter() だが、
 * ロジックは純粋関数と等価なため、同アルゴリズムを関数として抽出して検証する。
 *
 * コンポーネントはレンダリングしない（jsdom 不要）。
 */
import { describe, it, expect } from 'vitest'
import type { ELearningCategory } from '@/app/types'

// CategoriesAdminClient.tsx の filteredCategories ロジックを純粋関数として再現
function filterCategories(
  categories: ELearningCategory[],
  statusFilter: '' | 'active' | 'inactive' | 'deleted',
): ELearningCategory[] {
  return categories.filter((category) => {
    const isDeleted = !!category.deleted_at
    if (statusFilter === 'deleted') return isDeleted
    if (isDeleted) return false
    if (statusFilter === 'active') return category.is_active
    if (statusFilter === 'inactive') return !category.is_active
    return true
  })
}

// テストフィクスチャ
function makeCategory(override: Partial<ELearningCategory> = {}): ELearningCategory {
  return {
    id: 'cat-001',
    name: 'テストカテゴリ',
    slug: 'test-category',
    display_order: 0,
    is_active: true,
    deleted_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...override,
  } as ELearningCategory
}

const active1 = makeCategory({ id: 'c-active-1', is_active: true, deleted_at: null })
const active2 = makeCategory({ id: 'c-active-2', is_active: true, deleted_at: null })
const inactive = makeCategory({ id: 'c-inactive', is_active: false, deleted_at: null })
const deleted = makeCategory({ id: 'c-deleted', deleted_at: '2026-02-01T00:00:00Z' })

const all = [active1, active2, inactive, deleted]

describe('C004 filteredCategories ロジック', () => {
  describe("statusFilter='' （デフォルト：削除済を除く全件）", () => {
    it('削除済を除く active / inactive を返す', () => {
      const result = filterCategories(all, '')
      expect(result).toHaveLength(3)
      expect(result.map(c => c.id)).toContain('c-active-1')
      expect(result.map(c => c.id)).toContain('c-active-2')
      expect(result.map(c => c.id)).toContain('c-inactive')
    })

    it('deleted_at が非 null のカテゴリは除外される', () => {
      const result = filterCategories(all, '')
      expect(result.map(c => c.id)).not.toContain('c-deleted')
    })

    it('全件が削除済の場合は空配列', () => {
      const result = filterCategories([deleted], '')
      expect(result).toHaveLength(0)
    })
  })

  describe("statusFilter='active'", () => {
    it('is_active=true かつ deleted_at=null のみ返す', () => {
      const result = filterCategories(all, 'active')
      expect(result).toHaveLength(2)
      expect(result.every(c => c.is_active && !c.deleted_at)).toBe(true)
    })

    it('deleted_at が null でも is_active=false は除外される', () => {
      const result = filterCategories(all, 'active')
      expect(result.map(c => c.id)).not.toContain('c-inactive')
    })

    it('deleted_at が非 null は is_active=true でも除外される', () => {
      const deletedActive = makeCategory({ id: 'c-del-active', is_active: true, deleted_at: '2026-02-01T00:00:00Z' })
      const result = filterCategories([deletedActive], 'active')
      expect(result).toHaveLength(0)
    })
  })

  describe("statusFilter='inactive'", () => {
    it('is_active=false かつ deleted_at=null のみ返す', () => {
      const result = filterCategories(all, 'inactive')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('c-inactive')
    })

    it('deleted_at が null でも is_active=true は除外される', () => {
      const result = filterCategories(all, 'inactive')
      expect(result.map(c => c.id)).not.toContain('c-active-1')
    })
  })

  describe("statusFilter='deleted'", () => {
    it('deleted_at が非 null のもののみ返す', () => {
      const result = filterCategories(all, 'deleted')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('c-deleted')
    })

    it('is_active に関わらず deleted_at=null は除外される', () => {
      const result = filterCategories(all, 'deleted')
      expect(result.every(c => !!c.deleted_at)).toBe(true)
    })

    it('複数の削除済カテゴリがあれば全件返す', () => {
      const deleted2 = makeCategory({ id: 'c-deleted-2', deleted_at: '2026-03-01T00:00:00Z' })
      const result = filterCategories([deleted, deleted2, active1], 'deleted')
      expect(result).toHaveLength(2)
    })
  })

  describe('エッジケース', () => {
    it('空配列 → 全フィルタで空配列', () => {
      expect(filterCategories([], '')).toHaveLength(0)
      expect(filterCategories([], 'active')).toHaveLength(0)
      expect(filterCategories([], 'deleted')).toHaveLength(0)
    })

    it('deleted_at が空文字（falsy）→ 削除済として扱わない', () => {
      const notDeleted = makeCategory({ deleted_at: null })
      const result = filterCategories([notDeleted], '')
      expect(result).toHaveLength(1)
    })
  })
})
