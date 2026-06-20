-- DropIndex
DROP INDEX "User_email_phone_idx";

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "periodStart" DROP NOT NULL,
ALTER COLUMN "periodEnd" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "User_email_phone_id_idx" ON "User"("email", "phone", "id");
