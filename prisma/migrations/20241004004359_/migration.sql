/*
  Warnings:

  - You are about to drop the column `autoSend` on the `TransactionReceipt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReceiptConfig" ADD COLUMN     "autosend" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "configPrefix" TEXT;

-- AlterTable
ALTER TABLE "TransactionReceipt" DROP COLUMN "autoSend";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_configPrefix_fkey" FOREIGN KEY ("configPrefix") REFERENCES "ReceiptConfig"("prefix") ON DELETE SET NULL ON UPDATE CASCADE;
