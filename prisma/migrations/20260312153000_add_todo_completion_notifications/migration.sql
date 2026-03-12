-- CreateTable
CREATE TABLE "TodoActivity" (
    "id" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TodoActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoNotification" (
    "id" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TodoNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TodoActivity_todoId_idx" ON "TodoActivity"("todoId");

-- CreateIndex
CREATE INDEX "TodoActivity_createdAt_idx" ON "TodoActivity"("createdAt");

-- CreateIndex
CREATE INDEX "TodoNotification_todoId_idx" ON "TodoNotification"("todoId");

-- CreateIndex
CREATE INDEX "TodoNotification_agent_idx" ON "TodoNotification"("agent");

-- CreateIndex
CREATE INDEX "TodoNotification_createdAt_idx" ON "TodoNotification"("createdAt");

-- AddForeignKey
ALTER TABLE "TodoActivity" ADD CONSTRAINT "TodoActivity_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoNotification" ADD CONSTRAINT "TodoNotification_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
