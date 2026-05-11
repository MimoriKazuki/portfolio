import { describe, it, expect } from 'vitest'
import {
  DEFAULT_ENTERPRISE_SERVICE,
  DEFAULT_INDIVIDUAL_SERVICE,
  getServiceById,
  getSelectedServices,
} from '@/app/lib/services/service-selector'
import { generateServiceMetadata } from '@/app/lib/services/common'
import type { ServicePageMetadata } from '@/app/lib/types/service'

// generateServiceMetadata に渡すダミー METADATA を生成するヘルパー
function makeMetadata(slug: string): ServicePageMetadata {
  return {
    title: `Test ${slug}`,
    description: 'test description',
    keywords: ['test'],
    url: `https://www.landbridge.ai/services/${slug}`,
  }
}

// OG画像 URL を取り出すヘルパー
function getOgImageUrl(meta: ReturnType<typeof generateServiceMetadata>): string {
  const images = meta.openGraph?.images
  const arr = Array.isArray(images) ? images : [images]
  const first = arr[0]
  return typeof first === 'string' ? first : (first as { url: string }).url
}

// -------------------------------------------------------
// 1. serviceImageMapping に comprehensive-ai-training が含まれない
// -------------------------------------------------------
describe('serviceImageMapping から comprehensive-ai-training の除外', () => {
  it('comprehensive-ai-training スラッグを渡すとフォールバック OG画像を返す', () => {
    const meta = generateServiceMetadata(makeMetadata('comprehensive-ai-training'))
    const ogUrl = getOgImageUrl(meta)
    expect(ogUrl).toContain('AI_driven_ogpImageimage.png')
    expect(ogUrl).not.toContain('comprehensive-ai-training')
  })

  it('twitter images も同様にフォールバック OG画像を返す', () => {
    const meta = generateServiceMetadata(makeMetadata('comprehensive-ai-training'))
    const twitterImages = meta.twitter?.images
    const arr = Array.isArray(twitterImages) ? twitterImages : [twitterImages]
    const firstUrl = String(arr[0])
    expect(firstUrl).toContain('AI_driven_ogpImageimage.png')
  })
})

// -------------------------------------------------------
// 2. 存在するスラッグは引き続き正しい OG画像を返す（回帰）
// -------------------------------------------------------
describe('serviceImageMapping の残存スラッグ（回帰確認）', () => {
  const validSlugs = [
    'ai-organization-os',
    'ai-video-training',
    'ai-coding-training',
    'ai-talent-development',
    'claude-training',
    'ai-short-video-training',
    'ai-animation-training',
  ]

  for (const slug of validSlugs) {
    it(`${slug} はマッピングから解決され ogpImageimage.png を使わない`, () => {
      const meta = generateServiceMetadata(makeMetadata(slug))
      const ogUrl = getOgImageUrl(meta)
      expect(ogUrl).toContain(slug)
      expect(ogUrl).not.toContain('AI_driven_ogpImageimage.png')
    })
  }
})

// -------------------------------------------------------
// 3. DEFAULT_ENTERPRISE_SERVICE の値
// -------------------------------------------------------
describe('DEFAULT_ENTERPRISE_SERVICE', () => {
  it("値が 'ai-coding-training' である", () => {
    expect(DEFAULT_ENTERPRISE_SERVICE).toBe('ai-coding-training')
  })

  it("値が 'comprehensive-ai-training' でない", () => {
    expect(DEFAULT_ENTERPRISE_SERVICE).not.toBe('comprehensive-ai-training')
  })
})

// -------------------------------------------------------
// 4. getServiceById(DEFAULT_ENTERPRISE_SERVICE) が ai-coding-training を返す
// -------------------------------------------------------
describe('getServiceById(DEFAULT_ENTERPRISE_SERVICE)', () => {
  it('undefined でなく OtherTrainingProgram を返す', () => {
    const result = getServiceById(DEFAULT_ENTERPRISE_SERVICE)
    expect(result).toBeDefined()
  })

  it('id が ai-coding-training', () => {
    const result = getServiceById(DEFAULT_ENTERPRISE_SERVICE)
    expect(result?.id).toBe('ai-coding-training')
  })

  it('category が enterprise', () => {
    const result = getServiceById(DEFAULT_ENTERPRISE_SERVICE)
    expect(result?.category).toBe('enterprise')
  })

  it('comprehensive-ai-training を渡すと undefined を返す（ALL_TRAINING_PROGRAMS に存在しない）', () => {
    const result = getServiceById('comprehensive-ai-training')
    expect(result).toBeUndefined()
  })
})

// -------------------------------------------------------
// 5. getSelectedServices のデフォルト動作
// -------------------------------------------------------
describe('getSelectedServices のデフォルト動作', () => {
  it('引数省略時に enterprise が ai-coding-training を返す', () => {
    const result = getSelectedServices()
    expect(result.enterprise).toBeDefined()
    expect(result.enterprise?.id).toBe('ai-coding-training')
  })

  it('引数省略時に individual が individual-coaching を返す', () => {
    const result = getSelectedServices()
    expect(result.individual).toBeDefined()
    expect(result.individual?.id).toBe(DEFAULT_INDIVIDUAL_SERVICE)
  })

  it('enterprise に undefined を渡したときも DEFAULT_ENTERPRISE_SERVICE が使われる', () => {
    const result = getSelectedServices(undefined, undefined)
    expect(result.enterprise?.id).toBe('ai-coding-training')
  })

  it('enterprise に comprehensive-ai-training を渡すと undefined を返す（除外済み）', () => {
    const result = getSelectedServices('comprehensive-ai-training')
    expect(result.enterprise).toBeUndefined()
  })
})
