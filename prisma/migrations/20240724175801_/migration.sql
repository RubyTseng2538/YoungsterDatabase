/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permisson` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[GoogleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `GoogleId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permission` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `B` on the `_EventToUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_EventToUser" DROP CONSTRAINT "_EventToUser_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "permisson",
ADD COLUMN     "GoogleId" TEXT NOT NULL,
ADD COLUMN     "permission" "Roles" NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_EventToUser" DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_GoogleId_key" ON "User"("GoogleId");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToUser_AB_unique" ON "_EventToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToUser_B_index" ON "_EventToUser"("B");

-- AddForeignKey
ALTER TABLE "_EventToUser" ADD CONSTRAINT "_EventToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
