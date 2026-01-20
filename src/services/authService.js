import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import redisClient from '../config/redis.js';
import DbContract from '../config/DbContract.js';

/**
 * Service Login
 * @param {string} username 
 * @param {string} password 
 */
export const login = async (username, password) => {
    try {
        const userTable = DbContract.User.TABLE;
        const col = DbContract.User.Columns;
        const key = DbContract.User.Keys;

        const sql = `
            SELECT ${col.username}, ${col.fullname}, ${col.password}, ${col.isAdmin}, ${col.disabled}
            FROM ${userTable}
            WHERE ${col.username} = $1 AND ${col.isDeleted} = FALSE
        `;

        const result = await query(sql, [username]);

        if (result.rows.length === 0) {
            return { success: false, message: 'User tidak ditemukan' };
        }

        const user = result.rows[0];

        if (user[key.disabled]) {
            return { success: false, message: 'Akun Anda dinonaktifkan' };
        }

        const isMatch = await bcrypt.compare(password, user[key.password]);
        if (!isMatch) {
            return { success: false, message: 'Password salah' };
        }

        const token = jwt.sign(
            {
                username: user[key.username],
                fullname: user[key.fullname],
                isAdmin: user[key.isAdmin]
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return { success: true, token };
    } catch (error) {
        console.error('AuthService Login Error:', error);
        throw error;
    }
};

/**
 * Service Logout (Blacklist Token)
 * @param {string} token 
 */
export const logout = async (token) => {
    try {
        const decoded = jwt.decode(token);
        const exp = decoded.exp;
        const now = Math.floor(Date.now() / 1000);
        const ttl = exp - now;

        if (ttl > 0) {
            await redisClient.set(`blacklist_${token}`, 'true', {
                EX: ttl
            });
        }
    } catch (error) {
        console.error('AuthService Logout Error:', error);
        throw error;
    }
};
