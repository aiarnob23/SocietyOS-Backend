import { Module } from '@nestjs/common';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { PrismaComplaintRepository } from './repositories/prisma-complaint.repository';
import { COMPLAINT_REPOSITORY } from './interfaces/complaints-repository.interface';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ComplaintsController],
    providers: [
        ComplaintsService,
        PrismaComplaintRepository,
        {
            provide: COMPLAINT_REPOSITORY,
            useClass: PrismaComplaintRepository,
        },
    ],
    exports: [ComplaintsService],
})
export class ComplaintsModule {}