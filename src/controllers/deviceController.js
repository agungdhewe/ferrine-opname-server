import * as deviceService from '../services/deviceService.js';

/**
 * List all devices
 */
export const index = async (req, res, next) => {
    try {
        const devices = await deviceService.getAllDevices();
        res.render('devices/index', {
            user: req.user,
            devices: devices,
            title: 'Daftar Perangkat'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Show create device form
 */
export const create = (req, res) => {
    res.render('devices/form', {
        user: req.user,
        targetDevice: null,
        title: 'Tambah Perangkat'
    });
};

/**
 * Handle device creation
 */
export const store = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            disabled: !!req.body.disabled
        };

        await deviceService.createDevice(data, req.user.username);
        res.redirect('/devices');
    } catch (error) {
        next(error);
    }
};

/**
 * Show edit device form
 */
export const edit = async (req, res, next) => {
    try {
        const targetDevice = await deviceService.getDeviceById(req.params.id);
        if (!targetDevice) {
            return res.status(404).render('error', { message: 'Perangkat tidak ditemukan', user: req.user });
        }
        res.render('devices/form', {
            user: req.user,
            targetDevice: targetDevice,
            title: 'Edit Perangkat'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle device update
 */
export const update = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            disabled: !!req.body.disabled
        };

        await deviceService.updateDevice(req.params.id, data, req.user.username);
        res.redirect('/devices');
    } catch (error) {
        next(error);
    }
};

/**
 * Handle device soft delete
 */
export const remove = async (req, res, next) => {
    try {
        await deviceService.deleteDevice(req.params.id, req.user.username);
        res.redirect('/devices');
    } catch (error) {
        next(error);
    }
};
