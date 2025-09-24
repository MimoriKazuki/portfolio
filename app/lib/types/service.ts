// Service page types for AI training services

export interface ServiceOverviewItem {
  title: string
  description: string
  image: string
}

export interface TargetAudience {
  name: string
  subtitle: string
  description: string
  rating: number
  iconName: string
}

export interface ExpectedChangeBefore {
  category: string
  issue: string
}

export interface ExpectedChangeAfter {
  category: string
  achievement: string
}

export interface CurriculumModule {
  title: string
  description: string
  image: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface OtherTrainingProgram {
  id: string
  title: string
  description: string
  href: string
  image: string
  available: boolean
  category: "enterprise" | "individual"
}

export interface ServiceData {
  // Page metadata
  pageTitle: string
  heroTitle: string
  heroImage: string
  seoTitle: string
  
  // CTA configurations
  heroCTA: {
    inquiryText: string
    documentText: string
    inquiryHref: string
    documentHref: string
  }
  
  // Service overview section
  serviceOverview: {
    title: string
    subtitle?: string
    items: ServiceOverviewItem[]
  }
  
  // Mid CTA section
  midCTA: {
    title: string
    description: string
    inquiryHref: string
    documentHref: string
  }
  
  // Target audience section
  targetAudience: {
    title: string
    subtitle?: string
    audiences: TargetAudience[]
  }
  
  // Expected changes section
  expectedChanges: {
    title: string
    subtitle: string
    beforeItems: ExpectedChangeBefore[]
    afterItems: ExpectedChangeAfter[]
  }
  
  // Curriculum section
  curriculum: {
    title: string
    modules: CurriculumModule[]
  }
  
  // Flow section
  flow: {
    title: string
    subtitle: string
    steps: string[]
    conclusionTitle: string
    conclusionText: string
  }
  
  // Additional CTA section (optional)
  additionalCTA?: {
    title: string
    description: string
    inquiryHref: string
    documentHref: string
  }
  
  // Overview table section
  overviewTable: {
    title: string
    rows: Array<[string, string]>
  }
  
  // FAQ section
  faq: {
    title: string
    items: FAQ[]
  }
  
  // Other training programs
  otherTrainingPrograms: {
    title: string
    currentPageId: string
    programs: OtherTrainingProgram[]
  }
  
  // Final CTA
  finalCTA: {
    title: string
    description: string
    inquiryHref: string
    documentHref: string
  }
}

export interface ServicePageMetadata {
  title: string
  description: string
  keywords: string[]
  url: string
}