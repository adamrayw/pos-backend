-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "kategoriId" TEXT;

-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_id_key" ON "Kategori"("id");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;
