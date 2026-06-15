import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { USER_REPOSITORY } from './interfaces/user-repository.interface';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [
        UsersService,
        {
            provide: USER_REPOSITORY,
            useClass: PrismaUserRepository,
        },
    ],
    exports: [UsersService],
})
export class UsersModule {}
