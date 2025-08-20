import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || ''

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      document_id,
      company_name,
      name,
      email,
      phone,
      department,
      position,
      message,
    } = body

    // Supabaseに保存
    const supabase = await createClient()
    
    // 資料情報を取得（file_urlも含める）
    const { data: document } = await supabase
      .from('documents')
      .select('title, file_url')
      .eq('id', document_id)
      .single()

    // 資料請求を保存
    const { error: insertError } = await supabase
      .from('document_requests')
      .insert({
        document_id,
        company_name,
        name,
        email,
        phone,
        department,
        position,
        message,
      })

    if (insertError) {
      console.error('Error saving document request:', insertError)
      return NextResponse.json(
        { error: 'Failed to save request' },
        { status: 500 }
      )
    }

    // ダウンロード数を更新
    const { data: currentDoc } = await supabase
      .from('documents')
      .select('download_count')
      .eq('id', document_id)
      .single()
    
    await supabase
      .from('documents')
      .update({ download_count: (currentDoc?.download_count || 0) + 1 })
      .eq('id', document_id)

    // Slackに通知
    if (SLACK_WEBHOOK_URL) {
      const slackMessage: {
        text: string;
        blocks: Array<{
          type: string;
          text?: { type: string; text: string };
          fields?: Array<{ type: string; text: string }>;
          elements?: Array<{ type: string; text: string }>;
        }>;
      } = {
        text: '新しい資料請求がありました',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📄 新しい資料請求',
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*資料名:*\n${document?.title || '不明'}`,
              },
              {
                type: 'mrkdwn',
                text: `*会社名:*\n${company_name}`,
              },
              {
                type: 'mrkdwn',
                text: `*お名前:*\n${name}`,
              },
              {
                type: 'mrkdwn',
                text: `*メールアドレス:*\n${email}`,
              },
              {
                type: 'mrkdwn',
                text: `*電話番号:*\n${phone || '未入力'}`,
              },
              {
                type: 'mrkdwn',
                text: `*部署:*\n${department || '未入力'}`,
              },
              {
                type: 'mrkdwn',
                text: `*役職:*\n${position || '未入力'}`,
              },
            ],
          },
        ],
      }

      if (message) {
        slackMessage.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*ご要望・ご質問:*\n${message}`,
          },
        })
      }

      slackMessage.blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
          },
        ],
      })

      try {
        await fetch(SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slackMessage),
        })
      } catch (slackError) {
        console.error('Error sending Slack notification:', slackError)
      }
    }

    return NextResponse.json({ 
      success: true,
      downloadUrl: document?.file_url || null
    })
  } catch (error) {
    console.error('Error processing document request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}