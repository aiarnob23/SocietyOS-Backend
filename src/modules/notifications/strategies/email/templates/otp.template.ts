import { baseTemplate } from './base.template';
import { OTPType } from 'src/generated/prisma/client';

const subjects: Record<string, string> = {
    EMAIL_VERIFICATION: 'Verify Your Email',
    PHONE_VERIFICATION: 'Verify Your Phone',
    PASSWORD_RESET: 'Password Reset Code',
    TWO_FACTOR: 'Two-Factor Authentication Code',
};

export const otpTemplate = (data: {
    code: string;
    type: string;
    expiryMinutes: number;
}) => ({
    subject: subjects[data.type] ?? 'Your OTP Code',
    html: baseTemplate(`
        <div class="header"><h2>🔐 Verification Code</h2></div>
        <p>Your OTP code is:</p>
        <h1 style="text-align:center; letter-spacing: 8px; color: #4F46E5;">
            ${data.code}
        </h1>
        <p style="text-align:center; color:#888;">
            This code expires in <strong>${data.expiryMinutes} minutes</strong>
        </p>
        <p style="color:#dc2626; font-size:12px;">
            Never share this code with anyone.
        </p>
        <div class="footer">SocietyOS</div>
    `),
});