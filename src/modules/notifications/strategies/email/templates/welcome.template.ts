import { baseTemplate } from './base.template';

export const welcomeTemplate = (data: { firstName: string }) => ({
    subject: 'Welcome to SocietyOS!',
    html: baseTemplate(`
        <div class="header"><h2>Welcome to SocietyOS 🎉</h2></div>
        <p>Hi ${data.firstName},</p>
        <p>Your account has been created successfully. You can now login and start managing your community.</p>
        <div class="footer">SocietyOS — Community Management Platform</div>
    `),
});