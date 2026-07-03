import { Module } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { PrismaCommunityRepository } from './repositories/prisma-community.repository';
import { COMMUNITY_REPOSITORY } from './interfaces/community-repository.interface';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CommunitiesController],
    providers: [
        CommunitiesService,
        PrismaCommunityRepository,
        {
            provide: COMMUNITY_REPOSITORY,
            useClass: PrismaCommunityRepository,
        },
    ],
    exports: [CommunitiesService],
})
export class CommunitiesModule {}