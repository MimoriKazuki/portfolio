import type { FAQItem } from '@/app/components/organisms/landing/FAQAccordion'

/**
 * B001 LP の FAQ セクション仮素材。
 * 実コンテンツはディレクター（Kosuke）が後で確定。差し替え時はこのファイルだけ更新する。
 */
export const dummyFAQs: FAQItem[] = [
  {
    question: '無料で試せますか？',
    answer:
      '無料体験コースをご用意しています。Google アカウントでログイン後、すぐに視聴を開始できます。',
  },
  {
    question: '支払い方法は何が使えますか？',
    answer: 'Stripe 決済（クレジットカード）に対応しています。法人払いはお問い合わせください。',
  },
  {
    question: '購入後の返金はできますか？',
    answer:
      '原則として購入後の返金はお受けしておりません。詳しくはお問い合わせフォームよりご相談ください。',
  },
  {
    question: '法人で複数アカウントを発行できますか？',
    answer:
      '法人向けの一括契約プランをご用意しています。お問い合わせフォームより詳細をご確認ください。',
  },
]
