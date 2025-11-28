// プロジェクトカテゴリの色定義（背景色付き - 関連プロジェクト用）
export const CATEGORY_COLORS = {
  'homepage': 'bg-purple-100 text-purple-700',
  'landing-page': 'bg-pink-100 text-pink-700',
  'web-app': 'bg-blue-100 text-blue-700',
  'mobile-app': 'bg-green-100 text-green-700',
  'video': 'bg-orange-100 text-orange-700'
} as const;

// プロジェクトカテゴリのボーダー色定義（白背景 + ボーダー - 一覧・詳細ページ用）
export const CATEGORY_BORDER_COLORS = {
  'homepage': 'border-purple-200 text-purple-700',
  'landing-page': 'border-pink-200 text-pink-700',
  'web-app': 'border-blue-200 text-blue-700',
  'mobile-app': 'border-green-200 text-green-700',
  'video': 'border-orange-200 text-orange-700'
} as const;

// プロジェクトカテゴリのラベル
export const CATEGORY_LABELS = {
  'homepage': 'ホームページ',
  'landing-page': 'ランディングページ',
  'web-app': 'Webアプリ',
  'mobile-app': 'モバイルアプリ',
  'video': '動画制作'
} as const;

// プロジェクトカテゴリの型定義
export type ProjectCategory = keyof typeof CATEGORY_LABELS;

// プロジェクトカテゴリのアイコン色（統計表示用）
export const CATEGORY_ICON_COLORS = {
  'homepage': 'text-purple-600',
  'landing-page': 'text-pink-600',
  'web-app': 'text-blue-600',
  'mobile-app': 'text-green-600',
  'video': 'text-orange-600'
} as const;

// ボタンのスタイル定義
export const PROJECT_BUTTON_STYLES = {
  primary: 'bg-portfolio-blue text-white hover:opacity-90 hover:shadow-md',
  secondary: 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200',
  github: 'bg-gray-800 text-white hover:opacity-90 hover:shadow-md',
  videoSecondary: 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-red-50 hover:border-red-500 hover:text-red-700',
  promptSecondary: 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-green-50 hover:border-green-500 hover:text-green-700'
} as const;