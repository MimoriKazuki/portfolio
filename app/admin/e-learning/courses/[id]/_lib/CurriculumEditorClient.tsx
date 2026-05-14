'use client'

import * as React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/app/components/atoms/Badge'
import { Button } from '@/app/components/atoms/Button'
import { Input } from '@/app/components/atoms/Input'
import { Switch } from '@/app/components/atoms/Switch'
import { Textarea } from '@/app/components/atoms/Textarea'
import { FormField } from '@/app/components/molecules/FormField'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/molecules/Dialog'
import {
  createChapterAction,
  createVideoAction,
  deleteChapterAction,
  deleteVideoAction,
  reorderChaptersAction,
  reorderVideosAction,
  updateChapterTitleAction,
  updateVideoAction,
  type CurriculumResult,
  type VideoInput,
} from '../_actions/curriculum'
import type { CurriculumChapter } from './get-course-curriculum'

/**
 * C008 カリキュラム編集（章＋動画 DnD）— Client Component。
 *
 * 起点：
 * - docs/frontend/screens.md C008
 *
 * 機能：
 * - 章追加・章名編集（インライン）・章削除（確認 Dialog）・章順序入替（DnD）
 * - 章内動画追加（Dialog）・動画編集（Dialog）・動画削除（確認 Dialog）
 * - 動画 is_free 切替（インライン Switch）
 * - 動画順序入替（DnD・同章内のみ）
 *
 * DnD 方針：@dnd-kit/core + sortable・章レベル / 動画レベルそれぞれ独立 SortableContext
 */

const EMPTY_VIDEO_INPUT: VideoInput = {
  title: '',
  video_url: '',
  description: '',
  duration: '',
  is_free: false,
}

type VideoDialogState =
  | { mode: 'create'; chapterId: string }
  | { mode: 'edit'; chapterId: string; videoId: string; initial: VideoInput }
  | null

export interface CurriculumEditorClientProps {
  courseId: string
  chapters: CurriculumChapter[]
}

