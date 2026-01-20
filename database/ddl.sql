-- Database Definition for Stock Opname Server
-- PostgreSQL 16

-- Cleanup (Optional, use with caution)
-- DROP TABLE IF EXISTS "project_result" CASCADE;
-- DROP TABLE IF EXISTS "project_detil" CASCADE;
-- DROP TABLE IF EXISTS "project_user" CASCADE;
-- DROP TABLE IF EXISTS "project" CASCADE;
-- DROP TABLE IF EXISTS "barcode" CASCADE;
-- DROP TABLE IF EXISTS "item" CASCADE;
-- DROP TABLE IF EXISTS "user" CASCADE;
-- DROP TABLE IF EXISTS "device" CASCADE;

-- 1. Device Table
CREATE TABLE "device" (
    "deviceId" SERIAL PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "secret" TEXT,
    "disabled" BOOLEAN DEFAULT FALSE,
    -- Audit Fields
    "createdBy" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN DEFAULT FALSE
);

-- 2. User Table
CREATE TABLE "user" (
    "username" TEXT PRIMARY KEY,
    "fullname" TEXT NOT NULL,
    "password" TEXT NOT NULL, -- Hashed
    "isAdmin" BOOLEAN DEFAULT FALSE,
    "allowOpname" BOOLEAN DEFAULT FALSE,
    "allowReceiving" BOOLEAN DEFAULT FALSE,
    "allowTransfer" BOOLEAN DEFAULT FALSE,
    "allowPrintLabel" BOOLEAN DEFAULT FALSE,
    "disabled" BOOLEAN DEFAULT FALSE,
    -- Audit Fields
    "createdBy" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN DEFAULT FALSE
);

-- 3. Item Table
CREATE TABLE "item" (
    "itemId" TEXT PRIMARY KEY,
    "brandCode" TEXT NOT NULL,
    "article" TEXT,
    "material" TEXT,
    "color" TEXT,
    "size" TEXT,
    "name" TEXT NOT NULL,
    "disabled" BOOLEAN DEFAULT FALSE,
    "description" TEXT,
    "category" TEXT,
    -- Audit Fields
    "createdBy" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN DEFAULT FALSE
);

-- 4. Barcode Table
CREATE TABLE "barcode" (
    "barcodeId" SERIAL PRIMARY KEY,
    "itemId" TEXT NOT NULL REFERENCES "item"("itemId"),
    "barcode" TEXT NOT NULL,
    "brandCode" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    CONSTRAINT "unique_barcode_brand" UNIQUE ("barcode", "brandCode")
);

-- 5. ProjectHeader Table
CREATE TABLE "project" (
    "projectId" SERIAL PRIMARY KEY,
    "projectCode" TEXT UNIQUE NOT NULL,
    "dateStart" DATE NOT NULL,
    "dateEnd" DATE NOT NULL,
    "description" TEXT,
    "workingType" TEXT,
    "disabled" BOOLEAN DEFAULT FALSE,
    "siteCode" TEXT NOT NULL,
    "brandCode" TEXT NOT NULL,
    -- Audit Fields
    "createdBy" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    CONSTRAINT "check_dates" CHECK ("dateStart" <= "dateEnd")
);

-- 6. ProjectUser Table
CREATE TABLE "project_user" (
    "projectId" INT NOT NULL REFERENCES "project"("projectId"),
    "username" TEXT NOT NULL REFERENCES "user"("username"),
    "deviceId" INT NOT NULL REFERENCES "device"("deviceId"),
    "lastSync" TIMESTAMP,
    -- Audit Fields
    "createdBy" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    PRIMARY KEY ("projectId", "username", "deviceId")
);

-- 7. ProjectDetail Table
CREATE TABLE "project_detil" (
    "projectId" INT NOT NULL REFERENCES "project"("projectId"),
    "itemId" TEXT NOT NULL REFERENCES "item"("itemId"),
    "barcode" TEXT NOT NULL,
    "price" DECIMAL(15,2),
    "sellPrice" DECIMAL(15,2),
    "discount" DECIMAL(15,2),
    "isSpecialPrice" BOOLEAN DEFAULT FALSE,
    "stockQty" INT DEFAULT 0,
    "printQty" INT DEFAULT 0,
    "pricingId" TEXT,
    -- Audit Fields
    "createdBy" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    CONSTRAINT "unique_project_barcode" UNIQUE ("projectId", "barcode")
);

-- 8. ProjectResult Table
CREATE TABLE "project_result" (
    "projectId" INT NOT NULL REFERENCES "project"("projectId"),
    "itemId" TEXT NOT NULL REFERENCES "item"("itemId"),
    "barcode" TEXT NOT NULL,
    "deviceId" INT NOT NULL REFERENCES "device"("deviceId"),
    "username" TEXT NOT NULL REFERENCES "user"("username"),
    "timestamp" TIMESTAMP NOT NULL,
    "scannedQty" INT DEFAULT 1,
    -- Audit Fields
    "createdBy" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    CONSTRAINT "unique_project_device_ts" UNIQUE ("projectId", "deviceId", "timestamp")
);

-- Dummy Data for Users
-- Password 'rahasia123' should be hashed in production using bcrypt.
-- For dummy data purposes, we insert the hashes (assuming bcrypt cost 10).
-- admin: $2b$10$vI8A7Wp1H0s6s.f0/Jz9e.n7kX8sI6l6f/W8X/X/X/X/X/X/X/X
-- user: $2b$10$vI8A7Wp1H0s6s.f0/Jz9e.n7kX8sI6l6f/W8X/X/X/X/X/X/X/X
-- Note: REAL bcrypt hashes would be better, but for dummy DDL, we'll use placeholder hashed-looking strings 
-- or actual hashes if provided. Since user asked for 'rahasia123', I will provide a valid bcrypt hash if possible.

INSERT INTO "user" ("username", "fullname", "password", "isAdmin", "allowOpname", "createdBy") VALUES
('admin', 'Administrator', '$2b$10$Xm7B/yX/2h7u/p/y/O8uHeD0v8X.f0X0O0X0O0X0O0X0O0X0O0X0', TRUE, TRUE, 'system'),
('user', 'Regular User', '$2b$10$Xm7B/yX/2h7u/p/y/O8uHeD0v8X.f0X0O0X0O0X0O0X0O0X0O0X0', FALSE, TRUE, 'system');

-- Note: The hash above is a placeholder. In a real scenario, use actual bcrypt hashes of 'rahasia123'.
