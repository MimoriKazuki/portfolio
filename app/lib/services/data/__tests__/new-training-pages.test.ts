import { describe, it, expect } from 'vitest'
import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { CLAUDE_TRAINING_METADATA, CLAUDE_TRAINING_DATA } from '../claude-training'
import { AI_SHORT_VIDEO_TRAINING_METADATA, AI_SHORT_VIDEO_TRAINING_DATA } from '../ai-short-video-training'
import { AI_ANIMATION_TRAINING_METADATA, AI_ANIMATION_TRAINING_DATA } from '../ai-animation-training'
import { generateOtherTrainingProgramsData } from '@/app/lib/services/training-programs'
import { generateServiceMetadata } from '@/app/lib/services/common'

// ServicePageMetadata の必須フィールドを網羅しているか検証するヘルパー
function assertMetadata(meta: ServicePageMetadata, expectedSlug: string) {
  expect(meta.title).toBeTruthy()
  expect(meta.description).toBeTruthy()
  expect(Array.isArray(meta.keywords)).toBe(true)
  expect(meta.keywords.length).toBeGreaterThan(0)
  expect(meta.url).toContain(`/services/${expectedSlug}`)
}

// ServiceData の必須フィールドを網羅しているか検証するヘルパー
function assertServiceData(data: ServiceData) {
  // トップレベル必須フィールド
  expect(data.pageTitle).toBeTruthy()
  expect(data.heroTitle).toBeTruthy()
  expect(data.heroImage).toBeTruthy()
  expect(data.seoTitle).toBeTruthy()

  // heroCTA
  expect(data.heroCTA.inquiryText).toBeTruthy()
  expect(data.heroCTA.documentText).toBeTruthy()
  expect(data.heroCTA.inquiryHref).toBeTruthy()
  expect(data.heroCTA.documentHref).toBeTruthy()

  // serviceOverview
  expect(data.serviceOverview.title).toBeTruthy()
  expect(data.serviceOverview.descriptionTop).toBeTruthy()
  expect(data.serviceOverview.descriptionBottom).toBeTruthy()
  expect(data.serviceOverview.featureImage).toBeTruthy()
  expect(Array.isArray(data.serviceOverview.tools)).toBe(true)
  expect(data.serviceOverview.tools.length).toBeGreaterThan(0)
  expect(Array.isArray(data.serviceOverview.items)).toBe(true)
  expect(data.serviceOverview.items.length).toBeGreaterThan(0)

  // midCTA
  expect(data.midCTA.title).toBeTruthy()
  expect(data.midCTA.description).toBeTruthy()
  expect(data.midCTA.inquiryHref).toBeTruthy()
  expect(data.midCTA.documentHref).toBeTruthy()

  // targetAudience
  expect(data.targetAudience.title).toBeTruthy()
  expect(Array.isArray(data.targetAudience.audiences)).toBe(true)
  expect(data.targetAudience.audiences.length).toBeGreaterThan(0)

  // expectedChanges
  expect(data.expectedChanges.title).toBeTruthy()
  expect(data.expectedChanges.subtitle).toBeTruthy()
  expect(Array.isArray(data.expectedChanges.beforeItems)).toBe(true)
  expect(Array.isArray(data.expectedChanges.afterItems)).toBe(true)
  expect(data.expectedChanges.beforeItems.length).toBeGreaterThan(0)
  expect(data.expectedChanges.afterItems.length).toBeGreaterThan(0)

  // curriculum
  expect(data.curriculum.title).toBeTruthy()
  expect(Array.isArray(data.curriculum.modules)).toBe(true)
  expect(data.curriculum.modules.length).toBeGreaterThan(0)

  // flow
  expect(data.flow.title).toBeTruthy()
  expect(data.flow.subtitle).toBeTruthy()
  expect(Array.isArray(data.flow.steps)).toBe(true)
  expect(data.flow.steps.length).toBeGreaterThan(0)
  expect(data.flow.conclusionTitle).toBeTruthy()
  expect(data.flow.conclusionText).toBeTruthy()

  // overviewTable
  expect(data.overviewTable.title).toBeTruthy()
  expect(Array.isArray(data.overviewTable.rows)).toBe(true)
  expect(data.overviewTable.rows.length).toBeGreaterThan(0)

  // faq
  expect(data.faq.title).toBeTruthy()
  expect(Array.isArray(data.faq.items)).toBe(true)
  expect(data.faq.items.length).toBeGreaterThan(0)

  // otherTrainingPrograms
  expect(data.otherTrainingPrograms.title).toBeTruthy()
  expect(data.otherTrainingPrograms.currentPageId).toBeTruthy()
  expect(Array.isArray(data.otherTrainingPrograms.programs)).toBe(true)

  // finalCTA
  expect(data.finalCTA.title).toBeTruthy()
  expect(data.finalCTA.description).toBeTruthy()
  expect(data.finalCTA.inquiryHref).toBeTruthy()
  expect(data.finalCTA.documentHref).toBeTruthy()
}