export function CurriculumEditorClient({ courseId, chapters: initial }: CurriculumEditorClientProps) {
  const [chapters, setChapters] = React.useState(initial)
  const [savingId, setSavingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [newChapterTitle, setNewChapterTitle] = React.useState('')
  const [creatingChapter, setCreatingChapter] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<
    | { kind: 'chapter'; id: string; title: string }
    | { kind: 'video'; id: string; title: string; chapterId: string }
    | null
  >(null)
  const [deleting, setDeleting] = React.useState(false)
  const [videoDialog, setVideoDialog] = React.useState<VideoDialogState>(null)
  const [videoForm, setVideoForm] = React.useState<VideoInput>(EMPTY_VIDEO_INPUT)
  const [savingVideo, setSavingVideo] = React.useState(false)

  React.useEffect(() => {
    setChapters(initial)
  }, [initial])

  React.useEffect(() => {
    if (videoDialog?.mode === 'edit') setVideoForm(videoDialog.initial)
    else setVideoForm(EMPTY_VIDEO_INPUT)
  }, [videoDialog])

  const handleAddChapter = async () => {
    const title = newChapterTitle.trim()
    if (!title) return
    setCreatingChapter(true)
    setError(null)
    try {
      const result = await createChapterAction(courseId, title)
      if (result.success === false) {
        setError(result.message ?? '章の追加に失敗しました')
      } else {
        setNewChapterTitle('')
      }
    } finally {
      setCreatingChapter(false)
    }
  }

  const handleRenameChapter = async (chapterId: string, title: string) => {
    setSavingId(chapterId)
    setError(null)
    try {
      const result = await updateChapterTitleAction(chapterId, courseId, title)
      if (result.success === false) setError(result.message ?? '章名の更新に失敗しました')
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError(null)
    try {
      let result: CurriculumResult
      if (deleteTarget.kind === 'chapter') {
        result = await deleteChapterAction(deleteTarget.id, courseId)
      } else {
        result = await deleteVideoAction(deleteTarget.id, courseId)
      }
      if (result.success === false) {
        setError(result.message ?? '削除に失敗しました')
      } else {
        setDeleteTarget(null)
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveVideo = async () => {
    if (!videoDialog) return
    setSavingVideo(true)
    setError(null)
    try {
      let result: CurriculumResult
      if (videoDialog.mode === 'create') {
        result = await createVideoAction(videoDialog.chapterId, courseId, videoForm)
      } else {
        result = await updateVideoAction(videoDialog.videoId, courseId, videoForm)
      }
      if (result.success === false) {
        setError(result.message ?? '動画の保存に失敗しました')
      } else {
        setVideoDialog(null)
      }
    } finally {
      setSavingVideo(false)
    }
  }

  const handleToggleVideoFree = async (
    chapterId: string,
    videoId: string,
    current: Pick<VideoInput, 'title' | 'video_url' | 'description' | 'duration'>,
    nextValue: boolean,
  ) => {
    setSavingId(videoId)
    setError(null)
    try {
      const result = await updateVideoAction(videoId, courseId, {
        ...current,
        is_free: nextValue,
      })
      if (result.success === false) setError(result.message ?? '無料フラグ変更に失敗しました')
    } finally {
      setSavingId(null)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleChapterDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = chapters.findIndex(c => c.id === active.id)
    const newIndex = chapters.findIndex(c => c.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(chapters, oldIndex, newIndex)
    setChapters(reordered)
    const result = await reorderChaptersAction(
      courseId,
      reordered.map(c => c.id),
    )
    if (result.success === false) {
      setChapters(chapters) // ロールバック
      setError(result.message ?? '章の並び替えに失敗しました')
    }
  }

  const handleVideoDragEnd = async (chapterId: string, e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const chapter = chapters.find(c => c.id === chapterId)
    if (!chapter) return
    const oldIndex = chapter.videos.findIndex(v => v.id === active.id)
    const newIndex = chapter.videos.findIndex(v => v.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reorderedVideos = arrayMove(chapter.videos, oldIndex, newIndex)
    setChapters(prev =>
      prev.map(c => (c.id === chapterId ? { ...c, videos: reorderedVideos } : c)),
    )
    const result = await reorderVideosAction(
      chapterId,
      courseId,
      reorderedVideos.map(v => v.id),
    )
    if (result.success === false) {
      setChapters(initial) // ロールバック
      setError(result.message ?? '動画の並び替えに失敗しました')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          ドラッグハンドル（≡）で並び替え。動画ごとに無料フラグを切替できます。
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleChapterDragEnd}
      >
        <SortableContext
          items={chapters.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-3">
            {chapters.map(chapter => (
              <SortableChapter
                key={chapter.id}
                chapter={chapter}
                savingId={savingId}
                onRename={handleRenameChapter}
                onRequestDelete={() =>
                  setDeleteTarget({ kind: 'chapter', id: chapter.id, title: chapter.title })
                }
                onAddVideo={() =>
                  setVideoDialog({ mode: 'create', chapterId: chapter.id })
                }
                onEditVideo={video =>
                  setVideoDialog({
                    mode: 'edit',
                    chapterId: chapter.id,
                    videoId: video.id,
                    initial: {
                      title: video.title,
                      description: video.description,
                      video_url: video.video_url,
                      duration: video.duration,
                      is_free: video.is_free,
                    },
                  })
                }
                onRequestDeleteVideo={video =>
                  setDeleteTarget({
                    kind: 'video',
                    id: video.id,
                    title: video.title,
                    chapterId: chapter.id,
                  })
                }
                onToggleFree={handleToggleVideoFree}
                onVideoDragEnd={e => handleVideoDragEnd(chapter.id, e)}
                sensors={sensors}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <section className="flex items-end gap-3 rounded-md border border-border bg-card p-4">
        <div className="flex-1">
          <FormField label="新しい章を追加" htmlFor="new-chapter-title">
            <Input
              id="new-chapter-title"
              value={newChapterTitle}
              onChange={e => setNewChapterTitle(e.target.value)}
              placeholder="例：第 1 章 はじめに"
              maxLength={200}
            />
          </FormField>
        </div>
        <Button onClick={handleAddChapter} disabled={!newChapterTitle.trim() || creatingChapter}>
          {creatingChapter ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              追加中...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              章を追加
            </>
          )}
        </Button>
      </section>

      {/* 削除確認 Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={deleting ? () => {} : open => !open && setDeleteTarget(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {deleteTarget?.kind === 'chapter' ? '章を削除' : '動画を削除'}
            </DialogTitle>
            <DialogDescription>
              「{deleteTarget?.title}」を削除します。この操作は取り消せません。
              {deleteTarget?.kind === 'chapter' &&
                '章内の動画もまとめて削除されます（FK CASCADE）。'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              キャンセル
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? '削除中...' : '削除する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 動画編集 Dialog */}
      <Dialog
        open={!!videoDialog}
        onOpenChange={savingVideo ? () => {} : open => !open && setVideoDialog(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {videoDialog?.mode === 'create' ? '動画を追加' : '動画を編集'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <FormField label="タイトル" htmlFor="video-title" required>
              <Input
                id="video-title"
                value={videoForm.title}
                onChange={e => setVideoForm(v => ({ ...v, title: e.target.value }))}
                maxLength={200}
              />
            </FormField>
            <FormField label="動画 URL" htmlFor="video-url" required helpText="YouTube / Google Drive / 動画ファイル URL">
              <Input
                id="video-url"
                type="url"
                value={videoForm.video_url}
                onChange={e => setVideoForm(v => ({ ...v, video_url: e.target.value }))}
              />
            </FormField>
            <FormField label="動画長表示" htmlFor="video-duration" helpText="例：10:30">
              <Input
                id="video-duration"
                value={videoForm.duration ?? ''}
                onChange={e => setVideoForm(v => ({ ...v, duration: e.target.value }))}
                maxLength={20}
              />
            </FormField>
            <FormField label="説明" htmlFor="video-description">
              <Textarea
                id="video-description"
                value={videoForm.description ?? ''}
                onChange={e => setVideoForm(v => ({ ...v, description: e.target.value }))}
                rows={3}
              />
            </FormField>
            <FormField label="無料公開" htmlFor="video-is-free">
              <Switch
                checked={videoForm.is_free}
                onCheckedChange={next => setVideoForm(v => ({ ...v, is_free: next }))}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialog(null)} disabled={savingVideo}>
              キャンセル
            </Button>
            <Button onClick={handleSaveVideo} disabled={savingVideo}>
              {savingVideo ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---- 章ソート要素 ----

interface SortableChapterProps {
  chapter: CurriculumChapter
  savingId: string | null
  onRename: (chapterId: string, title: string) => Promise<void>
  onRequestDelete: () => void
  onAddVideo: () => void
  onEditVideo: (video: CurriculumChapter['videos'][number]) => void
  onRequestDeleteVideo: (video: CurriculumChapter['videos'][number]) => void
  onToggleFree: (
    chapterId: string,
    videoId: string,
    current: Pick<VideoInput, 'title' | 'video_url' | 'description' | 'duration'>,
    nextValue: boolean,
  ) => Promise<void>
  onVideoDragEnd: (e: DragEndEvent) => Promise<void>
  sensors: ReturnType<typeof useSensors>
}

function SortableChapter({
  chapter,
  savingId,
  onRename,
  onRequestDelete,
  onAddVideo,
  onEditVideo,
  onRequestDeleteVideo,
  onToggleFree,
  onVideoDragEnd,
  sensors,
}: SortableChapterProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: chapter.id })
  const [title, setTitle] = React.useState(chapter.title)

  React.useEffect(() => {
    setTitle(chapter.title)
  }, [chapter.title])

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border bg-card text-card-foreground"
    >
      <header className="flex items-center gap-2 border-b border-border px-3 py-3">
        <button
          type="button"
          aria-label="章を並び替え"
          className="cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => {
            if (title.trim() && title !== chapter.title) onRename(chapter.id, title)
          }}
          maxLength={200}
          className="flex-1"
          aria-label="章名"
        />
        <Button variant="ghost" size="sm" onClick={onRequestDelete} aria-label="章を削除">
          <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
        </Button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onVideoDragEnd}
      >
        <SortableContext
          items={chapter.videos.map(v => v.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col divide-y divide-border">
            {chapter.videos.length === 0 && (
              <li className="px-4 py-3 text-xs text-muted-foreground">
                動画はまだありません
              </li>
            )}
            {chapter.videos.map(video => (
              <SortableVideo
                key={video.id}
                video={video}
                isSaving={savingId === video.id}
                onEdit={() => onEditVideo(video)}
                onRequestDelete={() => onRequestDeleteVideo(video)}
                onToggleFree={next =>
                  onToggleFree(
                    chapter.id,
                    video.id,
                    {
                      title: video.title,
                      video_url: video.video_url,
                      description: video.description,
                      duration: video.duration,
                    },
                    next,
                  )
                }
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <footer className="border-t border-border px-3 py-2">
        <Button variant="ghost" size="sm" onClick={onAddVideo}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          動画を追加
        </Button>
      </footer>
    </li>
  )
}

// ---- 動画ソート要素 ----

interface SortableVideoProps {
  video: CurriculumChapter['videos'][number]
  isSaving: boolean
  onEdit: () => void
  onRequestDelete: () => void
  onToggleFree: (next: boolean) => Promise<void>
}

function SortableVideo({ video, isSaving, onEdit, onRequestDelete, onToggleFree }: SortableVideoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: video.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-2 px-3 py-3">
      <button
        type="button"
        aria-label="動画を並び替え"
        className="cursor-grab text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm text-foreground">{video.title}</p>
        <p className="truncate text-xs text-muted-foreground">{video.video_url}</p>
      </div>
      {video.duration && (
        <span className="text-xs text-muted-foreground">{video.duration}</span>
      )}
      {video.is_free && <Badge variant="success">無料</Badge>}
      <div className="flex items-center gap-1">
        <Switch
          checked={video.is_free}
          onCheckedChange={onToggleFree}
          disabled={isSaving}
          aria-label="無料公開"
        />
        <Button variant="ghost" size="sm" onClick={onEdit}>
          編集
        </Button>
        <Button variant="ghost" size="sm" onClick={onRequestDelete} aria-label="動画を削除">
          <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
