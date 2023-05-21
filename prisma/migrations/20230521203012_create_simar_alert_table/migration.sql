-- CreateTable
CREATE TABLE "Alerts" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "target_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alerts_hash_key" ON "Alerts"("hash");
