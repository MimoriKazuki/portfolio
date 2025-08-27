import { FileText, PlayCircle, Github } from 'lucide-react'

interface ProjectMetaIconsProps {
  hasPrompt?: boolean
  hasVideoUrl?: boolean
  hasGithub?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export default function ProjectMetaIcons({ 
  hasPrompt, 
  hasVideoUrl, 
  hasGithub,
  size = 'sm',
  className = ''
}: ProjectMetaIconsProps) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {hasPrompt && (
        <span className="text-emerald-600" title="プロンプトあり">
          <FileText className={iconSize} />
        </span>
      )}
      {hasVideoUrl && (
        <span className="text-red-600" title="解説動画あり">
          <PlayCircle className={iconSize} />
        </span>
      )}
      {hasGithub && (
        <span className="text-gray-700" title="ソースコードあり">
          <Github className={iconSize} />
        </span>
      )}
    </div>
  )
}