// -------------------------------------------------------
// 1. METADATA 検証
// -------------------------------------------------------
describe('ServicePageMetadata 型準拠', () => {
  it('CLAUDE_TRAINING_METADATA が必須フィールドを持つ', () => {
    assertMetadata(CLAUDE_TRAINING_METADATA, 'claude-training')
  })

  it('AI_SHORT_VIDEO_TRAINING_METADATA が必須フィールドを持つ', () => {
    assertMetadata(AI_SHORT_VIDEO_TRAINING_METADATA, 'ai-short-video-training')
  })

  it('AI_ANIMATION_TRAINING_METADATA が必須フィールドを持つ', () => {
    assertMetadata(AI_ANIMATION_TRAINING_METADATA, 'ai-animation-training')
  })
})

// -------------------------------------------------------
// 2. ServiceData 必須フィールド検証
// -------------------------------------------------------
describe('ServiceData 必須フィールド網羅', () => {
  it('CLAUDE_TRAINING_DATA が全必須フィールドを持つ', () => {
    assertServiceData(CLAUDE_TRAINING_DATA)
  })

  it('AI_SHORT_VIDEO_TRAINING_DATA が全必須フィールドを持つ', () => {
    assertServiceData(AI_SHORT_VIDEO_TRAINING_DATA)
  })

  it('AI_ANIMATION_TRAINING_DATA が全必須フィールドを持つ', () => {
    assertServiceData(AI_ANIMATION_TRAINING_DATA)
  })

  it('additionalCTA（optional）が存在する場合は必須フィールドを持つ', () => {
    for (const data of [CLAUDE_TRAINING_DATA, AI_SHORT_VIDEO_TRAINING_DATA, AI_ANIMATION_TRAINING_DATA]) {
      if (data.additionalCTA) {
        expect(data.additionalCTA.title).toBeTruthy()
        expect(data.additionalCTA.description).toBeTruthy()
        expect(data.additionalCTA.inquiryHref).toBeTruthy()
        expect(data.additionalCTA.documentHref).toBeTruthy()
      }
    }
  })
})

// -------------------------------------------------------
// 3. generateOtherTrainingProgramsData の戻り値整合性
// -------------------------------------------------------
describe('generateOtherTrainingProgramsData の戻り値', () => {
  it('claude-training スラッグを渡すと自身が除外される', () => {
    const result = generateOtherTrainingProgramsData('claude-training')
    expect(result.title).toBeTruthy()
    expect(result.currentPageId).toBe('claude-training')
    const ids = result.programs.map(p => p.id)
    expect(ids).not.toContain('claude-training')
  })

  it('ai-short-video-training スラッグを渡すと自身が除外される', () => {
    const result = generateOtherTrainingProgramsData('ai-short-video-training')
    expect(result.currentPageId).toBe('ai-short-video-training')
    const ids = result.programs.map(p => p.id)
    expect(ids).not.toContain('ai-short-video-training')
  })

  it('ai-animation-training スラッグを渡すと自身が除外される', () => {
    const result = generateOtherTrainingProgramsData('ai-animation-training')
    expect(result.currentPageId).toBe('ai-animation-training')
    const ids = result.programs.map(p => p.id)
    expect(ids).not.toContain('ai-animation-training')
  })

  it('各 program に必須フィールドが揃っている', () => {
    const result = generateOtherTrainingProgramsData('claude-training')
    for (const program of result.programs) {
      expect(program.id).toBeTruthy()
      expect(program.title).toBeTruthy()
      expect(program.description).toBeTruthy()
      expect(program.href).toBeTruthy()
      expect(program.image).toBeTruthy()
      expect(typeof program.available).toBe('boolean')
      expect(['enterprise', 'individual']).toContain(program.category)
    }
  })
})

