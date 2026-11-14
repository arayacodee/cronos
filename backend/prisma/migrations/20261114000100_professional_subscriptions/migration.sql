CREATE TABLE "ProfessionalSubscription" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "activeKey" TEXT,
  "providerId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'creating',
  "checkoutUrl" TEXT,
  "businessName" TEXT NOT NULL,
  "category" "BusinessCategory" NOT NULL,
  "description" TEXT,
  "paidUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProfessionalSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ProfessionalSubscription_activeKey_key" ON "ProfessionalSubscription"("activeKey");
CREATE UNIQUE INDEX "ProfessionalSubscription_providerId_key" ON "ProfessionalSubscription"("providerId");
CREATE INDEX "ProfessionalSubscription_userId_idx" ON "ProfessionalSubscription"("userId");
CREATE TABLE "SubscriptionPayment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "subscriptionId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "paidUntil" TIMESTAMP(3),
  CONSTRAINT "SubscriptionPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "ProfessionalSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
