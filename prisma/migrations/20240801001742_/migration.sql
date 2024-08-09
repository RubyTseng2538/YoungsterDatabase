/*
  Warnings:

  - You are about to drop the column `donation` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `status` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionType` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'EXPENSE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED', 'VOID');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventStatus" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "donation",
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "status" "Status" NOT NULL,
ADD COLUMN     "transactionType" "TransactionType" NOT NULL,
ALTER COLUMN "transactionDate" SET DEFAULT CURRENT_TIMESTAMP;
