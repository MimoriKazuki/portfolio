import { createClient } from '@/app/lib/supabase/server'
import { Document } from '@/app/types'
import Image from 'next/image'
import Link from 'next/link'
import { Download } from 'lucide-react'
import MainLayout from '@/app/components/MainLayout'
import PageHeader from '@/app/components/ui/PageHeader'

export const revalidate = 60

export default async function DocumentsPage() {
  const supabase = await createClient()
  
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return <div>資料の取得中にエラーが発生しました</div>
  }

  return (
    <MainLayout hideRightSidebar={true}>
      <div className="w-full">
        <PageHeader title="DOCUMENT" subtitle="資料ダウンロード" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents?.map((document: Document) => (
            <Link
              key={document.id}
              href={`/documents/request/${document.id}`}
              className="group"
            >
              <article
                className="overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors duration-300 flex flex-col h-full p-4 rounded"
              >
                {document.thumbnail && (
                  <div className="relative aspect-video overflow-hidden rounded">
                    <Image
                      src={document.thumbnail}
                      alt={document.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                )}

                <div className="pt-4 flex-1 flex flex-col">
                  <h2 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {document.title}
                  </h2>

                  <div className="flex-1">
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {document.description || ''}
                    </p>
                  </div>

                  <div className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-600 border border-blue-600 group-hover:bg-blue-50 transition-colors duration-200 w-full">
                    <Download className="w-5 h-5" />
                    資料をダウンロード
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {!documents || documents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">現在ダウンロード可能な資料はありません</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}