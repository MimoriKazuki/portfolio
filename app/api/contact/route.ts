import { NextRequest, NextResponse } from 'next/server'

// Slack Webhook URL should be in environment variable for security
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || ''

interface ContactFormData {
  name: string
  company?: string
  email: string
  message: string
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

    // Send to Slack
    console.log('Slack webhook URL exists:', !!SLACK_WEBHOOK_URL)
    console.log('Slack webhook URL length:', SLACK_WEBHOOK_URL.length)
    
    if (SLACK_WEBHOOK_URL) {
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
              }
            ]
          },
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