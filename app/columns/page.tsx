import { createClient } from '@/app/lib/supabase/server'
import { Column } from '@/app/types'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import MainLayout from '@/app/components/MainLayout'

export const revalidate = 60

export default async function ColumnsPage() {
  const supabase = await createClient()
  
  const { data: columns, error } = await supabase
    .from('columns')
    .select('*')
    .eq('is_published', true)
    .order('published_date', { ascending: false })

  if (error) {
    console.error('Error fetching columns:', error)
    return <div>コラムの取得中にエラーが発生しました</div>
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-gray-900">コラム</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {columns?.map((column: Column) => (
            <Link 
              key={column.id} 
              href={`/columns/${column.slug}`}
              className="group"
            >
              <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                {column.thumbnail && (
                  <div className="relative aspect-video">
                    <Image
                      src={column.thumbnail}
                      alt={column.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  </div>
                )}
                
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-portfolio-blue transition-colors">
                    {column.title}
                  </h2>
                  
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {column.excerpt || ''}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(column.published_date).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {!columns || columns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">現在公開中のコラムはありません</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}