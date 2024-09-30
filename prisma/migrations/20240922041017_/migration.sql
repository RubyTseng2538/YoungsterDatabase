-- CreateTable
CREATE TABLE "ReceiptConfig" (
    "prefix" TEXT NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ReceiptConfig_pkey" PRIMARY KEY ("prefix")
);
