'use client'

interface Heading {
  level: number
  text: string
}

interface TableOfContentsProps {
  headings: Heading[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    e.preventDefault()
    const element = document.getElementById(`heading-${index}`)
    if (element) {
      // より確実なスクロール方法を使用
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - 100 // 上部に100pxの余白を確保
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="flex justify-center mb-12">
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 w-full max-w-2xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">目次</h2>
        <nav className="space-y-1">
          {headings.map((heading, index) => (
            <a
              key={index}
              href={`#heading-${index}`}
              onClick={(e) => handleClick(e, index)}
              className={`
                flex items-start text-sm hover:text-portfolio-blue transition-colors
                ${heading.level === 1 ? 'font-bold text-gray-900' : ''}
                ${heading.level === 2 ? 'pl-6 text-gray-800' : ''}
                ${heading.level === 3 ? 'pl-12 text-gray-700' : ''}
                ${heading.level === 4 ? 'pl-[4.5rem] text-gray-600' : ''}
                ${heading.level === 5 ? 'pl-24 text-gray-500' : ''}
                ${heading.level === 6 ? 'pl-[7.5rem] text-gray-500' : ''}
              `}
            >
              <span className="mr-2">
                {heading.level === 1 ? '•' : 
                 heading.level === 2 ? '◦' : 
                 heading.level === 3 ? '▪' : 
                 heading.level === 4 ? '▫' : 
                 heading.level >= 5 ? '·' : ''}
              </span>
              <span>{heading.text}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}