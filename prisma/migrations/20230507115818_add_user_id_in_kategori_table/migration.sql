-- AlterTable
ALTER TABLE "Kategori" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Kategori" ADD CONSTRAINT "Kategori_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
