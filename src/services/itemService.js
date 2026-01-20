import { query, getClient } from '../config/db.js';
import DbContract from '../config/DbContract.js';

/**
 * Mendapatkan semua item dengan filter
 * @param {object} filters 
 */
export const getAllItems = async (filters = {}) => {
    const item = DbContract.Item;
    const col = item.Columns;

    let sql = `SELECT i.* FROM ${item.TABLE} i WHERE i.${col.isDeleted} = FALSE`;
    const params = [];
    let pIdx = 1;

    if (filters.brandCode) {
        sql += ` AND i.${col.brandCode} = $${pIdx++}`;
        params.push(filters.brandCode);
    }

    if (filters.search) {
        sql += ` AND (i.${col.article} ILIKE $${pIdx} OR i.${col.name} ILIKE $${pIdx} OR i.${col.category} ILIKE $${pIdx} OR i.${col.description} ILIKE $${pIdx})`;
        params.push(`%${filters.search}%`);
        pIdx++;
    }

    if (filters.barcode) {
        const barcode = DbContract.Barcode;
        sql += ` AND EXISTS (SELECT 1 FROM ${barcode.TABLE} b WHERE b.${barcode.Columns.itemId} = i.${col.itemId} AND b.${barcode.Columns.barcode} = $${pIdx++})`;
        params.push(filters.barcode);
    }

    sql += ` ORDER BY i.${col.createdAt} DESC LIMIT 100`; // Limit for safety

    const result = await query(sql, params);
    return result.rows;
};

/**
 * Mendapatkan satu item berdasarkan ID
 * @param {string} itemId 
 */
export const getItemById = async (itemId) => {
    const item = DbContract.Item;
    const col = item.Columns;

    const sql = `SELECT * FROM ${item.TABLE} WHERE ${col.itemId} = $1 AND ${col.isDeleted} = FALSE`;
    const result = await query(sql, [itemId]);
    return result.rows[0];
};

/**
 * Mendapatkan daftar barcode untuk suatu item
 * @param {string} itemId 
 */
export const getItemBarcodes = async (itemId) => {
    const barcode = DbContract.Barcode;
    const col = barcode.Columns;

    const sql = `SELECT * FROM ${barcode.TABLE} WHERE ${col.itemId} = $1 AND ${col.isDeleted} = FALSE`;
    const result = await query(sql, [itemId]);
    return result.rows;
};

/**
 * Membuat/Update Item (Upsert)
 * @param {object} itemData 
 * @param {string} creator 
 */
export const upsertItem = async (itemData, creator) => {
    const item = DbContract.Item;
    const col = item.Columns;

    const sql = `
        INSERT INTO ${item.TABLE} (
            ${col.itemId}, ${col.brandCode}, ${col.article}, ${col.material}, 
            ${col.color}, ${col.size}, ${col.name}, ${col.description}, 
            ${col.category}, ${col.price}, ${col.sellPrice}, ${col.discount},
            ${col.isSpecialPrice}, ${col.stockQty}, ${col.printQty}, ${col.pricingId},
            ${col.disabled}, ${col.createdBy}, ${col.updatedBy}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (${col.itemId}) DO UPDATE SET
            ${col.brandCode} = EXCLUDED.${col.brandCode},
            ${col.article} = EXCLUDED.${col.article},
            ${col.material} = EXCLUDED.${col.material},
            ${col.color} = EXCLUDED.${col.color},
            ${col.size} = EXCLUDED.${col.size},
            ${col.name} = EXCLUDED.${col.name},
            ${col.description} = EXCLUDED.${col.description},
            ${col.category} = EXCLUDED.${col.category},
            ${col.price} = EXCLUDED.${col.price},
            ${col.sellPrice} = EXCLUDED.${col.sellPrice},
            ${col.discount} = EXCLUDED.${col.discount},
            ${col.isSpecialPrice} = EXCLUDED.${col.isSpecialPrice},
            ${col.stockQty} = EXCLUDED.${col.stockQty},
            ${col.printQty} = EXCLUDED.${col.printQty},
            ${col.pricingId} = EXCLUDED.${col.pricingId},
            ${col.disabled} = EXCLUDED.${col.disabled},
            ${col.updatedBy} = EXCLUDED.${col.updatedBy},
            ${col.updatedAt} = CURRENT_TIMESTAMP
        RETURNING ${col.itemId}
    `;

    const values = [
        itemData.itemId, itemData.brandCode, itemData.article, itemData.material,
        itemData.color, itemData.size, itemData.name, itemData.description,
        itemData.category, itemData.price || 0, itemData.sellPrice || 0, itemData.discount || 0,
        itemData.isSpecialPrice || false, itemData.stockQty || 0, itemData.printQty || 0, itemData.pricingId || null,
        itemData.disabled || false, creator, creator
    ];

    const result = await query(sql, values);
    return result.rows[0];
};

