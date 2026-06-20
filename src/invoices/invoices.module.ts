import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { INVOICE_REPOSITORY } from './interfaces/invoice-repository.interface';
import { PrismaInvoiceRepository } from './repositories/prisma-invoice.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    InvoicesService,
    {
      provide: INVOICE_REPOSITORY,
      useExisting: PrismaInvoiceRepository
    }
  ],
  controllers: [InvoicesController]
})
export class InvoicesModule { }
