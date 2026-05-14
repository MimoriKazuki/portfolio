import type { TestimonialItem } from '@/app/components/organisms/landing/TestimonialSection'

/**
 * B001 LP の受講生の声セクション仮素材。
 * 実コンテンツはディレクター（Kosuke）が後で確定。差し替え時はこのファイルだけ更新する。
 */
export const dummyTestimonials: TestimonialItem[] = [
  {
    name: '受講者 A',
    role: 'マーケティング部 / 30 代',
    quote:
      '業務の中で「ここに AI を入れればいい」と分かるようになり、レポート作成の時間が半分以下になりました。',
  },
  {
    name: '受講者 B',
    role: '営業企画 / 40 代',
    quote:
      'コース構成が体系的で、知識ゼロから業務に活かせるレベルまで段階的に理解できました。',
  },
  {
    name: '受講者 C',
    role: 'エンジニア / 20 代',
    quote:
      'API 連携の章が特に実践的で、自社プロダクトに Claude を組み込むイメージが具体的に持てました。',
  },
]
