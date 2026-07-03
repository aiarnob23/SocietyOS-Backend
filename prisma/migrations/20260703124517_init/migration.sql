/*
  Warnings:

  - You are about to drop the column `comminityId` on the `ServiceProvider` table. All the data in the column will be lost.
  - Added the required column `communityId` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ServiceProvider" DROP CONSTRAINT "ServiceProvider_comminityId_fkey";

-- DropIndex
DROP INDEX "ServiceProvider_comminityId_idx";

-- AlterTable
ALTER TABLE "ServiceProvider" DROP COLUMN "comminityId",
ADD COLUMN     "communityId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "ServiceProvider_communityId_idx" ON "ServiceProvider"("communityId");

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
