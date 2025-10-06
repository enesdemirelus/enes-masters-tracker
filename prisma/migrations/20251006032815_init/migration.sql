-- CreateEnum
CREATE TYPE "Tiers" AS ENUM ('SAFETY', 'TARGET', 'REACH');

-- CreateTable
CREATE TABLE "Schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "tiers" "Tiers" NOT NULL,

    CONSTRAINT "Schools_pkey" PRIMARY KEY ("id")
);
