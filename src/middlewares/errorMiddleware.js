/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Global Error Handler:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Respons berdasarkan tipe request (HTML atau JSON)
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(statusCode).json({
            success: false,
            message: message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    res.status(statusCode).render('error', {
        message: message,
        error: process.env.NODE_ENV === 'development' ? err : {},
        user: req.user || null
    });
};

/**
 * Not Found Middleware
 */
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
