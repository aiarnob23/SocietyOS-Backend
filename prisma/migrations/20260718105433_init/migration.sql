-- CreateEnum
CREATE TYPE "NoticeAudience" AS ENUM ('ALL', 'COMMUNITY_MEMBER', 'PROPERTY_ADMIN', 'FLAT_OWNER', 'TENANT', 'SERVICE_PROVIDER');

-- DropIndex
DROP INDEX "Complaint_category_idx";

-- DropIndex
DROP INDEX "Complaint_priority_idx";

-- DropIndex
DROP INDEX "Complaint_rejectedAt_idx";

-- CreateTable
CREATE TABLE "Notice" (
    "id" SERIAL NOT NULL,
    "communityId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoticeTargetRole" (
    "id" SERIAL NOT NULL,
    "noticeId" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "NoticeTargetRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notice_communityId_idx" ON "Notice"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeTargetRole_noticeId_role_key" ON "NoticeTargetRole"("noticeId", "role");

-- AddForeignKey
ALTER TABLE "NoticeTargetRole" ADD CONSTRAINT "NoticeTargetRole_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
