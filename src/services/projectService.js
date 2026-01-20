import { query, getClient } from '../config/db.js';
import DbContract from '../config/DbContract.js';

/**
 * Mendapatkan semua project dengan filter
 * @param {object} filters 
 */
export const getAllProjects = async (filters = {}) => {
    const project = DbContract.ProjectHeader;
    const col = project.Columns;

    let sql = `SELECT * FROM ${project.TABLE} WHERE ${col.isDeleted} = FALSE`;
    const params = [];
    let pIdx = 1;

    if (filters.brandCode) {
        sql += ` AND ${col.brandCode} = $${pIdx++}`;
        params.push(filters.brandCode);
    }

    if (filters.siteCode) {
        sql += ` AND ${col.siteCode} = $${pIdx++}`;
        params.push(filters.siteCode);
    }

    if (filters.workingType) {
        sql += ` AND ${col.workingType} = $${pIdx++}`;
        params.push(filters.workingType);
    }

    if (filters.dateStart) {
        sql += ` AND ${col.dateStart} >= $${pIdx++}`;
        params.push(filters.dateStart);
    }

    if (filters.dateEnd) {
        sql += ` AND ${col.dateEnd} <= $${pIdx++}`;
        params.push(filters.dateEnd);
    }

    sql += ` ORDER BY ${col.dateStart} DESC`;

    const result = await query(sql, params);
    return result.rows;
};

/**
 * Mendapatkan detail project berdasarkan ID
 * @param {number} projectId 
 */
export const getProjectById = async (projectId) => {
    const project = DbContract.ProjectHeader;
    const col = project.Columns;
    const sql = `SELECT * FROM ${project.TABLE} WHERE ${col.projectId} = $1 AND ${col.isDeleted} = FALSE`;
    const result = await query(sql, [projectId]);
    return result.rows[0];
};

/**
 * Cek apakah ada project yang overlap untuk site dan brand yang sama
 */
export const checkProjectOverlap = async (siteCode, brandCode, dateStart, dateEnd, excludeProjectId = null) => {
    const project = DbContract.ProjectHeader;
    const col = project.Columns;

    let sql = `
        SELECT 1 FROM ${project.TABLE}
        WHERE ${col.siteCode} = $1 
        AND ${col.brandCode} = $2
        AND ${col.isDeleted} = FALSE
        AND (
            (${col.dateStart} BETWEEN $3 AND $4) OR
            (${col.dateEnd} BETWEEN $3 AND $4) OR
            ($3 BETWEEN ${col.dateStart} AND ${col.dateEnd})
        )
    `;
    const params = [siteCode, brandCode, dateStart, dateEnd];

    if (excludeProjectId) {
        sql += ` AND ${col.projectId} != $5`;
        params.push(excludeProjectId);
    }

    const result = await query(sql, params);
    return result.rowCount > 0;
};

/**
 * Simpan atau Update Project Header
 */
export const upsertProject = async (projectData, creator) => {
    const project = DbContract.ProjectHeader;
    const col = project.Columns;

    // Validasi Tanggal
    if (new Date(projectData.dateStart) > new Date(projectData.dateEnd)) {
        throw new Error('Tanggal mulai tidak boleh lebih besar dari tanggal selesai.');
    }

    // Cek Immutability (Project yang sudah completed tidak bisa diubah)
    if (projectData.projectId) {
        const existingProject = await getProjectById(projectData.projectId);
        if (existingProject && existingProject.isCompleted) {
            throw new Error('Project yang sudah selesai tidak dapat diubah.');
        }
    }

    if (projectData.projectId) {
        // Update
        const sql = `
            UPDATE ${project.TABLE} SET
                ${col.projectCode} = $1,
                ${col.projectName} = $2,
                ${col.dateStart} = $3,
                ${col.dateEnd} = $4,
                ${col.description} = $5,
                ${col.workingType} = $6,
                ${col.siteCode} = $7,
                ${col.brandCode} = $8,
                ${col.disabled} = $9,
                ${col.updatedBy} = $10,
                ${col.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${col.projectId} = $11
            RETURNING *
        `;
        const values = [
            projectData.projectCode, projectData.projectName, projectData.dateStart, projectData.dateEnd,
            projectData.description, projectData.workingType, projectData.siteCode,
            projectData.brandCode, projectData.disabled || false, creator, projectData.projectId
        ];
        const result = await query(sql, values);
        return result.rows[0];
    } else {
        // Insert
        const sql = `
            INSERT INTO ${project.TABLE} (
                ${col.projectCode}, ${col.projectName}, ${col.dateStart}, ${col.dateEnd}, 
                ${col.description}, ${col.workingType}, ${col.siteCode}, 
                ${col.brandCode}, ${col.disabled}, ${col.createdBy}, ${col.updatedBy},
                ${col.isCompleted}, ${col.projectStatus}
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, FALSE, 'ACTIVE')
            RETURNING *
        `;
        const values = [
            projectData.projectCode, projectData.projectName, projectData.dateStart, projectData.dateEnd,
            projectData.description, projectData.workingType, projectData.siteCode,
            projectData.brandCode, projectData.disabled || false, creator, creator
        ];
        const result = await query(sql, values);
        return result.rows[0];
    }
};

