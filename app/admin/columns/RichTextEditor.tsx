'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Code,
  Undo,
  Redo,
  ChevronDown,
  Loader2,
  Square
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Button from './extensions/Button'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [isEditingLink, setIsEditingLink] = useState(false)
  const [showButtonModal, setShowButtonModal] = useState(false)
  const [buttonText, setButtonText] = useState('')
  const [buttonUrl, setButtonUrl] = useState('')
  const [buttonStyle, setButtonStyle] = useState('primary')
  const [editingButtonNode, setEditingButtonNode] = useState<any>(null)
  const [editingButtonPos, setEditingButtonPos] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        },
        // StarterKitから除外して個別に設定する
        link: false
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true
      }),
      Placeholder.configure({
        placeholder: 'ここに内容を入力してください...'
      }),
      Button
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px] max-h-[500px] overflow-y-auto px-4 py-3 text-sm'
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false
  })

  // Handle button editing
  useEffect(() => {
    const handleEditButton = (event: any) => {
      const { node, pos } = event.detail
      setButtonText(node.attrs.text)
      setButtonUrl(node.attrs.url)
      setButtonStyle(node.attrs.style)
      setEditingButtonNode(node)
      setEditingButtonPos(pos)
      setShowButtonModal(true)
    }

    document.addEventListener('editButton', handleEditButton)
    return () => {
      document.removeEventListener('editButton', handleEditButton)
    }
  }, [])

  if (!editor) {
    return null
  }

  const presetColors = [
    '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
    '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
    '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
    '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
    '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
    '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
    '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47',
    '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130'
  ]

  const addLink = () => {
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)
    const previousUrl = editor.getAttributes('link').href
    
    // Set initial values for the modal
    setLinkText(selectedText || '')
    setLinkUrl(previousUrl || '')
    setIsEditingLink(!!selectedText || !!previousUrl)
    setShowLinkModal(true)
  }

  const handleLinkSubmit = () => {
    if (!linkUrl.trim()) {
      // If URL is empty, remove link if editing
      if (isEditingLink) {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
      }
      setShowLinkModal(false)
      return
    }

    if (!linkText.trim()) {
      // If no link text provided, use URL as text
      editor.chain().focus().insertContent(`<a href="${linkUrl.trim()}">${linkUrl.trim()}</a>`).run()
    } else if (isEditingLink) {
      // Update existing link or selected text
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run()
    } else {
      // Insert new link with custom text
      editor.chain().focus().insertContent(`<a href="${linkUrl.trim()}">${linkText.trim()}</a>`).run()
    }

    // Reset modal state
    setShowLinkModal(false)
    setLinkText('')
    setLinkUrl('')
    setIsEditingLink(false)
  }

  const handleLinkCancel = () => {
    setShowLinkModal(false)
    setLinkText('')
    setLinkUrl('')
    setIsEditingLink(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルのみアップロード可能です。')
      return
    }

    setUploadingImage(true)

    try {
      // Upload to Supabase
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('column-thumbnails')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('column-thumbnails')
        .getPublicUrl(filePath)

      // Insert image into editor
      editor.chain().focus().setImage({ src: publicUrl }).run()
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('画像のアップロードに失敗しました。')
    } finally {
      setUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const addImage = () => {
    fileInputRef.current?.click()
  }

  const addButton = () => {
    setButtonText('')
    setButtonUrl('')
    setButtonStyle('primary')
    setEditingButtonNode(null)
    setEditingButtonPos(null)
    setShowButtonModal(true)
  }

  const handleButtonSubmit = () => {
    if (!buttonText.trim() || !buttonUrl.trim()) {
      alert('ボタンテキストとURLの両方を入力してください。')
      return
    }

    if (editingButtonNode && editingButtonPos !== null) {
      // Update existing button
      try {
        editor.chain().focus().command(({ tr }) => {
          const buttonType = tr.doc.type.schema.nodes.button
          tr.setNodeMarkup(editingButtonPos, buttonType, {
            text: buttonText.trim(),
            url: buttonUrl.trim(),
            style: buttonStyle
          })
          return true
        }).run()
      } catch (error) {
        console.error('Error updating button:', error)
        alert('ボタンの更新に失敗しました。')
        return
      }
    } else {
      // Insert new button
      editor.chain().focus().insertButton({
        text: buttonText.trim(),
        url: buttonUrl.trim(),
        style: buttonStyle
      }).run()
    }

    handleButtonCancel()
  }

  const handleButtonCancel = () => {
    setShowButtonModal(false)
    setButtonText('')
    setButtonUrl('')
    setButtonStyle('primary')
    setEditingButtonNode(null)
    setEditingButtonPos(null)
  }

  const handleButtonDelete = () => {
    if (editingButtonNode && editingButtonPos !== null) {
      try {
        editor.chain().focus().command(({ tr }) => {
          tr.delete(editingButtonPos, editingButtonPos + 1)
          return true
        }).run()
      } catch (error) {
        console.error('Error deleting button:', error)
        alert('ボタンの削除に失敗しました。')
      }
    }
    handleButtonCancel()
  }

  const currentHeadingLevel = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) {
        return `h${i}`
      }
    }
    return editor.isActive('paragraph') ? 'p' : 'p'
  }

  const formatLabels = {
    'p': 'テキスト',
    'h1': '見出し 1',
    'h2': '見出し 2',
    'h3': '見出し 3',
    'h4': '見出し 4',
    'h5': '見出し 5',
    'h6': '見出し 6'
  }

  return (
    <div className="border border-gray-300 rounded overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 px-2 py-1">
        {/* First row */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Format selector */}
          <div className="relative">
            <select
              value={currentHeadingLevel()}
              onChange={(e) => {
                const value = e.target.value
                if (value === 'p') {
                  editor.chain().focus().setParagraph().run()
                } else {
                  const level = parseInt(value.replace('h', ''))
                  editor.chain().focus().toggleHeading({ level: level as any }).run()
                }
              }}
              className="pl-2 pr-6 py-1 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="p">テキスト</option>
              <option value="h1">見出し 1</option>
              <option value="h2">見出し 2</option>
              <option value="h3">見出し 3</option>
              <option value="h4">見出し 4</option>
              <option value="h5">見出し 5</option>
              <option value="h6">見出し 6</option>
            </select>
            <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          <div className="w-px h-5 bg-gray-300" />

          {/* Text formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="太字"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="斜体"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
            title="下線"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-gray-300" />

          {/* Text color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1 text-xs"
              title="文字色"
            >
              <span className="font-bold">A</span>
              <div className="w-3 h-0.5 bg-current" style={{ color: editor.getAttributes('textStyle').color || '#000000' }} />
            </button>
            {showColorPicker && (
              <div className="absolute top-8 left-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
                <div className="grid grid-cols-10 gap-1 w-64">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(color).run()
                        setShowColorPicker(false)
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Background color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              className="p-1 rounded hover:bg-gray-200"
              title="背景色"
            >
              <div className="w-3.5 h-3.5 border border-gray-400 rounded" style={{ backgroundColor: editor.getAttributes('highlight').color || 'transparent' }} />
            </button>
            {showBgColorPicker && (
              <div className="absolute top-8 left-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
                <div className="grid grid-cols-10 gap-1 w-64">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color }).run()
                        setShowBgColorPicker(false)
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-300" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            title="箇条書き"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            title="番号付きリスト"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-gray-300" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
            title="左揃え"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
            title="中央揃え"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
            title="右揃え"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-gray-300" />

          {/* Link, Image & Button */}
          <button
            type="button"
            onClick={addLink}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
            title="リンク"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={addImage}
            className="p-1.5 rounded hover:bg-gray-200 relative"
            title="画像"
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={addButton}
            className="p-1 rounded hover:bg-gray-200"
            title="ボタン"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="w-px h-5 bg-gray-300" />

          {/* Quote & Code */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
            title="引用"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
            title="コード"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-gray-300" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="p-1.5 rounded hover:bg-gray-200"
            title="元に戻す"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="p-1.5 rounded hover:bg-gray-200"
            title="やり直す"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white border-l border-r border-b border-gray-300 rounded-b h-[500px] overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {isEditingLink ? 'リンクを編集' : 'リンクを追加'}
            </h3>
            
            <div className="space-y-4">
              {/* Link Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  リンクテキスト
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isEditingLink && linkText ? linkText : "リンクテキストを入力"}
                />
                {!isEditingLink && (
                  <p className="text-xs text-gray-500 mt-1">
                    空の場合はURLがテキストとして使用されます
                  </p>
                )}
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleLinkCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              {isEditingLink && (
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run()
                    handleLinkCancel()
                  }}
                  className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                >
                  削除
                </button>
              )}
              <button
                type="button"
                onClick={handleLinkSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {isEditingLink ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Button Modal */}
      {showButtonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {editingButtonNode ? 'ボタンを編集' : 'ボタンを追加'}
            </h3>
            
            <div className="space-y-4">
              {/* Button Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ボタンテキスト <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ボタンに表示するテキスト"
                  required
                />
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  リンクURL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>

              {/* Button Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ボタンスタイル
                </label>
                <select
                  value={buttonStyle}
                  onChange={(e) => setButtonStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="primary">プライマリ (青色)</option>
                  <option value="secondary">セカンダリ (グレー)</option>
                  <option value="outline">アウトライン (白枠)</option>
                </select>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プレビュー
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <button
                    className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                      buttonStyle === 'secondary' 
                        ? 'bg-gray-100 text-gray-700 border border-gray-300' 
                        : buttonStyle === 'outline'
                        ? 'bg-transparent text-blue-600 border border-blue-600'
                        : 'bg-blue-600 text-white'
                    }`}
                    disabled
                  >
                    {buttonText || 'ボタンテキスト'}
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleButtonCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              {editingButtonNode && (
                <button
                  type="button"
                  onClick={handleButtonDelete}
                  className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                >
                  削除
                </button>
              )}
              <button
                type="button"
                onClick={handleButtonSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                disabled={!buttonText.trim() || !buttonUrl.trim()}
              >
                {editingButtonNode ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}