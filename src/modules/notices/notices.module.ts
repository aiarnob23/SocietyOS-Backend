import { Module } from '@nestjs/common';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';
import { PrismaNoticeRepository } from './repositories/prisma-notice.repository';
import { NOTICE_REPOSITORY } from './interfaces/notice-repository.interface';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, NotificationsModule],
    controllers: [NoticesController],
    providers: [
        NoticesService,
        PrismaNoticeRepository,
        {
            provide: NOTICE_REPOSITORY,
            useClass: PrismaNoticeRepository,
        },
    ],
    exports: [NoticesService],
})
export class NoticesModule {}