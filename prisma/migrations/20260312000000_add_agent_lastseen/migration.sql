-- AlterTable
ALTER TABLE "Agent" ADD COLUMN "lastSeen" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Agent_name_key" ON "Agent"("name");
