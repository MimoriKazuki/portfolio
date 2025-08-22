'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { Project } from '@/app/types'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
  project: Project
  onOpenDetail?: (project: Project) => void
  priority?: boolean
}

const ProjectCard = ({ project, onOpenDetail, priority = false }: ProjectCardProps) => {
  const router = useRouter()
  const categoryColors = {
    'homepage': 'bg-purple-100 text-purple-700',
    'landing-page': 'bg-pink-100 text-pink-700',
    'web-app': 'bg-blue-100 text-blue-700',
    'mobile-app': 'bg-green-100 text-green-700',
    'video': 'bg-orange-100 text-orange-700'
  }

  const categoryLabels = {
    'homepage': 'ホームページ',
    'landing-page': 'ランディングページ',
    'web-app': 'Webアプリ',
    'mobile-app': 'モバイルアプリ',
    'video': '動画制作'
  }

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`)
  }

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col w-full"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick()
        }
      }}
      title="クリックして詳細を見る"
    >
      <div className="relative">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
        <div className={`absolute top-1 sm:top-2 right-1 sm:right-2 ${categoryColors[project.category]} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium`}>
          {categoryLabels[project.category]}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 line-clamp-1 mb-2 group-hover:text-portfolio-blue transition-colors">
          {project.title}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
          {project.description}
        </p>
        
        <div className="h-[20px] mb-2">
          {project.technologies && project.technologies.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {project.technologies.slice(0, 3).map((tech) => (
                <span key={tech} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          ) : (
            <div className="h-full"></div>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{project.duration}</span>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard