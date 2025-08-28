import NoticeForm from '../NoticeForm'

export default function NewNoticePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">新規お知らせ作成</h1>
      <NoticeForm />
    </div>
  )
}