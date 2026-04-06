import { Resend } from 'resend'

type SendTeamInviteEmailOptions = {
  to: string
  inviterName: string
  teamName: string
  token: string
  origin: string
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">You have been invited to join a team</h2>
      <p style="font-size: 15px; color: #555; line-height: 1.5; margin: 0 0 8px;">
        <strong>${inviterName}</strong> invited you to join <strong>${teamName}</strong> on SlideNerds.
      </p>
      <p style="font-size: 15px; color: #555; line-height: 1.5; margin: 0 0 24px;">
        Click the button below to view and accept the invitation.
      </p>
      <a href="${inviteUrl}" style="display: inline-block; padding: 10px 24px; background-color: #3ECF8E; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;">
        View invitation
      </a>
      <p style="font-size: 13px; color: #999; margin-top: 32px; line-height: 1.5;">
        If the button does not work, copy and paste this link into your browser:<br/>
        <a href="${inviteUrl}" style="color: #3ECF8E;">${inviteUrl}</a>
      </p>
    </div>
  `

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
