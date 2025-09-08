'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

export default function MicrosoftClarity() {
  const pathname = usePathname()
  
  // 管理画面、API、ログインページは除外
  const shouldLoadClarity = !pathname.startsWith('/admin') && 
                           !pathname.startsWith('/api') && 
                           !pathname.startsWith('/login')

  if (!shouldLoadClarity) {
    return null
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "t7b2215g90");
        `
      }}
    />
  )
}