import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_id, company_name, name, email, phone, department, position, message } = body

    const supabase = await createClient()

    // プロジェクト情報を取得
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, prompt')
      .eq('id', project_id)
      .single()

    if (projectError || !project || !project.prompt) {
      return NextResponse.json(
        { error: 'プロジェクトまたはプロンプトが見つかりません' },
        { status: 404 }
      )
    }

    // お問い合わせ情報を保存
    const { error: contactError } = await supabase
      .from('contacts')
      .insert({
        type: 'prompt_request',
        company_name,
        name,
        email,
        phone,
        department,
        position,
        message,
        metadata: {
          project_id,
          project_title: project.title
        }
      })

    if (contactError) {
      console.error('Contact save error:', contactError)
      return NextResponse.json(
        { error: 'お問い合わせの保存に失敗しました' },
        { status: 500 }
      )
    }

    // プロンプトをCSV形式に変換
    const csvContent = convertPromptsToCSV(project.prompt, project.title)

    return NextResponse.json({
      success: true,
      csvContent
    })

  } catch (error) {
    console.error('Prompt request error:', error)
    return NextResponse.json(
      { error: 'リクエストの処理に失敗しました' },
      { status: 500 }
    )
  }
}

function convertPromptsToCSV(promptData: string, projectTitle: string): string {
  try {
    // プロンプトデータがJSON形式の場合
    const prompts = typeof promptData === 'string' ? JSON.parse(promptData) : promptData
    
    // CSV ヘッダー
    const headers = ['番号', 'カテゴリ', 'プロンプト', '説明', '作成日時']
    const rows = [headers]

    // プロンプトが配列の場合
    if (Array.isArray(prompts)) {
      prompts.forEach((prompt, index) => {
        rows.push([
          (index + 1).toString(),
          prompt.category || '',
          prompt.prompt || '',
          prompt.description || '',
          prompt.created_at || new Date().toISOString()
        ])
      })
    } else if (typeof prompts === 'object') {
      // プロンプトがオブジェクトの場合
      Object.entries(prompts).forEach(([key, value], index) => {
        rows.push([
          (index + 1).toString(),
          key,
          String(value),
          '',
          new Date().toISOString()
        ])
      })
    } else {
      // プロンプトが文字列の場合
      rows.push([
        '1',
        'general',
        String(prompts),
        projectTitle,
        new Date().toISOString()
      ])
    }

    // CSVに変換（日本語対応）
    const csvString = rows
      .map(row => row.map(cell => {
        // セル内にカンマ、改行、ダブルクォートが含まれる場合はダブルクォートで囲む
        const cellStr = String(cell)
        if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(','))
      .join('\n')

    // BOMを付けて日本語の文字化けを防ぐ
    return '\ufeff' + csvString
  } catch (error) {
    console.error('CSV conversion error:', error)
    // エラーの場合はシンプルなCSVを返す
    return '\ufeff番号,プロンプト\n1,' + String(promptData)
  }
}