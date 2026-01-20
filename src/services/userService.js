import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import DbContract from '../config/DbContract.js';

/**
 * Mendapatkan semua user yang tidak dihapus
 */
export const getAllUsers = async () => {
    const user = DbContract.User;
    const col = user.Columns;

    const sql = `
        SELECT ${col.username}, ${col.fullname}, ${col.isAdmin}, ${col.disabled}, ${col.createdAt}
        FROM ${user.TABLE}
        WHERE ${col.isDeleted} = FALSE
        ORDER BY ${col.createdAt} DESC
    `;

    const result = await query(sql);
    return result.rows;
};

/**
 * Mendapatkan user berdasarkan username
 * @param {string} username 
 */
export const getUserByUsername = async (username) => {
    const user = DbContract.User;
    const col = user.Columns;

    const sql = `
        SELECT * FROM ${user.TABLE}
        WHERE ${col.username} = $1 AND ${col.isDeleted} = FALSE
    `;

    const result = await query(sql, [username]);
    return result.rows[0];
};

/**
 * Membuat user baru
 * @param {object} userData 
 * @param {string} creator 
 */
export const createUser = async (userData, creator) => {
    const user = DbContract.User;
    const col = user.Columns;
    const key = user.Keys;

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const sql = `
        INSERT INTO ${user.TABLE} (
            ${col.username}, ${col.fullname}, ${col.password}, 
            ${col.isAdmin}, ${col.allowOpname}, ${col.allowReceiving}, 
            ${col.allowTransfer}, ${col.allowPrintLabel}, ${col.disabled},
            ${col.createdBy}, ${col.updatedBy}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING ${col.username}
    `;

    const values = [
        userData.username,
        userData.fullname,
        hashedPassword,
        userData.isAdmin || false,
        userData.allowOpname || false,
        userData.allowReceiving || false,
        userData.allowTransfer || false,
        userData.allowPrintLabel || false,
        userData.disabled || false,
        creator,
        creator
    ];

    const result = await query(sql, values);
    return result.rows[0];
};

/**
 * Memperbarui data user
 * @param {string} username 
 * @param {object} userData 
 * @param {string} updater 
 */
export const updateUser = async (username, userData, updater) => {
    const user = DbContract.User;
    const col = user.Columns;

    let sql = `UPDATE ${user.TABLE} SET `;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Fields to update
    const fields = [
        'fullname', 'isAdmin', 'allowOpname', 'allowReceiving',
        'allowTransfer', 'allowPrintLabel', 'disabled'
    ];

    fields.forEach(field => {
        if (userData[field] !== undefined) {
            updates.push(`${col[field]} = $${paramIndex++}`);
            values.push(userData[field]);
        }
    });

    // Handle password change if provided
    if (userData.password) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        updates.push(`${col.password} = $${paramIndex++}`);
        values.push(hashedPassword);
    }

    updates.push(`${col.updatedBy} = $${paramIndex++}`);
    values.push(updater);

    updates.push(`${col.updatedAt} = CURRENT_TIMESTAMP`);

    sql += updates.join(', ');
    sql += ` WHERE ${col.username} = $${paramIndex++} AND ${col.isDeleted} = FALSE`;
    values.push(username);

    const result = await query(sql, values);
    return result.rowCount > 0;
};

/**
 * Soft Delete User
 * @param {string} username 
 * @param {string} updater 
 */
export const deleteUser = async (username, updater) => {
    const user = DbContract.User;
    const col = user.Columns;

    const sql = `
        UPDATE ${user.TABLE} 
        SET ${col.isDeleted} = TRUE, ${col.updatedBy} = $1, ${col.updatedAt} = CURRENT_TIMESTAMP
        WHERE ${col.username} = $2
    `;

    const result = await query(sql, [updater, username]);
    return result.rowCount > 0;
};
