-- DropForeignKey
ALTER TABLE "SubscriptionHistory" DROP CONSTRAINT "SubscriptionHistory_toPlanVersionId_fkey";

-- AlterTable
ALTER TABLE "SubscriptionHistory" ALTER COLUMN "toPlanVersionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SubscriptionHistory" ADD CONSTRAINT "SubscriptionHistory_toPlanVersionId_fkey" FOREIGN KEY ("toPlanVersionId") REFERENCES "PlanVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
