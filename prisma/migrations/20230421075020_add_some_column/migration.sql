/*
  Warnings:

  - Added the required column `isPaid` to the `Subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Subscriptions" DROP CONSTRAINT "Subscriptions_userId_fkey";

-- AlterTable
ALTER TABLE "Subscriptions" ADD COLUMN     "isPaid" BOOLEAN NOT NULL,
ADD COLUMN     "redirect_url" TEXT,
ADD COLUMN     "token" TEXT,
ADD COLUMN     "transaksiId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
