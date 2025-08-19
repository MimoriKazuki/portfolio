'use client'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

// カスタムイベントを送信する関数
export const sendGAEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// お問い合わせフォーム送信イベント
export const trackContactFormSubmit = (formType: string) => {
  sendGAEvent({
    action: 'submit',
    category: 'Contact Form',
    label: formType,
  })
}

// 資料ダウンロードイベント
export const trackDocumentDownload = (documentName: string) => {
  sendGAEvent({
    action: 'download',
    category: 'Document',
    label: documentName,
  })
}

// プロジェクト詳細表示イベント
export const trackProjectView = (projectTitle: string) => {
  sendGAEvent({
    action: 'view',
    category: 'Project',
    label: projectTitle,
  })
}

// 外部リンククリックイベント
export const trackExternalLinkClick = (url: string) => {
  sendGAEvent({
    action: 'click',
    category: 'External Link',
    label: url,
  })
}

// スクロール深度イベント（25%, 50%, 75%, 100%）
export const trackScrollDepth = (percentage: number) => {
  sendGAEvent({
    action: 'scroll',
    category: 'Engagement',
    label: `${percentage}%`,
    value: percentage,
  })
}