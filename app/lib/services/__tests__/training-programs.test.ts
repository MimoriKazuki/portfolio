import { describe, it, expect } from 'vitest'
import {
  ALL_TRAINING_PROGRAMS,
  getOtherTrainingPrograms,
  generateOtherTrainingProgramsData,
} from '@/app/lib/services/training-programs'

// -------------------------------------------------------
// 期待する並び順・ID一覧（コミット32fbe99 の仕様）
// -------------------------------------------------------
const EXPECTED_IDS_IN_ORDER = [
  'ai-coding',
  'claude-training',
  'ai-organization-os',
  'ai-video',
  'ai-short-video-training',
  'ai-animation-training',
  'individual-coaching',
]

const EXPECTED_ENTERPRISE_IDS = [
  'ai-coding',
  'claude-training',
  'ai-organization-os',
  'ai-video',
  'ai-short-video-training',
  'ai-animation-training',
]

// -------------------------------------------------------
// 1. ALL_TRAINING_PROGRAMS の配列長・並び順・ID検証
// -------------------------------------------------------
describe('ALL_TRAINING_PROGRAMS の構成', () => {
  it('合計7件（enterprise 6 + individual 1）', () => {
    expect(ALL_TRAINING_PROGRAMS).toHaveLength(7)
  })

  it('enterprise カテゴリが6件', () => {
    const enterprise = ALL_TRAINING_PROGRAMS.filter(p => p.category === 'enterprise')
    expect(enterprise).toHaveLength(6)
  })

  it('individual カテゴリが1件', () => {
    const individual = ALL_TRAINING_PROGRAMS.filter(p => p.category === 'individual')
    expect(individual).toHaveLength(1)
  })

  it('ID の並び順が仕様通り', () => {
    const ids = ALL_TRAINING_PROGRAMS.map(p => p.id)
    expect(ids).toEqual(EXPECTED_IDS_IN_ORDER)
  })

  it('enterprise 6件の ID が全て揃っている', () => {
    const enterpriseIds = ALL_TRAINING_PROGRAMS
      .filter(p => p.category === 'enterprise')
      .map(p => p.id)
    expect(enterpriseIds).toEqual(EXPECTED_ENTERPRISE_IDS)
  })

  it('各エントリに必須フィールドが揃っている', () => {
    for (const program of ALL_TRAINING_PROGRAMS) {
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
// 2. comprehensive-ai-training が除外されていること
// -------------------------------------------------------
describe('comprehensive-ai-training の除外確認', () => {
  it('ALL_TRAINING_PROGRAMS に comprehensive-ai-training が含まれない', () => {
    const ids = ALL_TRAINING_PROGRAMS.map(p => p.id)
    expect(ids).not.toContain('comprehensive-ai-training')
  })
})

// -------------------------------------------------------
// 3. getOtherTrainingPrograms の戻り値検証
// -------------------------------------------------------
describe('getOtherTrainingPrograms', () => {
  it('存在する ID を渡すと自身が除外され残り6件が返る', () => {
    for (const id of EXPECTED_IDS_IN_ORDER) {
      const result = getOtherTrainingPrograms(id)
      expect(result).toHaveLength(6)
      const ids = result.map(p => p.id)
      expect(ids).not.toContain(id)
    }
  })

  it('存在しない ID を渡すと全7件がそのまま返る', () => {
    const result = getOtherTrainingPrograms('non-existent-id')
    expect(result).toHaveLength(7)
  })

  it('各 enterprise ID を渡したとき enterprise 以外の ID が除外対象にならない', () => {
    const result = getOtherTrainingPrograms('ai-coding')
    const ids = result.map(p => p.id)
    expect(ids).toContain('individual-coaching')
  })

  it('返り値の並び順は元配列の順序を維持する', () => {
    const result = getOtherTrainingPrograms('ai-coding')
    const ids = result.map(p => p.id)
    const expected = EXPECTED_IDS_IN_ORDER.filter(id => id !== 'ai-coding')
    expect(ids).toEqual(expected)
  })
})

// -------------------------------------------------------
// 4. generateOtherTrainingProgramsData の戻り値構造
// -------------------------------------------------------
describe('generateOtherTrainingProgramsData の戻り値構造', () => {
  it('title・currentPageId・programs の3キーを持つ', () => {
    const result = generateOtherTrainingProgramsData('claude-training')
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('currentPageId')
    expect(result).toHaveProperty('programs')
  })

  it('currentPageId に渡した slug が反映される', () => {
    for (const id of EXPECTED_IDS_IN_ORDER) {
      const result = generateOtherTrainingProgramsData(id)
      expect(result.currentPageId).toBe(id)
    }
  })

  it('programs は getOtherTrainingPrograms の戻り値と一致する', () => {
    for (const id of EXPECTED_IDS_IN_ORDER) {
      const result = generateOtherTrainingProgramsData(id)
      const expected = getOtherTrainingPrograms(id)
      expect(result.programs).toEqual(expected)
    }
  })

  it('新3研修スラッグ（claude-training / ai-short-video-training / ai-animation-training）を渡したとき programs に自身が含まれない', () => {
    const newSlugs = ['claude-training', 'ai-short-video-training', 'ai-animation-training']
    for (const slug of newSlugs) {
      const result = generateOtherTrainingProgramsData(slug)
      const ids = result.programs.map(p => p.id)
      expect(ids).not.toContain(slug)
    }
  })
})
