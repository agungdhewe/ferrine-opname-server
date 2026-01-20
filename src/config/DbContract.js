/**
 * DbContract - Single Source of Truth untuk nama tabel dan kolom database.
 * Sesuai dengan aturan DR1-DR5 di GEMINI.md.
 * 
 * Update: Memisahkan SQL (untuk query) dan Key (untuk akses properti JS).
 */

const createEntity = (tableName, cols) => {
    const Columns = {};
    const Keys = {};

    // Audit Fields
    const audit = {
        createdBy: 'createdBy',
        createdAt: 'createdAt',
        updatedBy: 'updatedBy',
        updatedAt: 'updatedAt',
        isDeleted: 'isDeleted'
    };

    const allCols = { ...cols, ...audit };

    for (const [key, val] of Object.entries(allCols)) {
        Columns[key] = `"${val}"`;
        Keys[key] = val;
    }

    return {
        TABLE: `"${tableName}"`,
        Columns,
        Keys
    };
};

const DbContract = {
    Device: createEntity('device', {
        deviceId: 'deviceId',
        name: 'name',
        secret: 'secret',
        disabled: 'disabled'
    }),
    User: createEntity('user', {
        username: 'username',
        fullname: 'fullname',
        password: 'password',
        isAdmin: 'isAdmin',
        allowOpname: 'allowOpname',
        allowReceiving: 'allowReceiving',
        allowTransfer: 'allowTransfer',
        allowPrintLabel: 'allowPrintLabel',
        disabled: 'disabled'
    }),
    Item: createEntity('item', {
        itemId: 'itemId',
        brandCode: 'brandCode',
        article: 'article',
        material: 'material',
        color: 'color',
        size: 'size',
        name: 'name',
        disabled: 'disabled',
        description: 'description',
        category: 'category',
        price: 'price',
        sellPrice: 'sellPrice',
        discount: 'discount',
        isSpecialPrice: 'isSpecialPrice',
        stockQty: 'stockQty',
        printQty: 'printQty',
        pricingId: 'pricingId'
    }),
    Barcode: createEntity('barcode', {
        barcodeId: 'barcodeId',
        itemId: 'itemId',
        barcode: 'barcode',
        brandCode: 'brandCode'
    }),
    ProjectHeader: createEntity('project', {
        projectId: 'projectId',
        projectCode: 'projectCode',
        dateStart: 'dateStart',
        dateEnd: 'dateEnd',
        description: 'description',
        workingType: 'workingType',
        disabled: 'disabled',
        siteCode: 'siteCode',
        brandCode: 'brandCode'
    }),
    ProjectUser: createEntity('project_user', {
        projectId: 'projectId',
        username: 'username',
        deviceId: 'deviceId',
        lastSync: 'lastSync'
    }),
    ProjectDetail: createEntity('project_detil', {
        projectId: 'projectId',
        itemId: 'itemId',
        barcode: 'barcode',
        price: 'price',
        sellPrice: 'sellPrice',
        discount: 'discount',
        isSpecialPrice: 'isSpecialPrice',
        stockQty: 'stockQty',
        printQty: 'printQty',
        pricingId: 'pricingId'
    }),
    ProjectResult: createEntity('project_result', {
        projectId: 'projectId',
        itemId: 'itemId',
        barcode: 'barcode',
        deviceId: 'deviceId',
        username: 'username',
        timestamp: 'timestamp',
        scannedQty: 'scannedQty'
    })
};

export default DbContract;
