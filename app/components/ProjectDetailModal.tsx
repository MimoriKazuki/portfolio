'use client'

import { Project } from '@/app/types'
import { X, ExternalLink, Github, Clock, Calendar } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'

interface ProjectDetailModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export default function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !project) return null

  const categoryColors = {
    'homepage': 'bg-purple-600',
    'landing-page': 'bg-pink-600',
    'web-app': 'bg-blue-600',
    'mobile-app': 'bg-green-600'
  }

  const categoryLabels = {
    'homepage': 'ホームページ',
    'landing-page': 'ランディングページ',
    'web-app': 'Webアプリ',
    'mobile-app': 'モバイルアプリ'
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/80" onClick={onClose} />
      
      {/* Modal Container - Full screen with header and sidebar offset */}
      <div className="fixed inset-0 z-50 pt-14 pl-0 md:pl-60">
        {/* Content wrapper with same padding as Projects page */}
        <div className="h-full p-4 sm:p-6 pt-2 sm:pt-3">
          {/* Modal content */}
          <div className="relative bg-youtube-dark border border-youtube-gray rounded-lg h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-youtube-gray p-3 sm:p-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold pr-2 line-clamp-1">{project.title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-youtube-gray rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  {/* Left column - Thumbnail */}
                  <div className="lg:w-1/2">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={project.thumbnail}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 ${categoryColors[project.category]} text-white text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded`}>
                        {categoryLabels[project.category]}
                      </div>
                    </div>
                  </div>

                  {/* Right column - Project details */}
                  <div className="lg:w-1/2 space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">プロジェクト概要</h3>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{project.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <h4 className="text-sm sm:text-base font-medium text-gray-400 mb-1 sm:mb-2">開発期間</h4>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-300">
                          <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          <span>{project.duration}</span>
                        </div>
                      </div>
                      
                      {project.client && (
                        <div>
                          <h4 className="text-sm sm:text-base font-medium text-gray-400 mb-1 sm:mb-2">クライアント</h4>
                          <p className="text-sm sm:text-base text-gray-300">{project.client}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-gray-400 mb-1.5 sm:mb-2">使用技術</h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {project.technologies.map((tech) => (
                          <span key={tech} className="bg-youtube-gray px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm sm:text-base"
                        >
                          <ExternalLink className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          サイトを見る
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-youtube-gray hover:bg-youtube-gray/80 rounded-lg transition-colors text-sm sm:text-base"
                        >
                          <Github className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          ソースコード
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}