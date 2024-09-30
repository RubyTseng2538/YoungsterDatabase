/*
  Warnings:

  - You are about to drop the column `permission` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `ReceiptConfig` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `ReceiptConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByID` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptPrefix` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReceiptConfig" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "createdByID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "permission",
ADD COLUMN     "receiptPrefix" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptConfig_name_key" ON "ReceiptConfig"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_receiptPrefix_fkey" FOREIGN KEY ("receiptPrefix") REFERENCES "ReceiptConfig"("prefix") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdByID_fkey" FOREIGN KEY ("createdByID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
