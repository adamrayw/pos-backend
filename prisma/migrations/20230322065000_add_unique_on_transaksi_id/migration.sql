/*
  Warnings:

  - A unique constraint covering the columns `[transaksiId]` on the table `Transaksi` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transaksi_transaksiId_key" ON "Transaksi"("transaksiId");
