import { baseTemplate } from './base.template';

export interface NoticePublishedData {
    firstName: string;
    noticeTitle: string;
    noticeDescription: string;
}

export const noticePublishedTemplate = (data: NoticePublishedData) => ({
    subject: `New Notice: ${data.noticeTitle}`,
    html: baseTemplate(`
        <div class="header"><h2>📢 New Notice</h2></div>
        <p>Hi ${data.firstName},</p>
        <p>A new notice has been published in your community:</p>
        <h3>${data.noticeTitle}</h3>
        <p>${data.noticeDescription}</p>
        <div class="footer">SocietyOS — Community Management Platform</div>
    `),
});