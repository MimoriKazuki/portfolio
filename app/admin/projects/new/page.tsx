import ProjectForm from '../ProjectForm'

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">新しいAI制作物を追加</h1>
      
      <div className="bg-youtube-gray rounded-lg">
        <ProjectForm />
      </div>
    </div>
  )
}