import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { PLAN_REPOSITORY } from './interfaces/plan-repository.interface';
import { PrismaPlanRepository } from './repositories/prisma-plan.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PlansController],
  providers: [
    PlansService,
    {
      provide: PLAN_REPOSITORY,
      useClass: PrismaPlanRepository,
    }
  ],
  exports: [PlansService]
})
export class PlansModule { }
