import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { ServiceProviderController } from './service-providers.controller';
import { ServiceProviderService } from './service-providers.service';
import { SERVICE_PROVIDER_REPOSITORY } from './interfaces/service-providers-repository.interface';
import { PrismaServiceProviderRepository } from './repositories/prisma-service-providers.repository';

@Module({
    imports: [PrismaModule],
    controllers: [ServiceProviderController],
    providers: [
        ServiceProviderService,
        {
            provide: SERVICE_PROVIDER_REPOSITORY,
            useClass: PrismaServiceProviderRepository,
        },
    ],
})
export class ServiceProviderModule { }