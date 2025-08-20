import DocumentForm from '../DocumentForm'

export default function NewDocumentPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">新しい資料を追加</h1>
      
      <div className="bg-youtube-gray rounded-lg">
        <DocumentForm />
      </div>
    </div>
  )
}