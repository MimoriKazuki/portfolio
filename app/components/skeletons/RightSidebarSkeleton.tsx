export default function RightSidebarSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      {/* タイトル */}
      <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
      
      <div className="space-y-4">
        {/* サービスカード 1 */}
        <div className="border-2 border-gray-100 rounded-lg p-3">
          {/* 画像 */}
          <div className="relative aspect-video mb-3 bg-gray-200 rounded"></div>
          
          {/* コンテンツ */}
          <div>
            {/* タイトル */}
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            {/* 説明文 */}
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
            {/* 詳しく見るボタン */}
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        {/* サービスカード 2 */}
        <div className="border-2 border-gray-100 rounded-lg p-3">
          {/* 画像 */}
          <div className="relative aspect-video mb-3 bg-gray-200 rounded"></div>
          
          {/* コンテンツ */}
          <div>
            {/* タイトル */}
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
            {/* 説明文 */}
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
            {/* 詳しく見るボタン */}
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        {/* 資料カード */}
        <div className="border-2 border-gray-100 rounded-lg p-3">
          {/* 画像 */}
          <div className="relative aspect-video mb-3 bg-gray-200 rounded"></div>
          
          {/* コンテンツ */}
          <div>
            {/* ラベル */}
            <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
            {/* タイトル */}
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    </div>
  )
}