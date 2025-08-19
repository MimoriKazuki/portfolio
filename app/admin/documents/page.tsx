import { createClient } from '@/app/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, FileText, Download, Calendar } from 'lucide-react'
import Image from 'next/image'
import DeleteDocumentButton from './DeleteDocumentButton'

export default async function DocumentsPage() {
  const supabase = await createClient()
  
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">ドキュメント管理</h1>
          <p className="text-gray-600">ドキュメントの追加・編集・削除を行えます</p>
        </div>
        <Link
          href="/admin/documents/new"
          className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          ドキュメントを追加
        </Link>
      </div>
      
      {!documents || documents.length === 0 ? (
        <div className="bg-white rounded-lg p-16 text-center border border-gray-200">
          <FileText className="h-20 w-20 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">ドキュメントがありません</h2>
          <p className="text-gray-600 mb-8">最初のドキュメントを追加して情報を共有しましょう</p>
          <Link
            href="/admin/documents/new"
            className="inline-flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-6 py-3 rounded-lg transition-colors text-lg"
          >
            <Plus className="h-6 w-6" />
            ドキュメントを追加
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-portfolio-blue">{documents.length}</div>
              <div className="text-sm text-gray-600">総ドキュメント数</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {documents.filter(d => d.is_active).length}
              </div>
              <div className="text-sm text-gray-600">公開中</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-yellow-600">
                {documents.filter(d => !d.is_active).length}
              </div>
              <div className="text-sm text-gray-600">非公開</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {documents.reduce((sum, d) => sum + (d.download_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">総ダウンロード数</div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-40 text-center px-6 py-3 text-sm font-medium text-gray-700">画像</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">内容</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">ステータス</th>
                  <th className="w-[120px] text-center px-2 py-3 text-xs font-medium text-gray-700">ダウンロード</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                    <td className="w-40 px-6 py-4">
                      <div className="flex justify-center">
                        {document.thumbnail ? (
                          <div className="relative w-20 h-12 flex-shrink-0">
                            <Image
                              src={document.thumbnail}
                              alt={document.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-left min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{document.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{document.description}</p>
                      </div>
                    </td>
                    <td className="w-[120px] px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        document.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {document.is_active ? '公開中' : '非公開'}
                      </span>
                    </td>
                    <td className="w-[120px] px-6 py-4 text-center text-sm text-gray-600">
                      {document.download_count || 0}
                    </td>
                    <td className="w-[120px] px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/documents/${document.id}`}
                          target="_blank"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                          title="プレビュー"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/documents/${document.id}/edit`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                          title="編集"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <DeleteDocumentButton documentId={document.id} documentTitle={document.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}