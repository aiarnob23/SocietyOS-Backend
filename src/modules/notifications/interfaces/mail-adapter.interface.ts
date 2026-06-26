export const MAIL_ADAPTER = Symbol('MAIL_ADAPTER');

export interface SendMailInput {
    to: string;
    subject: string;
    html: string;
}

export interface IMailAdapter {
    sendMail(input: SendMailInput): Promise<void>;
}