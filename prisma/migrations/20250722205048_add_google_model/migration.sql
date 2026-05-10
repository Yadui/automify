-- AlterTable
ALTER TABLE "Connections" ADD COLUMN     "googleId" TEXT;

-- CreateTable
CREATE TABLE "Google" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Google_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Google_userId_key" ON "Google"("userId");

-- AddForeignKey
ALTER TABLE "Connections" ADD CONSTRAINT "Connections_googleId_fkey" FOREIGN KEY ("googleId") REFERENCES "Google"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Google" ADD CONSTRAINT "Google_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
