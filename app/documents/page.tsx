import { createClient } from '@/app/lib/supabase/server'
import { Document } from '@/app/types'
import Image from 'next/image'
import Link from 'next/link'
import { FileText } from 'lucide-react'
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {documents?.map((document: Document) => (
            <article 
              key={document.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {document.thumbnail && (
                <div className="relative aspect-video">
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
              
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {document.title}
                </h2>
                
                <div className="flex-1">
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {document.description || ''}
                  </p>
                </div>
                
                <Link
                  href={`/documents/request/${document.id}`}
                  className="inline-flex items-center justify-center text-white px-6 py-3 rounded-lg transition-opacity hover:opacity-90 font-medium w-full"
                  style={{ backgroundColor: 'rgb(37, 99, 235)' }}
                >
                  資料をダウンロード
                </Link>
              </div>
            </article>
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