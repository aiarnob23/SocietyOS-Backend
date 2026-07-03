-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('ISP', 'ELECTRICIAN', 'PLUMBER', 'HOME_MAID', 'GAS', 'SECURITY', 'CLEANING', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceProviderStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "ServiceProvider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "comminityId" INTEGER NOT NULL,
    "addedById" INTEGER NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "status" "ServiceProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceProvider_comminityId_idx" ON "ServiceProvider"("comminityId");

-- CreateIndex
CREATE INDEX "ServiceProvider_category_idx" ON "ServiceProvider"("category");

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_comminityId_fkey" FOREIGN KEY ("comminityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProvider" ADD CONSTRAINT "ServiceProvider_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
