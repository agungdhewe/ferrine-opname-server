import * as authService from '../services/authService.js';

/**
 * Tampilkan Halaman Login
 */
export const showLoginPage = (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/');
    }
    res.render('login', { layout: false });
};

/**
 * Handle Login POST
 */
export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);

        if (result.success) {
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 jam
            });
            return res.redirect('/');
        }

        res.render('login', {
            layout: false,
            error: result.message || 'Login Gagal'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle Logout
 */
export const logout = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            await authService.logout(token);
        }
        res.clearCookie('token');
        res.redirect('/login');
    } catch (error) {
        next(error);
    }
};
