'use client'

import { useState } from 'react'

interface ColumnStylesProps {
  children: React.ReactNode
}

export default function ColumnStyles({ children }: ColumnStylesProps) {
  const [styleOption, setStyleOption] = useState(1)

  const styleOptions = [
    {
      id: 1,
      name: 'グラデーション帯',
      className: `prose max-w-none
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-h1:text-[28px] prose-h1:bg-gradient-to-r prose-h1:from-portfolio-blue prose-h1:to-portfolio-blue-light prose-h1:text-white prose-h1:py-4 prose-h1:px-6 prose-h1:-mx-6 prose-h1:mb-6 prose-h1:mt-8 prose-h1:rounded-lg prose-h1:shadow-md
        prose-h2:text-[24px] prose-h2:border-l-4 prose-h2:border-portfolio-blue prose-h2:pl-4 prose-h2:mb-4 prose-h2:mt-6
        prose-h3:text-[20px] prose-h3:mb-3 prose-h3:mt-5
        prose-h4:text-[16px] prose-h4:mb-2 prose-h4:mt-4
        prose-h5:text-[14px] prose-h5:mb-2 prose-h5:mt-3
        prose-h6:text-[12px] prose-h6:mb-2 prose-h6:mt-3
        prose-p:text-[16px] prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-portfolio-blue prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-code:bg-gray-100 prose-code:text-portfolio-blue prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:text-[14px]
        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
        prose-ul:text-[16px] prose-ul:text-gray-700 prose-ol:text-[16px] prose-ol:text-gray-700
        prose-li:marker:text-gray-400`
    },
    {
      id: 2,
      name: '薄い背景',
      className: `prose max-w-none
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-h1:text-[28px] prose-h1:bg-gray-100 prose-h1:border-l-8 prose-h1:border-portfolio-blue prose-h1:py-4 prose-h1:px-6 prose-h1:-mx-6 prose-h1:mb-6 prose-h1:mt-8
        prose-h2:text-[24px] prose-h2:border-l-4 prose-h2:border-portfolio-blue prose-h2:pl-4 prose-h2:mb-4 prose-h2:mt-6
        prose-h3:text-[20px] prose-h3:mb-3 prose-h3:mt-5
        prose-h4:text-[16px] prose-h4:mb-2 prose-h4:mt-4
        prose-h5:text-[14px] prose-h5:mb-2 prose-h5:mt-3
        prose-h6:text-[12px] prose-h6:mb-2 prose-h6:mt-3
        prose-p:text-[16px] prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-portfolio-blue prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-code:bg-gray-100 prose-code:text-portfolio-blue prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:text-[14px]
        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
        prose-ul:text-[16px] prose-ul:text-gray-700 prose-ol:text-[16px] prose-ol:text-gray-700
        prose-li:marker:text-gray-400`
    },
    {
      id: 3,
      name: 'ボーダー付き',
      className: `prose max-w-none
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-h1:text-[28px] prose-h1:border-y-2 prose-h1:border-portfolio-blue prose-h1:py-4 prose-h1:mb-6 prose-h1:mt-8
        prose-h2:text-[24px] prose-h2:border-l-4 prose-h2:border-portfolio-blue prose-h2:pl-4 prose-h2:mb-4 prose-h2:mt-6
        prose-h3:text-[20px] prose-h3:mb-3 prose-h3:mt-5
        prose-h4:text-[16px] prose-h4:mb-2 prose-h4:mt-4
        prose-h5:text-[14px] prose-h5:mb-2 prose-h5:mt-3
        prose-h6:text-[12px] prose-h6:mb-2 prose-h6:mt-3
        prose-p:text-[16px] prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-portfolio-blue prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-code:bg-gray-100 prose-code:text-portfolio-blue prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:text-[14px]
        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
        prose-ul:text-[16px] prose-ul:text-gray-700 prose-ol:text-[16px] prose-ol:text-gray-700
        prose-li:marker:text-gray-400`
    }
  ]

  return (
    <>
      {/* スタイル選択ボタン（開発時のみ表示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm font-semibold mb-2">H1スタイル選択:</p>
          <div className="space-y-2">
            {styleOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setStyleOption(option.id)}
                className={`block w-full text-left px-3 py-2 text-sm rounded ${
                  styleOption === option.id
                    ? 'bg-portfolio-blue text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className={styleOptions.find(opt => opt.id === styleOption)?.className}>
        {children}
      </div>
    </>
  )
}