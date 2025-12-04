import Link from 'next/link'

/**
 * テキスト内のURLを自動的にリンクに変換するユーティリティ
 */

// URL正規表現パターン（ASCII文字のみを許可し、日本語や特殊文字を除外）
const URL_REGEX = /(https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+)/g

// URLの末尾から除去すべき文字（句読点など）
const TRAILING_PUNCTUATION = /[.,;:!?）」』】〉》。、！？]+$/

/**
 * テキスト内のURLをリンクに変換してReact要素の配列を返す
 */
export function linkifyText(text: string): React.ReactNode[] {
  if (!text) return []

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let keyIndex = 0

  // URLパターンにマッチする部分を検索
  const regex = new RegExp(URL_REGEX)

  while ((match = regex.exec(text)) !== null) {
    // マッチ前のテキスト部分を追加
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // URLから末尾の句読点を除去
    let url = match[1]
    const trailingMatch = url.match(TRAILING_PUNCTUATION)
    if (trailingMatch) {
      url = url.slice(0, -trailingMatch[0].length)
      // 正規表現のlastIndexを調整して、除去した文字を次の処理に含める
      regex.lastIndex -= trailingMatch[0].length
    }
    const isInternal = url.startsWith('https://www.landbridge.ai') || url.startsWith('https://landbridge.ai')

    // URLをリンクに変換
    if (isInternal) {
      // 内部リンクはNext.js Linkを使用
      const path = url.replace(/^https?:\/\/(www\.)?landbridge\.ai/, '')
      parts.push(
        <Link
          key={keyIndex++}
          href={path || '/'}
          className="text-portfolio-blue hover:underline break-all"
        >
          {url}
        </Link>
      )
    } else {
      // 外部リンクは新しいタブで開く
      parts.push(
        <a
          key={keyIndex++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-portfolio-blue hover:underline break-all"
        >
          {url}
        </a>
      )
    }

    lastIndex = regex.lastIndex
  }

  // 残りのテキスト部分を追加
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

/**
 * テキストをリンク化して表示するコンポーネント
 */
interface LinkifiedTextProps {
  text: string
  className?: string
}

export function LinkifiedText({ text, className = '' }: LinkifiedTextProps) {
  const content = linkifyText(text)

  return (
    <span className={className}>
      {content}
    </span>
  )
}
