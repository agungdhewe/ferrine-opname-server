import { query } from '../config/db.js';
import DbContract from '../config/DbContract.js';

/**
 * Tampilkan Halaman Dashboard
 */
export const showDashboard = async (req, res, next) => {
    try {
        // Mocking statistics for now (will be replaced with actual DB counts)
        const stats = {
            users: 2,
            devices: 0,
            items: 0,
            activeProjects: 0
        };

        res.render('dashboard', {
            user: req.user,
            stats: stats
        });
    } catch (error) {
        next(error);
    }
};
