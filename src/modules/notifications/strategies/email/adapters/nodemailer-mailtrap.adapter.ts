import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from 'src/core/config';
import { IMailAdapter, SendMailInput } from 'src/modules/notifications/interfaces/mail-adapter.interface';

@Injectable()
export class NodemailerMailtrapAdapter implements IMailAdapter {
    private readonly transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.email.mailtrap.host,
            port: config.email.mailtrap.port,
            auth: {
                user: config.email.mailtrap.user,
                pass: config.email.mailtrap.pass,
            },
        });
    }

    async sendMail(input: SendMailInput): Promise<void> {
        await this.transporter.sendMail({
            from: config.email.from,
            to: input.to,
            subject: input.subject,
            html: input.html,
        });
    }
}