import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

// Slack Webhook URL
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || ''

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_id, company_name, name, email, phone, department, position, message } = body

    console.log('Prompt request received:', { project_id, company_name, name, email })

    const supabase = await createClient()

    // プロジェクト情報を取得
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, prompt, prompt_filename')
      .eq('id', project_id)
      .single()

    if (projectError) {
      console.error('Project fetch error:', projectError)
      return NextResponse.json(
        { error: 'プロジェクトの取得に失敗しました' },
        { status: 500 }
      )
    }

    if (!project) {
      console.error('Project not found:', project_id)
      return NextResponse.json(
        { error: 'プロジェクトが見つかりません' },
        { status: 404 }
      )
    }

    if (!project.prompt) {
      console.error('Project has no prompt:', project_id)
      return NextResponse.json(
        { error: 'このプロジェクトにはプロンプトが設定されていません' },
        { status: 404 }
      )
    }

    // お問い合わせ情報を保存
    const contactData = {
      type: 'prompt_request',
      company: company_name, // contactsテーブルではcompanyフィールド
      name,
      email,
      message: message || `プロンプトダウンロード: ${project.title}`,
      status: 'new',
      metadata: {
        project_id,
        project_title: project.title,
        phone,
        department,
        position
      }
    }
    
    console.log('Saving contact data:', contactData)
    
    const { error: contactError } = await supabase
      .from('contacts')
      .insert(contactData)

    if (contactError) {
      console.error('Contact save error:', contactError)
      return NextResponse.json(
        { error: 'お問い合わせの保存に失敗しました' },
        { status: 500 }
      )
    }

    // プロンプトをCSV形式に変換
    const csvContent = convertPromptsToCSV(project.prompt, project.title)

    // Send to Slack
    if (SLACK_WEBHOOK_URL) {
      const slackMessage = {
        text: '新しいプロンプトダウンロード',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📄 新しいプロンプトダウンロード',
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*プロジェクト:*\n${project.title}`
              },
              {
                type: 'mrkdwn',
                text: `*会社名:*\n${company_name}`
              },
              {
                type: 'mrkdwn',
                text: `*お名前:*\n${name}`
              },
              {
                type: 'mrkdwn',
                text: `*メール:*\n${email}`
              }
            ]
          },
          {
            type: 'divider'
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`
              }
            ]
          }
        ]
      }

      try {
        await fetch(SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slackMessage),
        })
      } catch (slackError) {
        console.error('Slack notification failed:', slackError)
        // Continue processing even if Slack fails
      }
    }

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
    // プロンプトデータは既にCSV形式で保存されているので、そのまま返す
    // BOMは追加しない（クライアント側で追加する）
    return promptData
  } catch (error) {
    console.error('CSV conversion error:', error)
    // エラーの場合はシンプルなCSVを返す
    return '番号,カテゴリ,プロンプト,説明\n1,general,プロンプトデータの読み込みに失敗しました,' + projectTitle
  }
}