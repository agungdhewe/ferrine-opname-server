import { query } from '../config/db.js';
import DbContract from '../config/DbContract.js';

/**
 * Tampilkan Halaman Dashboard
 */
export const showDashboard = async (req, res, next) => {
    try {
        // Mendapatkan statistik dari database
        const [userCount, deviceCount, itemCount, projectCount] = await Promise.all([
            query(`SELECT COUNT(*) FROM ${DbContract.User.TABLE} WHERE ${DbContract.User.Columns.disabled} = FALSE AND ${DbContract.User.Columns.isDeleted} = FALSE`),
            query(`SELECT COUNT(*) FROM ${DbContract.Device.TABLE} WHERE ${DbContract.Device.Columns.disabled} = FALSE AND ${DbContract.Device.Columns.isDeleted} = FALSE`),
            query(`SELECT COUNT(*) FROM ${DbContract.Item.TABLE} WHERE ${DbContract.Item.Columns.disabled} = FALSE AND ${DbContract.Item.Columns.isDeleted} = FALSE`),
            query(`SELECT COUNT(*) FROM ${DbContract.ProjectHeader.TABLE} WHERE ${DbContract.ProjectHeader.Columns.disabled} = FALSE AND ${DbContract.ProjectHeader.Columns.isDeleted} = FALSE`)
        ]);

        const stats = {
            users: parseInt(userCount.rows[0].count),
            devices: parseInt(deviceCount.rows[0].count),
            items: parseInt(itemCount.rows[0].count),
            activeProjects: parseInt(projectCount.rows[0].count)
        };

        res.render('dashboard', {
            user: req.user,
            stats: stats
        });
    } catch (error) {
        next(error);
    }
};
