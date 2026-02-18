-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "publishedDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Article_publishedDate_key" ON "Article"("publishedDate");
