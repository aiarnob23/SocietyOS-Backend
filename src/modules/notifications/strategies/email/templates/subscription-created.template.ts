import { baseTemplate } from './base.template';

export interface SubscriptionCreatedData {
    firstName: string;
    planName: string;
    billingInterval: string;
    amount: string;
    currency: string;
}

export const subscriptionCreatedTemplate = (data: SubscriptionCreatedData) => ({
    subject: 'Subscription Created — SocietyOS',
    html: baseTemplate(`
        <div class="header"><h2>Subscription Created 🎊</h2></div>
        <p>Hi ${data.firstName},</p>
        <p>Your <strong>${data.planName}</strong> subscription has been created.</p>
        <table>
            <tr><td>Plan</td><td>${data.planName}</td></tr>
            <tr><td>Billing</td><td>${data.billingInterval}</td></tr>
            <tr><td>Amount</td><td>${data.amount} ${data.currency}</td></tr>
        </table>
        <p>Please complete your payment to activate your subscription.</p>
        <div class="footer">SocietyOS</div>
    `),
});