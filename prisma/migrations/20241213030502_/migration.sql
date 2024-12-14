/*
  Warnings:

  - You are about to drop the column `password` on the `Donor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Donor" DROP COLUMN "password";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;
