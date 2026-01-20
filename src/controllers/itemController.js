import * as itemService from '../services/itemService.js';
import csv from 'csv-parser';
import fs from 'fs';

/**
 * List all items with search and filter
 */
export const index = async (req, res, next) => {
    try {
        const filters = {
            search: req.query.search,
            brandCode: req.query.brandCode,
            barcode: req.query.barcode
        };
        const items = await itemService.getAllItems(filters);
        res.render('items/index', {
            user: req.user,
            items: items,
            filters: filters,
            title: 'Manajemen Item'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Show create/edit form
 */
export const form = async (req, res, next) => {
    try {
        let targetItem = null;
        if (req.params.id) {
            targetItem = await itemService.getItemById(req.params.id);
        }
        res.render('items/form', {
            user: req.user,
            targetItem: targetItem,
            title: targetItem ? 'Edit Item' : 'Tambah Item'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle Item Upsert
 */
export const save = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            disabled: !!req.body.disabled
        };
        await itemService.upsertItem(data, req.user.username);
        res.redirect('/items');
    } catch (error) {
        next(error);
    }
};

/**
 * Show barcodes for an item
 */
export const barcodes = async (req, res, next) => {
    try {
        const item = await itemService.getItemById(req.params.id);
        const barcodes = await itemService.getItemBarcodes(req.params.id);
        res.render('items/barcodes', {
            user: req.user,
            item: item,
            barcodes: barcodes,
            title: 'Daftar Barcode'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Show upload form
 */
export const showUpload = (req, res) => {
    res.render('items/upload', {
        user: req.user,
        title: 'Upload Item CSV'
    });
};

/**
 * Handle CSV Upload
 */
export const uploadCsv = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).render('error', { message: 'File tidak ditemukan', user: req.user });
    }

    const items = [];
    let delimiter = req.body.delimiter || ',';

    // Map special delimiter names to actual characters
    if (delimiter === 'tab') delimiter = '\t';
    if (delimiter === 'pipe') delimiter = '|';

    fs.createReadStream(req.file.path)
        .pipe(csv({ separator: delimiter }))
        .on('data', (data) => items.push(data))
        .on('end', async () => {
            try {
                await itemService.bulkImportItems(items, req.user.username);
                // Clean up file
                fs.unlinkSync(req.file.path);
                res.redirect('/items');
            } catch (error) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                next(error);
            }
        })
        .on('error', (error) => {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            next(error);
        });
};

/**
 * Download CSV Template
 */
export const downloadTemplate = (req, res) => {
    const headers = 'brandCode,barcode,itemId,article,material,color,size,name,description,category,price,sellPrice,discount,isSpecialPrice,stockQty,printQty,pricingId\n';
    const example = 'FRN,8991234000001,FORM-COT-WHT-S,FORM01,COTTON,WHITE,S,Kemeja Formal Slim Fit,Bahan katun stretch,Baju Formal,250000,250000,0,false,50,0,PRC01\n';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=template_item.csv');
    res.status(200).send(headers + example);
};

/**
 * Soft Delete Item
 */
export const remove = async (req, res, next) => {
    try {
        await itemService.deleteItem(req.params.id, req.user.username);
        res.redirect('/items');
    } catch (error) {
        next(error);
    }
};
