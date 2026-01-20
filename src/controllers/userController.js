import * as userService from '../services/userService.js';

/**
 * List all users
 */
export const index = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.render('users/index', {
            user: req.user,
            users: users,
            title: 'Daftar Pengguna'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Show create user form
 */
export const create = (req, res) => {
    res.render('users/form', {
        user: req.user,
        targetUser: null,
        title: 'Tambah Pengguna'
    });
};

/**
 * Handle user creation
 */
export const store = async (req, res, next) => {
    try {
        // Convert checkbox values to boolean
        const data = {
            ...req.body,
            isAdmin: !!req.body.isAdmin,
            allowOpname: !!req.body.allowOpname,
            allowReceiving: !!req.body.allowReceiving,
            allowTransfer: !!req.body.allowTransfer,
            allowPrintLabel: !!req.body.allowPrintLabel,
            disabled: !!req.body.disabled
        };

        await userService.createUser(data, req.user.username);
        res.redirect('/users');
    } catch (error) {
        next(error);
    }
};

/**
 * Show edit user form
 */
export const edit = async (req, res, next) => {
    try {
        const targetUser = await userService.getUserByUsername(req.params.username);
        if (!targetUser) {
            return res.status(404).render('error', { message: 'User tidak ditemukan', user: req.user });
        }
        res.render('users/form', {
            user: req.user,
            targetUser: targetUser,
            title: 'Edit Pengguna'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle user update
 */
export const update = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            isAdmin: !!req.body.isAdmin,
            allowOpname: !!req.body.allowOpname,
            allowReceiving: !!req.body.allowReceiving,
            allowTransfer: !!req.body.allowTransfer,
            allowPrintLabel: !!req.body.allowPrintLabel,
            disabled: !!req.body.disabled
        };

        // If password is empty, don't update it
        if (!data.password) {
            delete data.password;
        }

        await userService.updateUser(req.params.username, data, req.user.username);
        res.redirect('/users');
    } catch (error) {
        next(error);
    }
};

/**
 * Handle user soft delete
 */
export const remove = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.username, req.user.username);
        // If it's an HTMX request, we might want to return something else, but for now redirect
        res.redirect('/users');
    } catch (error) {
        next(error);
    }
};
