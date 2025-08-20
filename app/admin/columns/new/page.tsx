import ColumnForm from '../ColumnForm'

export default function NewColumnPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">新しいコラムを追加</h1>
      
      <div className="bg-youtube-gray rounded-lg">
        <ColumnForm />
      </div>
    </div>
  )
}