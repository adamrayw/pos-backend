-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "transaksiId" TEXT,
    "menu" TEXT[],
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaksi_id_key" ON "Transaksi"("id");
