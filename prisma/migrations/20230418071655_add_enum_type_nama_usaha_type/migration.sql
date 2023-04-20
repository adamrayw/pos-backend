/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('Basic', 'Pro', 'Plus');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "nama_usaha" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "type" "Type";
