/**
 * DbContract - Single Source of Truth untuk nama tabel dan kolom database.
 * Sesuai dengan aturan DR1-DR5 di GEMINI.md.
 */

const AUDIT_COLUMNS = {
    createdBy: '"createdBy"',
    createdAt: '"createdAt"',
    updatedBy: '"updatedBy"',
    updatedAt: '"updatedAt"',
    isDeleted: '"isDeleted"'
};

const DbContract = {
    Device: {
        TABLE: '"device"',
        Columns: {
            deviceId: '"deviceId"',
            name: '"name"',
            secret: '"secret"',
            disabled: '"disabled"',
            ...AUDIT_COLUMNS
        }
    },
    User: {
        TABLE: '"user"',
        Columns: {
            username: '"username"',
            fullname: '"fullname"',
            password: '"password"',
            isAdmin: '"isAdmin"',
            allowOpname: '"allowOpname"',
            allowReceiving: '"allowReceiving"',
            allowTransfer: '"allowTransfer"',
            allowPrintLabel: '"allowPrintLabel"',
            disabled: '"disabled"',
            ...AUDIT_COLUMNS
        }
    },
    Item: {
        TABLE: '"item"',
        Columns: {
            itemId: '"itemId"',
            brandCode: '"brandCode"',
            article: '"article"',
            material: '"material"',
            color: '"color"',
            size: '"size"',
            name: '"name"',
            disabled: '"disabled"',
            description: '"description"',
            category: '"category"',
            ...AUDIT_COLUMNS
        }
    },
    Barcode: {
        TABLE: '"barcode"',
        Columns: {
            barcodeId: '"barcodeId"',
            itemId: '"itemId"',
            barcode: '"barcode"',
            brandCode: '"brandCode"',
            ...AUDIT_COLUMNS
        }
    },
    ProjectHeader: {
        TABLE: '"project"',
        Columns: {
            projectId: '"projectId"',
            projectCode: '"projectCode"',
            dateStart: '"dateStart"',
            dateEnd: '"dateEnd"',
            description: '"description"',
            workingType: '"workingType"',
            disabled: '"disabled"',
            siteCode: '"siteCode"',
            brandCode: '"brandCode"',
            ...AUDIT_COLUMNS
        }
    },
    ProjectUser: {
        TABLE: '"project_user"',
        Columns: {
            projectId: '"projectId"',
            username: '"username"',
            deviceId: '"deviceId"',
            lastSync: '"lastSync"',
            ...AUDIT_COLUMNS
        }
    },
    ProjectDetail: {
        TABLE: '"project_detil"',
        Columns: {
            projectId: '"projectId"',
            itemId: '"itemId"',
            barcode: '"barcode"',
            price: '"price"',
            sellPrice: '"sellPrice"',
            discount: '"discount"',
            isSpecialPrice: '"isSpecialPrice"',
            stockQty: '"stockQty"',
            printQty: '"printQty"',
            pricingId: '"pricingId"',
            ...AUDIT_COLUMNS
        }
    },
    ProjectResult: {
        TABLE: '"project_result"',
        Columns: {
            projectId: '"projectId"',
            itemId: '"itemId"',
            barcode: '"barcode"',
            deviceId: '"deviceId"',
            username: '"username"',
            timestamp: '"timestamp"',
            scannedQty: '"scannedQty"',
            ...AUDIT_COLUMNS
        }
    }
};

export default DbContract;
