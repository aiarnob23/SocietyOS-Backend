import { IsEnum, IsInt } from 'class-validator';
import { PaymentMethod } from 'src/generated/prisma/client';

export class CreatePaymentDto {
    @IsInt()
    invoiceId: number;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}