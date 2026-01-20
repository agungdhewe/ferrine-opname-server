/**
 * DbContract - Single Source of Truth untuk nama tabel dan kolom database.
 * Sesuai dengan aturan DR1-DR5 di GEMINI.md.
 */
const DbContract = {
    Device: {
        TABLE: '"device"',
        Columns: {
            deviceId: '"deviceId"',
            name: '"name"',
            secret: '"secret"',
            disabled: '"disabled"'
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
            disabled: '"disabled"'
        }
    },
    UserDevice: {
        TABLE: '"userdevice"',
        Columns: {
            username: '"username"',
            deviceId: '"deviceId"'
        }
    },
    Item: {
        TABLE: '"item"',
        Columns: {
            itemId: '"itemId"',
            article: '"article"',
            material: '"material"',
            color: '"color"',
            size: '"size"',
            name: '"name"',
            description: '"description"',
            category: '"category"'
        }
    },
    Barcode: {
        TABLE: '"barcode"',
        Columns: {
            barcode: '"barcode"',
            itemId: '"itemId"'
        }
    },
    ProjectHeader: {
        TABLE: '"project"',
        Columns: {
            projectId: '"projectId"',
            dateStart: '"dateStart"',
            dateEnd: '"dateEnd"',
            description: '"description"',
            workingType: '"workingType"',
            disabled: '"disabled"',
            siteCode: '"siteCode"',
            brandCode: '"brandCode"'
        }
    },
    ProjectDetail: {
        TABLE: '"projectdetil"',
        Columns: {
            projectId: '"projectId"',
            itemId: '"itemId"',
            price: '"price"',
            sellPrice: '"sellPrice"',
            discount: '"discount"',
            isSpecialPrice: '"isSpecialPrice"',
            stockQty: '"stockQty"',
            printQty: '"printQty"',
            pricingId: '"pricingId"'
        }
    },
    ProjectResult: {
        TABLE: '"projectresult"',
        Columns: {
            projectId: '"projectId"',
            itemId: '"itemId"',
            deviceId: '"deviceId"',
            timestamp: '"timestamp"',
            barcode: '"barcode"',
            scannedQty: '"scannedQty"'
        }
    }
};

export default DbContract;
