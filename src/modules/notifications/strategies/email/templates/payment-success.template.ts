import { baseTemplate } from './base.template';

export const paymentSuccessTemplate = (data: {
    firstName: string;
    amount: string;
    currency: string;
    invoiceNumber: string;
    planName: string;
    nextBillingDate: string;
}) => ({
    subject: `Payment Successful - ${data.invoiceNumber}`,
    html: baseTemplate(`
        <div class="header"><h2>Payment Successful ✅</h2></div>
        <p>Hi ${data.firstName},</p>
        <p>Your payment of <strong>${data.amount} ${data.currency}</strong> has been received.</p>
        <table style="width:100%; border-collapse:collapse; margin:16px 0;">
            <tr><td style="padding:8px; border:1px solid #eee;">Plan</td><td style="padding:8px; border:1px solid #eee;">${data.planName}</td></tr>
            <tr><td style="padding:8px; border:1px solid #eee;">Invoice</td><td style="padding:8px; border:1px solid #eee;">${data.invoiceNumber}</td></tr>
            <tr><td style="padding:8px; border:1px solid #eee;">Next Billing</td><td style="padding:8px; border:1px solid #eee;">${data.nextBillingDate}</td></tr>
        </table>
        <div class="footer">SocietyOS — Thank you for your payment</div>
    `),
});