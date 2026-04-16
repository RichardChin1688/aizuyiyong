-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "phone" VARCHAR(11) NOT NULL,
    "nickname" VARCHAR(50),
    "avatar" VARCHAR(255),
    "gender" INTEGER NOT NULL DEFAULT 0,
    "userType" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "email" VARCHAR(100),
    "realName" VARCHAR(50),
    "idCard" VARCHAR(18),
    "companyName" VARCHAR(100),
    "companyLicense" VARCHAR(255),
    "certificationStatus" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_auth_logs" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "loginType" INTEGER NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_auth_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "brand" VARCHAR(50),
    "model" VARCHAR(100),
    "specs" JSONB,
    "imageUrls" JSONB,
    "dailyPrice" DECIMAL(10,2) NOT NULL,
    "weeklyPrice" DECIMAL(10,2),
    "monthlyPrice" DECIMAL(10,2),
    "deposit" DECIMAL(10,2) NOT NULL,
    "stockTotal" INTEGER NOT NULL DEFAULT 0,
    "stockAvailable" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_orders" (
    "id" BIGSERIAL NOT NULL,
    "orderNo" VARCHAR(32) NOT NULL,
    "userId" BIGINT NOT NULL,
    "deviceId" BIGINT NOT NULL,
    "rentalType" INTEGER NOT NULL,
    "rentalDays" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "depositAmount" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_addresses" (
    "id" BIGSERIAL NOT NULL,
    "rentalOrderId" BIGINT NOT NULL,
    "receiverName" VARCHAR(50) NOT NULL,
    "receiverPhone" VARCHAR(20) NOT NULL,
    "province" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "detailAddress" VARCHAR(255) NOT NULL,
    "expressCompany" VARCHAR(50),
    "expressNo" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_packages" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "tokenAmount" BIGINT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "validityDays" INTEGER,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_token_wallets" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "frozen" BIGINT NOT NULL DEFAULT 0,
    "totalRecharged" BIGINT NOT NULL DEFAULT 0,
    "totalConsumed" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_token_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_transactions" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "type" INTEGER NOT NULL,
    "amount" BIGINT NOT NULL,
    "balanceAfter" BIGINT NOT NULL,
    "relatedOrderNo" VARCHAR(32),
    "description" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" BIGSERIAL NOT NULL,
    "orderNo" VARCHAR(32) NOT NULL,
    "userId" BIGINT NOT NULL,
    "orderType" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payableAmount" DECIMAL(10,2) NOT NULL,
    "status" INTEGER NOT NULL,
    "paymentMethod" INTEGER,
    "paidAt" TIMESTAMP(3),
    "remark" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" BIGSERIAL NOT NULL,
    "orderId" BIGINT NOT NULL,
    "productType" VARCHAR(50) NOT NULL,
    "productId" BIGINT NOT NULL,
    "productName" VARCHAR(100) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "orderNo" VARCHAR(32) NOT NULL,
    "paymentNo" VARCHAR(64),
    "paymentMethod" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3),
    "callbackData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" BIGSERIAL NOT NULL,
    "ticketNo" VARCHAR(32) NOT NULL,
    "userId" BIGINT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT,
    "status" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "assignedTo" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" BIGSERIAL NOT NULL,
    "ticketId" BIGINT NOT NULL,
    "senderType" INTEGER NOT NULL,
    "senderId" BIGINT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200),
    "content" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "linkUrl" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_codes" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "totalInvited" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_records" (
    "id" BIGSERIAL NOT NULL,
    "inviterId" BIGINT NOT NULL,
    "inviteeId" BIGINT NOT NULL,
    "orderNo" VARCHAR(32) NOT NULL,
    "orderAmount" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "status" INTEGER NOT NULL,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" INTEGER NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "minAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maxDiscount" DECIMAL(10,2),
    "totalCount" INTEGER NOT NULL,
    "issuedCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_coupons" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "couponId" BIGINT NOT NULL,
    "couponCode" VARCHAR(32) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "usedAt" TIMESTAMP(3),
    "usedOrderNo" VARCHAR(32),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "orderNo" VARCHAR(32) NOT NULL,
    "invoiceType" INTEGER NOT NULL,
    "invoiceTitle" VARCHAR(200) NOT NULL,
    "taxId" VARCHAR(50),
    "amount" DECIMAL(10,2) NOT NULL,
    "status" INTEGER NOT NULL,
    "invoiceUrl" VARCHAR(255),
    "expressNo" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(50),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" BIGSERIAL NOT NULL,
    "postId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "parentId" BIGINT,
    "content" TEXT NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_auth_logs_userId_idx" ON "user_auth_logs"("userId");

-- CreateIndex
CREATE INDEX "user_auth_logs_loginAt_idx" ON "user_auth_logs"("loginAt");

-- CreateIndex
CREATE INDEX "devices_category_idx" ON "devices"("category");

-- CreateIndex
CREATE UNIQUE INDEX "rental_orders_orderNo_key" ON "rental_orders"("orderNo");

-- CreateIndex
CREATE INDEX "rental_orders_userId_idx" ON "rental_orders"("userId");

-- CreateIndex
CREATE INDEX "rental_orders_orderNo_idx" ON "rental_orders"("orderNo");

-- CreateIndex
CREATE INDEX "rental_orders_status_idx" ON "rental_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rental_addresses_rentalOrderId_key" ON "rental_addresses"("rentalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "user_token_wallets_userId_key" ON "user_token_wallets"("userId");

-- CreateIndex
CREATE INDEX "token_transactions_userId_idx" ON "token_transactions"("userId");

-- CreateIndex
CREATE INDEX "token_transactions_type_idx" ON "token_transactions"("type");

-- CreateIndex
CREATE INDEX "token_transactions_createdAt_idx" ON "token_transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNo_key" ON "orders"("orderNo");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_orderNo_idx" ON "orders"("orderNo");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderNo_key" ON "payments"("orderNo");

-- CreateIndex
CREATE INDEX "payments_orderNo_idx" ON "payments"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketNo_key" ON "tickets"("ticketNo");

-- CreateIndex
CREATE INDEX "tickets_userId_idx" ON "tickets"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_codes_userId_key" ON "affiliate_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_codes_code_key" ON "affiliate_codes"("code");

-- CreateIndex
CREATE INDEX "affiliate_records_inviterId_idx" ON "affiliate_records"("inviterId");

-- CreateIndex
CREATE UNIQUE INDEX "user_coupons_couponCode_key" ON "user_coupons"("couponCode");

-- CreateIndex
CREATE INDEX "user_coupons_userId_idx" ON "user_coupons"("userId");

-- CreateIndex
CREATE INDEX "invoices_userId_idx" ON "invoices"("userId");

-- CreateIndex
CREATE INDEX "community_posts_userId_idx" ON "community_posts"("userId");

-- CreateIndex
CREATE INDEX "community_comments_postId_idx" ON "community_comments"("postId");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_auth_logs" ADD CONSTRAINT "user_auth_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_orders" ADD CONSTRAINT "rental_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_orders" ADD CONSTRAINT "rental_orders_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_addresses" ADD CONSTRAINT "rental_addresses_rentalOrderId_fkey" FOREIGN KEY ("rentalOrderId") REFERENCES "rental_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_token_wallets" ADD CONSTRAINT "user_token_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "token_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderNo_fkey" FOREIGN KEY ("orderNo") REFERENCES "orders"("orderNo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_codes" ADD CONSTRAINT "affiliate_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_records" ADD CONSTRAINT "affiliate_records_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_records" ADD CONSTRAINT "affiliate_records_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "community_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
