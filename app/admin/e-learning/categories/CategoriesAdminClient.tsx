'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { ELearningCategory } from '@/app/types'

interface CategoriesAdminClientProps {
  categories: ELearningCategory[]
}

export default function CategoriesAdminClient({ categories: initialCategories }: CategoriesAdminClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState(initialCategories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '', description: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', slug: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [movingId, setMovingId] = useState<string | null>(null)

  // スラッグを自動生成（日本語対応）
  const generateSlug = (name: string) => {
    // まず英数字とハイフンのみを抽出
    const asciiSlug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // 英数字が含まれていればそれを使用、なければタイムスタンプベースのスラッグを生成
    if (asciiSlug) {
      return asciiSlug
    }
    // 日本語名の場合はcategory-タイムスタンプで生成
    return `category-${Date.now()}`
  }

  // 新規カテゴリ追加
  const handleAdd = async () => {
    if (!newForm.name.trim()) {
      alert('カテゴリ名を入力してください')
      return
    }

    setLoading(true)
    try {
      const slug = newForm.slug || generateSlug(newForm.name)
      const maxOrder = Math.max(...categories.map(c => c.display_order), -1)

      const { data, error } = await supabase
        .from('e_learning_categories')
        .insert({
          name: newForm.name,
          slug: slug,
          description: newForm.description || null,
          display_order: maxOrder + 1,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setCategories([...categories, data])
      setNewForm({ name: '', slug: '', description: '' })
      setIsAdding(false)
      router.refresh()
    } catch (error) {
      console.error('Error adding category:', error)
      alert('カテゴリの追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // カテゴリ編集開始
  const startEdit = (category: ELearningCategory) => {
    setEditingId(category.id)
    setEditForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    })
  }

  // カテゴリ更新
  const handleUpdate = async () => {
    if (!editingId || !editForm.name.trim()) {
      alert('カテゴリ名を入力してください')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('e_learning_categories')
        .update({
          name: editForm.name,
          slug: editForm.slug,
          description: editForm.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId)

      if (error) throw error

      setCategories(categories.map(c =>
        c.id === editingId
          ? { ...c, name: editForm.name, slug: editForm.slug, description: editForm.description }
          : c
      ))
      setEditingId(null)
      router.refresh()
    } catch (error) {
      console.error('Error updating category:', error)
      alert('カテゴリの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // カテゴリ削除
  const handleDelete = async (id: string) => {
    if (!confirm('このカテゴリを削除しますか？関連するコンテンツのカテゴリは未設定になります。')) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('e_learning_categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCategories(categories.filter(c => c.id !== id))
      router.refresh()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('カテゴリの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 順序変更
  const moveCategory = async (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(c => c.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === categories.length - 1) return

    setMovingId(id)
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newCategories = [...categories]
    const [movedItem] = newCategories.splice(index, 1)
    newCategories.splice(newIndex, 0, movedItem)

    // display_orderを更新
    const updatedCategories = newCategories.map((c, i) => ({ ...c, display_order: i }))
    setCategories(updatedCategories)

    try {
      // 入れ替えた2つのカテゴリの順序を更新
      const updates = [
        { id: updatedCategories[index].id, display_order: index },
        { id: updatedCategories[newIndex].id, display_order: newIndex },
      ]

      for (const update of updates) {
        await supabase
          .from('e_learning_categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating order:', error)
      // エラー時は元に戻す
      setCategories(initialCategories)
    } finally {
      setMovingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/e-learning"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            eラーニング管理に戻る
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">カテゴリ管理</h1>
            <button
              onClick={() => setIsAdding(true)}
              disabled={isAdding}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              新規追加
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            カテゴリの追加・編集・並べ替えができます。並び順はユーザー画面のトップページのセクション表示順に反映されます。
          </p>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">新規カテゴリ追加</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="例: バイブコーディング入門"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スラッグ（URLに使用）
                </label>
                <input
                  type="text"
                  value={newForm.slug}
                  onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
                  placeholder="自動生成されます"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="カテゴリの説明（任意）"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setNewForm({ name: '', slug: '', description: '' })
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  追加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-md">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              カテゴリがありません。「新規追加」ボタンから追加してください。
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categories.map((category, index) => (
                <li key={category.id} className="p-4">
                  {editingId === category.id ? (
                    // 編集モード
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                      <input
                        type="text"
                        value={editForm.slug}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                        placeholder="スラッグ"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="説明（任意）"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={loading}
                          className="p-2 text-blue-600 hover:text-blue-800"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 表示モード
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveCategory(category.id, 'up')}
                          disabled={index === 0 || movingId !== null}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveCategory(category.id, 'down')}
                          disabled={index === categories.length - 1 || movingId !== null}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                      <GripVertical className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">
                          /{category.slug}
                          {category.description && (
                            <span className="ml-2">- {category.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          category.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {category.is_active ? '有効' : '無効'}
                        </span>
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 text-gray-500 hover:text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
