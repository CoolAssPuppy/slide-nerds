import { Resend } from 'resend'

type SendTeamInviteEmailOptions = {
  to: string
  inviterName: string
  teamName: string
  token: string
  origin: string
}

const getResend = (): Resend | null => {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function sendTeamInviteEmail({
  to,
  inviterName,
  teamName,
  token,
  origin,
}: SendTeamInviteEmailOptions): Promise<void> {
  const inviteUrl = `${origin}/team/invite?token=${token}`
  const subject = `${inviterName} has invited you to share slides on SlideNerds`

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 520px; margin: 0 auto; padding: 40px 20px;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 22px; font-weight: 700; color: #111; margin: 0;">SlideNerds</h1>
        </div>

        <!-- Card -->
        <div style="background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px;">
          <h2 style="font-size: 18px; font-weight: 600; color: #111; margin: 0 0 8px;">You're invited to collaborate</h2>
          <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 24px;">
            <strong>${inviterName}</strong> wants to share slide decks, brand settings, and analytics with you on SlideNerds.
          </p>

          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 28px; background-color: #3ECF8E; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
            Accept invitation
          </a>

          <p style="font-size: 13px; color: #999; margin-top: 24px; line-height: 1.5;">
            Or paste this link in your browser:<br/>
            <a href="${inviteUrl}" style="color: #3ECF8E; word-break: break-all;">${inviteUrl}</a>
          </p>
        </div>

        <!-- About SlideNerds -->
        <div style="margin-top: 32px; padding: 24px; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h3 style="font-size: 14px; font-weight: 600; color: #111; margin: 0 0 12px;">What is SlideNerds?</h3>
          <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0 0 12px;">
            SlideNerds turns any Next.js app into a presentation. Point Claude or GPT at your project, describe what you want, and the LLM builds beautiful slides using 20 built-in skills.
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #666; vertical-align: top; width: 24px;">&#9679;</td>
              <td style="padding: 6px 0; font-size: 13px; color: #666;">100+ animations, transitions, and effects</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #666; vertical-align: top;">&#9679;</td>
              <td style="padding: 6px 0; font-size: 13px; color: #666;">Live polls, Q&A, and audience reactions</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #666; vertical-align: top;">&#9679;</td>
              <td style="padding: 6px 0; font-size: 13px; color: #666;">Per-slide analytics and engagement tracking</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #666; vertical-align: top;">&#9679;</td>
              <td style="padding: 6px 0; font-size: 13px; color: #666;">Export to PDF and PowerPoint</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #666; vertical-align: top;">&#9679;</td>
              <td style="padding: 6px 0; font-size: 13px; color: #666;">Free and open source</td>
            </tr>
          </table>
          <p style="margin: 16px 0 0;">
            <a href="https://slidenerds.com" style="font-size: 13px; color: #3ECF8E; font-weight: 500; text-decoration: none;">Learn more at slidenerds.com &rarr;</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px;">
          <p style="font-size: 12px; color: #aaa; line-height: 1.5;">
            This invitation expires in 7 days.<br/>
            Sent by SlideNerds on behalf of ${inviterName}.
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  const resend = getResend()
  if (!resend) {
    console.info('[email] RESEND_API_KEY not set. Logging invite email instead.')
    console.info(`[email] To: ${to}`)
    console.info(`[email] Subject: ${subject}`)
    console.info(`[email] Invite URL: ${inviteUrl}`)
    return
  }

  await resend.emails.send({
    from: 'SlideNerds <noreply@emails.slidenerds.com>',
    to,
    subject,
    html,
  })
}
