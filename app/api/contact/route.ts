import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

// Slack Webhook URL should be in environment variable for security
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || ''

interface ContactFormData {
  name: string
  company?: string
  email: string
  message: string
  inquiry_type?: 'service' | 'partnership' | 'recruit' | 'other'
  service_type?: string
}

// 研修タイプのラベルマッピング
const serviceTypeLabels: Record<string, string> = {
  'comprehensive-ai-training': '生成AI総合研修',
  'ai-writing-training': 'AIライティング研修',
  'ai-video-training': 'AI動画生成研修',
  'ai-coding-training': 'AIコーディング研修',
  'practical-ai-training': '生成AI実務活用研修',
  'ai-talent-development': 'AI人材育成所（個人向け）',
  'other-service': 'その他・未定',
}

export async function POST(request: NextRequest) {
  console.log('Contact form API called')
  
  try {
    const data: ContactFormData = await request.json()
    console.log('Form data received:', { name: data.name, email: data.email, company: data.company })

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { error: '必須項目を入力してください' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      )
    }

    // Save to database
    const supabase = await createClient()
    const { data: contact, error: dbError } = await supabase
      .from('contacts')
      .insert({
        name: data.name,
        company: data.company || null,
        email: data.email,
        message: data.message,
        inquiry_type: data.inquiry_type || 'other',
        service_type: data.inquiry_type === 'service' ? (data.service_type || null) : null
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      )
    }

    // Send to Slack
    console.log('Slack webhook URL exists:', !!SLACK_WEBHOOK_URL)
    console.log('Slack webhook URL length:', SLACK_WEBHOOK_URL.length)
    
    if (SLACK_WEBHOOK_URL) {
      // お問い合わせ種別のラベル
      const inquiryTypeLabels: Record<string, string> = {
        'service': 'サービスについて',
        'partnership': '提携・協業',
        'recruit': '採用関連',
        'other': 'その他',
      }
      const inquiryTypeLabel = inquiryTypeLabels[data.inquiry_type || 'other'] || 'その他'

      // 研修タイプの表示用テキスト
      const serviceTypeText = data.inquiry_type === 'service' && data.service_type
        ? `\n*ご興味のある研修:*\n${serviceTypeLabels[data.service_type] || data.service_type}`
        : ''

      const slackMessage = {
        text: '新しいお問い合わせがありました',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🎉 新しいお問い合わせ',
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*お名前:*\n${data.name}`
              },
              {
                type: 'mrkdwn',
                text: `*会社名:*\n${data.company || '記載なし'}`
              },
              {
                type: 'mrkdwn',
                text: `*メール:*\n${data.email}`
              },
              {
                type: 'mrkdwn',
                text: `*お問い合わせ種別:*\n${inquiryTypeLabel}`
              }
            ]
          },
          ...(serviceTypeText ? [{
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*ご興味のある研修:*\n${serviceTypeLabels[data.service_type!] || data.service_type}`
            }
          }] : []),
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*メッセージ:*\n${data.message}`
            }
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

      console.log('Sending message to Slack...')
      const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      })

      console.log('Slack response status:', slackResponse.status)
      console.log('Slack response ok:', slackResponse.ok)
      
      if (!slackResponse.ok) {
        const responseText = await slackResponse.text()
        console.error('Slack notification failed:', slackResponse.statusText, responseText)
        // Continue processing even if Slack fails
      } else {
        console.log('Slack notification sent successfully')
      }
    } else {
      console.warn('Slack webhook URL not found in environment variables')
    }

    return NextResponse.json(
      { success: true, message: 'お問い合わせを受け付けました' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}