/**
 * Import Items secara massal menggunakan Transaksi (Item & Barcode)
 * @param {object[]} items 
 * @param {string} creator 
 */
export const bulkImportItems = async (items, creator) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');
        const itemContract = DbContract.Item;
        const barcodeContract = DbContract.Barcode;
        const iCol = itemContract.Columns;
        const bCol = barcodeContract.Columns;

        const itemSql = `
            INSERT INTO ${itemContract.TABLE} (
                ${iCol.itemId}, ${iCol.brandCode}, ${iCol.article}, ${iCol.material}, 
                ${iCol.color}, ${iCol.size}, ${iCol.name}, ${iCol.description}, 
                ${iCol.category}, ${iCol.price}, ${iCol.sellPrice}, ${iCol.discount},
                ${iCol.isSpecialPrice}, ${iCol.stockQty}, ${iCol.printQty}, ${iCol.pricingId},
                ${iCol.disabled}, ${iCol.createdBy}, ${iCol.updatedBy}
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            ON CONFLICT (${iCol.itemId}) DO UPDATE SET
                ${iCol.brandCode} = EXCLUDED.${iCol.brandCode},
                ${iCol.article} = EXCLUDED.${iCol.article},
                ${iCol.name} = EXCLUDED.${iCol.name},
                ${iCol.sellPrice} = EXCLUDED.${iCol.sellPrice},
                ${iCol.stockQty} = EXCLUDED.${iCol.stockQty},
                ${iCol.updatedBy} = EXCLUDED.${iCol.updatedBy},
                ${iCol.updatedAt} = CURRENT_TIMESTAMP
        `;

        const barcodeSql = `
            INSERT INTO ${barcodeContract.TABLE} (
                ${bCol.itemId}, ${bCol.barcode}, ${bCol.brandCode}, ${bCol.createdBy}, ${bCol.updatedBy}
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (${bCol.barcode}, ${bCol.brandCode}) DO NOTHING
        `;

        for (const i of items) {
            // Item Insert/Update
            const itemValues = [
                i.itemId, i.brandCode, i.article || '', i.material || '',
                i.color || '', i.size || '', i.name, i.description || '',
                i.category || '', parseFloat(i.price) || 0, parseFloat(i.sellPrice) || 0, parseFloat(i.discount) || 0,
                i.isSpecialPrice === 'true' || i.isSpecialPrice === true, parseInt(i.stockQty) || 0, parseInt(i.printQty) || 0, i.pricingId || null,
                i.disabled === 'true' || i.disabled === true, creator, creator
            ];
            await client.query(itemSql, itemValues);

            // Barcode Insert (if barcode provided)
            if (i.barcode) {
                const barcodeValues = [
                    i.itemId, i.barcode, i.brandCode, creator, creator
                ];
                await client.query(barcodeSql, barcodeValues);
            }
        }

        await client.query('COMMIT');
        return { success: true, count: items.length };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Bulk Import Error:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Soft Delete Item
 * @param {string} itemId 
 * @param {string} updater 
 */
export const deleteItem = async (itemId, updater) => {
    const item = DbContract.Item;
    const col = item.Columns;

    const sql = `
        UPDATE ${item.TABLE} 
        SET ${col.isDeleted} = TRUE, ${col.updatedBy} = $1, ${col.updatedAt} = CURRENT_TIMESTAMP
        WHERE ${col.itemId} = $2
    `;

    const result = await query(sql, [updater, itemId]);
    return result.rowCount > 0;
};
