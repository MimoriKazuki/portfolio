'use client'

interface StickySidebarProps {
  children: React.ReactNode
}

export default function StickySidebar({ children }: StickySidebarProps) {
  return (
    <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
      {children}
    </div>
  )
}