-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_configPrefix_fkey";

-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "entryDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TransactionReceipt" ADD COLUMN     "sendStatus" BOOLEAN NOT NULL DEFAULT false;
