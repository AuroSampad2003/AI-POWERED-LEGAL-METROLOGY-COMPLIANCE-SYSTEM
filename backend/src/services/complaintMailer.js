import transporter from '../config/mailer.js';

const escalationEmailHtml = ({ fullName, complaintId, enforcementCaseId, productName, adminRemarks }) => `
  <div style="font-family: Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #101A2E;">
    <div style="background: #14532D; padding: 20px 24px; border-radius: 10px 10px 0 0;">
      <p style="margin: 0; color: #DCEEE1; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;">
        Legal Metrology Compliance Platform
      </p>
      <h1 style="margin: 6px 0 0; color: #ffffff; font-size: 18px;">Your complaint has been escalated</h1>
    </div>

    <div style="border: 1px solid #E4E7EC; border-top: none; border-radius: 0 0 10px 10px; padding: 24px;">
      <p style="font-size: 14px; line-height: 1.6;">Dear ${fullName || 'User'},</p>
      <p style="font-size: 14px; line-height: 1.6;">
        Your complaint regarding <strong>${productName || 'the reported product'}</strong> has been verified
        and escalated for enforcement action by our compliance team.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13.5px;">
        <tr>
          <td style="padding: 8px 0; color: #47536B; width: 180px;">Complaint ID</td>
          <td style="padding: 8px 0; font-weight: 600;">${complaintId}</td>
        </tr>
        <tr style="border-top: 1px solid #E4E7EC;">
          <td style="padding: 8px 0; color: #47536B;">Enforcement Case ID</td>
          <td style="padding: 8px 0; font-weight: 600; color: #14532D;">${enforcementCaseId}</td>
        </tr>
      </table>

      ${adminRemarks ? `
        <div style="background: #FAFBFA; border: 1px solid #E4E7EC; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 4px; font-size: 11.5px; font-weight: 600; color: #9099A8; text-transform: uppercase;">Admin remarks</p>
          <p style="margin: 0; font-size: 13.5px; line-height: 1.5;">${adminRemarks}</p>
        </div>
      ` : ''}

      <p style="font-size: 13.5px; line-height: 1.6; color: #47536B;">
        You can track this case and download the full compliance report anytime from your
        "My Complaints" page.
      </p>
      <p style="font-size: 12px; color: #9099A8; margin-top: 24px;">
        This is an automated notification. Please do not reply directly to this email.
      </p>
    </div>
  </div>
`;

export const sendEscalationEmail = async ({ to, fullName, complaintId, enforcementCaseId, productName, adminRemarks }) => {
    if (!to) {
        console.error('[Mailer] Skipped escalation email: recipient has no email address');
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject: `Your complaint has been escalated — Case ${enforcementCaseId}`,
            html: escalationEmailHtml({ fullName, complaintId, enforcementCaseId, productName, adminRemarks }),
        });
        console.log(`[Mailer] Escalation email sent to ${to} for ${enforcementCaseId}`);
    } catch (err) {
        // Deliberately non-fatal — a failed email should never break the
        // admin's escalation action or roll back the status change.
        console.error('[Mailer] Failed to send escalation email:', err.message);
    }
};