import ColumnForm from '../ColumnForm'

export default function NewColumnPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">新規コラム作成</h1>
      <ColumnForm />
    </div>
  )
}