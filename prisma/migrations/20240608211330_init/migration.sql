-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHECK', 'ZELLE');

-- CreateTable
CREATE TABLE "Donor" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventLocation" TEXT,
    "fee" DOUBLE PRECISION,
    "eventDeadline" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "donorID" INTEGER NOT NULL,
    "eventID" INTEGER,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receiptID" TEXT,
    "donation" BOOLEAN NOT NULL,
    "note" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionReceipt" (
    "receiptNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sendDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionReceipt_pkey" PRIMARY KEY ("receiptNumber")
);

-- CreateTable
CREATE TABLE "_DonorToEvent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Donor_email_key" ON "Donor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_receiptID_key" ON "Transaction"("receiptID");

-- CreateIndex
CREATE UNIQUE INDEX "_DonorToEvent_AB_unique" ON "_DonorToEvent"("A", "B");

-- CreateIndex
CREATE INDEX "_DonorToEvent_B_index" ON "_DonorToEvent"("B");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_donorID_fkey" FOREIGN KEY ("donorID") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_receiptID_fkey" FOREIGN KEY ("receiptID") REFERENCES "TransactionReceipt"("receiptNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DonorToEvent" ADD CONSTRAINT "_DonorToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Donor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DonorToEvent" ADD CONSTRAINT "_DonorToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
