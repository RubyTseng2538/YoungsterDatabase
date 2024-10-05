-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "phonenum" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TransactionReceipt" ALTER COLUMN "sendDate" SET DEFAULT CURRENT_TIMESTAMP;
