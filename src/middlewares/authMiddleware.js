import jwt from 'jsonwebtoken';
import redisClient from '../config/redis.js';

/**
 * Middleware Autentikasi JWT
 */
export const authenticateJWT = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        // Cek Blacklist di Redis
        const isBlacklisted = await redisClient.get(`blacklist_${token}`);
        if (isBlacklisted) {
            res.clearCookie('token');
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

/**
 * Middleware RBAC: Check Admin
 */
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    return res.status(403).render('error', {
        message: 'Akses Ditolak: Halaman ini hanya untuk Administrator.',
        user: req.user
    });
};

/**
 * Middleware RBAC: Check Permissions (Opname, etc)
 */
export const checkPermission = (permissionField) => {
    return (req, res, next) => {
        if (req.user && (req.user.isAdmin || req.user[permissionField])) {
            return next();
        }
        return res.status(403).json({ error: 'Akses Ditolak: Anda tidak memiliki izin untuk fitur ini.' });
    };
};
