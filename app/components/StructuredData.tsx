export default function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LandBridge株式会社',
    url: 'https://landbridge.co.jp/',
    logo: 'https://www.landbridge.ai/favicon.svg',
    sameAs: [
      'https://landbridge.co.jp/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@landbridge.co.jp',
      contactType: 'customer service',
      availableLanguage: ['Japanese', 'English'],
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LandBridge Portfolio',
    url: 'https://www.landbridge.ai/',
    description: 'LandBridge株式会社のポートフォリオサイト - Webサイト・アプリケーション開発の実績紹介',
    publisher: {
      '@type': 'Organization',
      name: 'LandBridge株式会社',
    },
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Web Development',
    provider: {
      '@type': 'Organization',
      name: 'LandBridge株式会社',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Japan',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '開発サービス',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'ホームページ制作',
            description: 'コーポレートサイト・ホームページの制作',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'ランディングページ制作',
            description: 'コンバージョンを重視したランディングページの制作',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Webアプリケーション開発',
            description: '最新技術を活用したWebアプリケーションの開発',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'モバイルアプリケーション開発',
            description: 'iOS/Android対応のモバイルアプリケーション開発',
          },
        },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
    </>
  )
}