import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SessionService } from './sessions.service';
import { SESSION_REPOSITORY } from './interfaces/session-repository.interface';
import { PrismaSessionRepository } from './repositories/prisma-session.repository';
import { EncryptionModule } from 'src/core/security/encryption/encryption.module';

@Module({
    imports:[EncryptionModule],
    providers: [
        PrismaService,
        {
            provide: SESSION_REPOSITORY,
            useClass: PrismaSessionRepository,
        },
        SessionService,
    ],
    exports: [SessionService],
})
export class SessionsModule {}