import { query } from '../config/db.js';
import DbContract from '../config/DbContract.js';

/**
 * Mendapatkan semua device yang tidak dihapus
 */
export const getAllDevices = async () => {
    const device = DbContract.Device;
    const col = device.Columns;

    const sql = `
        SELECT ${col.deviceId}, ${col.name}, ${col.secret}, ${col.disabled}, ${col.createdAt}
        FROM ${device.TABLE}
        WHERE ${col.isDeleted} = FALSE
        ORDER BY ${col.createdAt} DESC
    `;

    const result = await query(sql);
    return result.rows;
};

/**
 * Mendapatkan device berdasarkan ID
 * @param {number} deviceId 
 */
export const getDeviceById = async (deviceId) => {
    const device = DbContract.Device;
    const col = device.Columns;

    const sql = `
        SELECT * FROM ${device.TABLE}
        WHERE ${col.deviceId} = $1 AND ${col.isDeleted} = FALSE
    `;

    const result = await query(sql, [deviceId]);
    return result.rows[0];
};

/**
 * Membuat device baru
 * @param {object} deviceData 
 * @param {string} creator 
 */
export const createDevice = async (deviceData, creator) => {
    const device = DbContract.Device;
    const col = device.Columns;

    const sql = `
        INSERT INTO ${device.TABLE} (
            ${col.name}, ${col.secret}, ${col.disabled},
            ${col.createdBy}, ${col.updatedBy}
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING ${col.deviceId}
    `;

    const values = [
        deviceData.name,
        deviceData.secret || null,
        deviceData.disabled || false,
        creator,
        creator
    ];

    const result = await query(sql, values);
    return result.rows[0];
};

/**
 * Memperbarui data device
 * @param {number} deviceId 
 * @param {object} deviceData 
 * @param {string} updater 
 */
export const updateDevice = async (deviceId, deviceData, updater) => {
    const device = DbContract.Device;
    const col = device.Columns;

    const sql = `
        UPDATE ${device.TABLE} 
        SET ${col.name} = $1, ${col.secret} = $2, ${col.disabled} = $3, 
            ${col.updatedBy} = $4, ${col.updatedAt} = CURRENT_TIMESTAMP
        WHERE ${col.deviceId} = $5 AND ${col.isDeleted} = FALSE
    `;

    const values = [
        deviceData.name,
        deviceData.secret || null,
        deviceData.disabled || false,
        updater,
        deviceId
    ];

    const result = await query(sql, values);
    return result.rowCount > 0;
};

/**
 * Soft Delete Device (as per rule: device cannot be physically deleted)
 * @param {number} deviceId 
 * @param {string} updater 
 */
export const deleteDevice = async (deviceId, updater) => {
    const device = DbContract.Device;
    const col = device.Columns;

    const sql = `
        UPDATE ${device.TABLE} 
        SET ${col.isDeleted} = TRUE, ${col.updatedBy} = $1, ${col.updatedAt} = CURRENT_TIMESTAMP
        WHERE ${col.deviceId} = $2
    `;

    const result = await query(sql, [updater, deviceId]);
    return result.rowCount > 0;
};