/**
 * Project User Assignment
 */
export const getProjectUsers = async (projectId) => {
    const pu = DbContract.ProjectUser;
    const u = DbContract.User;
    const d = DbContract.Device;

    const sql = `
        SELECT pu.*, u.${u.Columns.fullname}, d.${d.Columns.name} as "deviceName"
        FROM ${pu.TABLE} pu
        JOIN ${u.TABLE} u ON pu.${pu.Columns.username} = u.${u.Columns.username}
        JOIN ${d.TABLE} d ON pu.${pu.Columns.deviceId} = d.${d.Columns.deviceId}
        WHERE pu.${pu.Columns.projectId} = $1 AND pu.${pu.Columns.isDeleted} = FALSE
    `;
    const result = await query(sql, [projectId]);
    return result.rows;
};

export const assignUser = async (projectId, username, deviceId, creator) => {
    const pu = DbContract.ProjectUser;
    const col = pu.Columns;

    const sql = `
        INSERT INTO ${pu.TABLE} (
            ${col.projectId}, ${col.username}, ${col.deviceId}, ${col.createdBy}, ${col.updatedAt}
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (${col.projectId}, ${col.username}, ${col.deviceId}) DO UPDATE SET
            ${col.isDeleted} = FALSE,
            ${col.updatedBy} = EXCLUDED.${col.updatedBy},
            ${col.updatedAt} = CURRENT_TIMESTAMP
    `;
    const result = await query(sql, [projectId, username, deviceId, creator]);
    return result.rowCount > 0;
};

export const removeUser = async (projectId, username, deviceId, updater) => {
    const pu = DbContract.ProjectUser;
    const col = pu.Columns;

    const sql = `
        UPDATE ${pu.TABLE}
        SET ${col.isDeleted} = TRUE, ${col.updatedBy} = $1, ${col.updatedAt} = CURRENT_TIMESTAMP
        WHERE ${col.projectId} = $2 AND ${col.username} = $3 AND ${col.deviceId} = $4
    `;
    const result = await query(sql, [updater, projectId, username, deviceId]);
    return result.rowCount > 0;
};

/**
 * Project Detail (Barcodes in Project)
 */
export const getProjectDetails = async (projectId, filters = {}) => {
    const pd = DbContract.ProjectDetail;
    const col = pd.Columns;
    const item = DbContract.Item;

    let sql = `
        SELECT pd.*, i.${item.Columns.name}, i.${item.Columns.article}
        FROM ${pd.TABLE} pd
        JOIN ${item.TABLE} i ON pd.${col.itemId} = i.${item.Columns.itemId}
        WHERE pd.${col.projectId} = $1 AND pd.${col.isDeleted} = FALSE
    `;
    const params = [projectId];
    let pIdx = 2;

    if (filters.search) {
        sql += ` AND (pd.${col.barcode} ILIKE $${pIdx} OR pd.${col.itemId} ILIKE $${pIdx} OR i.${item.Columns.name} ILIKE $${pIdx} OR i.${item.Columns.article} ILIKE $${pIdx})`;
        params.push(`%${filters.search}%`);
        pIdx++;
    }

    sql += ` ORDER BY pd.${col.createdAt} DESC`;

    const result = await query(sql, params);
    return result.rows;
};

/**
 * Project Results (History Scans)
 */
