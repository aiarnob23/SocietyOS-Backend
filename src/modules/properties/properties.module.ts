import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PrismaPropertyRepository } from './repositories/prisma-property.repository';
import { PROPERTY_REPOSITORY } from './interfaces/property-repository.interface';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PropertiesController],
    providers: [
        PropertiesService,
        PrismaPropertyRepository,
        {
            provide: PROPERTY_REPOSITORY,
            useClass: PrismaPropertyRepository,
        },
    ],
    exports: [PropertiesService],
})
export class PropertiesModule {}