// -------------------------------------------------------
// 4. generateServiceMetadata の OG画像解決
// -------------------------------------------------------
describe('generateServiceMetadata の serviceImageMapping 解決', () => {
  it('claude-training の OG画像がマッピングから解決される', () => {
    const meta = generateServiceMetadata(CLAUDE_TRAINING_METADATA)
    const ogImages = meta.openGraph?.images
    expect(ogImages).toBeDefined()
    const images = Array.isArray(ogImages) ? ogImages : [ogImages]
    const firstUrl = typeof images[0] === 'string' ? images[0] : (images[0] as { url: string }).url
    expect(firstUrl).toContain('claude-training')
    expect(firstUrl).not.toContain('ogpImageimage')
  })

  it('ai-short-video-training の OG画像がマッピングから解決される', () => {
    const meta = generateServiceMetadata(AI_SHORT_VIDEO_TRAINING_METADATA)
    const ogImages = meta.openGraph?.images
    const images = Array.isArray(ogImages) ? ogImages : [ogImages]
    const firstUrl = typeof images[0] === 'string' ? images[0] : (images[0] as { url: string }).url
    expect(firstUrl).toContain('ai-short-video-training')
    expect(firstUrl).not.toContain('ogpImageimage')
  })

  it('ai-animation-training の OG画像がマッピングから解決される', () => {
    const meta = generateServiceMetadata(AI_ANIMATION_TRAINING_METADATA)
    const ogImages = meta.openGraph?.images
    const images = Array.isArray(ogImages) ? ogImages : [ogImages]
    const firstUrl = typeof images[0] === 'string' ? images[0] : (images[0] as { url: string }).url
    expect(firstUrl).toContain('ai-animation-training')
    expect(firstUrl).not.toContain('ogpImageimage')
  })

  it('twitter images も同じ OG画像を参照する', () => {
    for (const [meta, slug] of [
      [CLAUDE_TRAINING_METADATA, 'claude-training'],
      [AI_SHORT_VIDEO_TRAINING_METADATA, 'ai-short-video-training'],
      [AI_ANIMATION_TRAINING_METADATA, 'ai-animation-training'],
    ] as const) {
      const result = generateServiceMetadata(meta)
      const twitterImages = result.twitter?.images
      const images = Array.isArray(twitterImages) ? twitterImages : [twitterImages]
      const firstUrl = typeof images[0] === 'string' ? images[0] : String(images[0])
      expect(firstUrl).toContain(slug)
    }
  })
})

// -------------------------------------------------------
// 5. page.tsx の export 構造検証（静的インポートで確認）
// -------------------------------------------------------
describe('page.tsx の export 構造', () => {
  it('claude-training/page.tsx が metadata と default export を持つ', async () => {
    const mod = await import('@/app/services/claude-training/page')
    expect(mod.metadata).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('ai-short-video-training/page.tsx が metadata と default export を持つ', async () => {
    const mod = await import('@/app/services/ai-short-video-training/page')
    expect(mod.metadata).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('ai-animation-training/page.tsx が metadata と default export を持つ', async () => {
    const mod = await import('@/app/services/ai-animation-training/page')
    expect(mod.metadata).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })
})
