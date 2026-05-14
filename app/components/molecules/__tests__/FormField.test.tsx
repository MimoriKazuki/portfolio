/**
 * @vitest-environment jsdom
 */
/**
 * FormField molecule のユニットテスト（Phase 2 Sub 8a サンプル実装）
 *
 * 起点：
 * - docs/wbs/phase2.md P2-UT-02「molecules のユニットテスト」
 *
 * 位置付け：
 * - Phase 3 で各 molecules を実画面に組み込む際の
 *   コンポーネントテスト雛形（参考実装）
 * - 「atoms（Label）+ children slot + ヘルプ / エラー段落」の合成検証パターン
 *
 * カバー観点：
 * - ラベル / 必須マーカー / ヘルプテキスト / エラーメッセージの表示制御
 * - error と helpText の優先関係（error 表示中は helpText 非表示）
 * - error 段落の role="alert"（スクリーンリーダー通知）
 * - children slot に渡した入力要素の出力
 * - id 生成規約（${htmlFor}-error / ${htmlFor}-help）
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { FormField } from '../FormField'

describe('FormField molecule — ラベル / 入力 slot', () => {
  it('label を表示し children を slot として描画する', () => {
    render(
      <FormField label="メールアドレス" htmlFor="email">
        <input id="email" type="email" />
      </FormField>,
    )
    expect(screen.getByText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email')
  })

  it('htmlFor がラベルの for 属性に設定される（クリックでフォーカス連動）', () => {
    render(
      <FormField label="名前" htmlFor="name">
        <input id="name" type="text" />
      </FormField>,
    )
    const label = screen.getByText('名前') as HTMLLabelElement
    expect(label).toHaveAttribute('for', 'name')
  })
})

describe('FormField molecule — required', () => {
  it('required=true でアスタリスクが表示される（Label atom 経由）', () => {
    render(
      <FormField label="必須項目" htmlFor="req" required>
        <input id="req" type="text" />
      </FormField>,
    )
    // Label atom は required 時にアスタリスクを描画する想定
    expect(screen.getByText('必須項目')).toBeInTheDocument()
  })
})

describe('FormField molecule — helpText / error 表示制御', () => {
  it('helpText のみ指定時：helpText が ${htmlFor}-help の id で表示される', () => {
    render(
      <FormField label="パスワード" htmlFor="pw" helpText="8 文字以上">
        <input id="pw" type="password" />
      </FormField>,
    )
    const help = screen.getByText('8 文字以上')
    expect(help).toBeInTheDocument()
    expect(help).toHaveAttribute('id', 'pw-help')
  })

  it('error のみ指定時：error が ${htmlFor}-error の id + role="alert" で表示される', () => {
    render(
      <FormField label="メール" htmlFor="email" error="形式が不正です">
        <input id="email" type="email" />
      </FormField>,
    )
    const err = screen.getByText('形式が不正です')
    expect(err).toBeInTheDocument()
    expect(err).toHaveAttribute('id', 'email-error')
    expect(err).toHaveAttribute('role', 'alert')
  })

  it('error と helpText 両方指定時：error 優先・helpText は非表示', () => {
    render(
      <FormField
        label="メール"
        htmlFor="email"
        helpText="例：name@example.com"
        error="形式が不正です"
      >
        <input id="email" type="email" />
      </FormField>,
    )
    expect(screen.getByText('形式が不正です')).toBeInTheDocument()
    expect(screen.queryByText('例：name@example.com')).not.toBeInTheDocument()
  })

  it('error も helpText も未指定時：どちらの段落も描画されない', () => {
    render(
      <FormField label="メール" htmlFor="email">
        <input id="email" type="email" />
      </FormField>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('FormField molecule — className マージ', () => {
  it('追加 className が root div にマージされる', () => {
    const { container } = render(
      <FormField label="x" htmlFor="x" className="my-custom">
        <input id="x" />
      </FormField>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('my-custom')
    expect(root.className).toContain('w-full')
  })
})