export const getProjectResults = async (projectId, filters = {}) => {
    const pr = DbContract.ProjectResult;
    const col = pr.Columns;
    const item = DbContract.Item;

    let sql = `
        SELECT pr.*, i.${item.Columns.name}, i.${item.Columns.article}
        FROM ${pr.TABLE} pr
        LEFT JOIN ${item.TABLE} i ON pr.${col.itemId} = i.${item.Columns.itemId}
        WHERE pr.${col.projectId} = $1 AND pr.${col.isDeleted} = FALSE
    `;
    const params = [projectId];
    let pIdx = 2;

    if (filters.search) {
        sql += ` AND (pr.${col.barcode} ILIKE $${pIdx} OR pr.${col.itemId} ILIKE $${pIdx} OR pr.${col.username} ILIKE $${pIdx} OR i.${item.Columns.name} ILIKE $${pIdx} OR i.${item.Columns.article} ILIKE $${pIdx})`;
        params.push(`%${filters.search}%`);
        pIdx++;
    }

    sql += ` ORDER BY pr.${col.timestamp} DESC`;

    const result = await query(sql, params);
    return result.rows;
};

/**
 * Bulk Import Items to Project (Atomic with Item & Barcode & ProjectDetail)
 */
export const bulkImportProjectItems = async (projectId, items, creator) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Ambil info project untuk brandCode
        const project = await getProjectById(projectId);
        if (!project) throw new Error('Project tidak ditemukan.');
        const brandCode = project.brandCode;

        const itemContract = DbContract.Item;
        const barcodeContract = DbContract.Barcode;
        const detailContract = DbContract.ProjectDetail;

        const iCol = itemContract.Columns;
        const bCol = barcodeContract.Columns;
        const dCol = detailContract.Columns;

        const itemSql = `
            INSERT INTO ${itemContract.TABLE} (
                ${iCol.itemId}, ${iCol.brandCode}, ${iCol.article}, ${iCol.material}, 
                ${iCol.color}, ${iCol.size}, ${iCol.name}, ${iCol.description}, 
                ${iCol.category}, ${iCol.price}, ${iCol.sellPrice}, ${iCol.discount},
                ${iCol.isSpecialPrice}, ${iCol.stockQty}, ${iCol.printQty}, ${iCol.pricingId},
                ${iCol.createdBy}, ${iCol.updatedBy}
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (${iCol.itemId}) DO UPDATE SET
                ${iCol.brandCode} = EXCLUDED.${iCol.brandCode},
                ${iCol.name} = EXCLUDED.${iCol.name},
                ${iCol.updatedBy} = EXCLUDED.${iCol.updatedBy},
                ${iCol.updatedAt} = CURRENT_TIMESTAMP
        `;

        const barcodeSql = `
            INSERT INTO ${barcodeContract.TABLE} (
                ${bCol.itemId}, ${bCol.barcode}, ${bCol.brandCode}, ${bCol.createdBy}, ${bCol.updatedBy}
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (${bCol.barcode}, ${bCol.brandCode}) DO NOTHING
        `;

        const detailSql = `
            INSERT INTO ${detailContract.TABLE} (
                ${dCol.projectId}, ${dCol.itemId}, ${dCol.barcode}, 
                ${dCol.price}, ${dCol.sellPrice}, ${dCol.discount},
                ${dCol.isSpecialPrice}, ${dCol.stockQty}, ${dCol.printQty}, ${dCol.pricingId},
                ${dCol.createdBy}, ${dCol.updatedBy}
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (${dCol.projectId}, ${dCol.barcode}) DO UPDATE SET
                ${dCol.itemId} = EXCLUDED.${dCol.itemId},
                ${dCol.stockQty} = EXCLUDED.${dCol.stockQty},
                ${dCol.updatedBy} = EXCLUDED.${dCol.updatedBy},
                ${dCol.updatedAt} = CURRENT_TIMESTAMP
        `;

        for (const i of items) {
            // 1. Insert/Update Item
            const itemValues = [
                i.itemId, brandCode, i.article || '', i.material || '',
                i.color || '', i.size || '', i.name, i.description || '',
                i.category || '', parseFloat(i.price) || 0, parseFloat(i.sellPrice) || 0, parseFloat(i.discount) || 0,
                i.isSpecialPrice === 'true' || i.isSpecialPrice === true, parseInt(i.stockQty) || 0, parseInt(i.printQty) || 0, i.pricingId || null,
                creator, creator
            ];
            await client.query(itemSql, itemValues);

            // 2. Insert Barcode
            const barcodeValues = [i.itemId, i.barcode, brandCode, creator, creator];
            await client.query(barcodeSql, barcodeValues);

            // 3. Insert/Update Project Detail
            const detailValues = [
                projectId, i.itemId, i.barcode,
                parseFloat(i.price) || 0, parseFloat(i.sellPrice) || 0, parseFloat(i.discount) || 0,
                i.isSpecialPrice === 'true' || i.isSpecialPrice === true, parseInt(i.stockQty) || 0, parseInt(i.printQty) || 0, i.pricingId || null,
                creator, creator
            ];
            await client.query(detailSql, detailValues);
        }

        await client.query('COMMIT');
        return { success: true, count: items.length };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Project Bulk Import Error:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Summary Calculation
 * @param {number} projectId
 * @param {object} filters
 */
export const getProjectSummary = async (projectId, filters = {}) => {
    const pr = DbContract.ProjectResult;
    const pd = DbContract.ProjectDetail;
    const item = DbContract.Item;

    let sql = `
        SELECT 
            i.${item.Columns.itemId}, 
            i.${item.Columns.name},
            i.${item.Columns.article},
            SUM(COALESCE(pr.${pr.Columns.scannedQty}, 0)) as "totalScanned",
            COALESCE(pd.${pd.Columns.stockQty}, i.${item.Columns.stockQty}, 0) as "expectedQty"
        FROM ${item.TABLE} i
        LEFT JOIN ${pr.TABLE} pr ON i.${item.Columns.itemId} = pr.${pr.Columns.itemId} AND pr.${pr.Columns.projectId} = $1 AND pr.${pr.Columns.isDeleted} = FALSE
        LEFT JOIN ${pd.TABLE} pd ON i.${item.Columns.itemId} = pd.${pd.Columns.itemId} AND pd.${pd.Columns.projectId} = $1 AND pd.${pd.Columns.isDeleted} = FALSE
        WHERE i.${item.Columns.isDeleted} = FALSE
    `;
    const params = [projectId];
    let pIdx = 2;

    if (filters.search) {
        sql += ` AND (i.${item.Columns.itemId} ILIKE $${pIdx} OR i.${item.Columns.name} ILIKE $${pIdx} OR i.${item.Columns.article} ILIKE $${pIdx} OR i.${item.Columns.description} ILIKE $${pIdx})`;
        params.push(`%${filters.search}%`);
        pIdx++;
    }

    sql += `
        GROUP BY i.${item.Columns.itemId}, i.${item.Columns.name}, i.${item.Columns.article}, pd.${pd.Columns.stockQty}, i.${item.Columns.stockQty}
        HAVING SUM(COALESCE(pr.${pr.Columns.scannedQty}, 0)) > 0 OR pd.${pd.Columns.stockQty} > 0 OR i.${item.Columns.stockQty} > 0
        ORDER BY i.${item.Columns.itemId} ASC
    `;

    const result = await query(sql, params);
    return result.rows;
};

/**
 * Soft Delete Project
 */
export const deleteProject = async (projectId, updater) => {
    const project = DbContract.ProjectHeader;
    const col = project.Columns;

    // Check if there are results
    const resultsCount = await query(`SELECT 1 FROM ${DbContract.ProjectResult.TABLE} WHERE ${DbContract.ProjectResult.Columns.projectId} = $1 LIMIT 1`, [projectId]);
    if (resultsCount.rowCount > 0) {
        throw new Error('Project tidak bisa dihapus karena sudah memiliki data hasil scan.');
    }

    const sql = `
        UPDATE ${project.TABLE}
        SET ${col.isDeleted} = TRUE, ${col.updatedBy} = $1, ${col.updatedAt} = CURRENT_TIMESTAMP
        WHERE ${col.projectId} = $2
    `;
    const result = await query(sql, [updater, projectId]);
    return result.rowCount > 0;
};

/**
 * Menandai project sebagai selesai
 * @param {number} projectId 
 * @param {string} projectCode 
 * @param {string} updater 
 */
export const markAsCompleted = async (projectId, projectCode, updater) => {
    const project = DbContract.ProjectHeader;
    const col = project.Columns;

    // Verify Project Code
    const existing = await getProjectById(projectId);
    if (!existing) throw new Error('Project tidak ditemukan.');
    if (existing.projectCode !== projectCode) {
        throw new Error('Konfirmasi Kode Project tidak sesuai.');
    }
    if (existing.isCompleted) {
        throw new Error('Project sudah berstatus selesai.');
    }

    const sql = `
        UPDATE ${project.TABLE} SET
            ${col.isCompleted} = TRUE,
            ${col.projectStatus} = 'COMPLETED',
            ${col.updatedBy} = $1,
            ${col.updatedAt} = CURRENT_TIMESTAMP
        WHERE ${col.projectId} = $2
        RETURNING *
    `;
    const result = await query(sql, [updater, projectId]);
    return result.rows[0];
};
