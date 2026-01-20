import * as projectService from '../services/projectService.js';
import * as userService from '../services/userService.js';
import * as deviceService from '../services/deviceService.js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import crypto from 'crypto';
import fetch from 'node-fetch';

const upload = multer({ dest: 'tmp/' });
export const uploadMiddleware = upload.single('csvFile');

/**
 * List all projects with filters
 */
export const index = async (req, res, next) => {
    try {
        const filters = {
            brandCode: req.query.brandCode,
            siteCode: req.query.siteCode,
            workingType: req.query.workingType,
            dateStart: req.query.dateStart,
            dateEnd: req.query.dateEnd
        };
        const projects = await projectService.getAllProjects(filters);
        res.render('projects/index', {
            user: req.user,
            projects,
            filters,
            title: 'Manajemen Project'
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
        let targetProject = null;
        if (req.params.id) {
            targetProject = await projectService.getProjectById(req.params.id);
        }
        res.render('projects/form', {
            user: req.user,
            targetProject,
            title: targetProject ? 'Edit Project' : 'Buat Project Baru'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle Project Save/Update
 */
export const save = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            projectId: req.params.id ? parseInt(req.params.id) : null,
            disabled: !!req.body.disabled
        };
        await projectService.upsertProject(data, req.user.username);
        res.redirect('/projects');
    } catch (error) {
        // If overlap or validation error, render form with error
        const targetProject = req.params.id ? await projectService.getProjectById(req.params.id) : req.body;
        res.render('projects/form', {
            user: req.user,
            targetProject,
            error: error.message,
            title: req.params.id ? 'Edit Project' : 'Buat Project Baru'
        });
    }
};

/**
 * View Project Details with Tabs
 */
export const view = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const activeTab = req.query.tab || 'details';
        const project = await projectService.getProjectById(projectId);

        if (!project) {
            return res.status(404).render('error', { message: 'Project tidak ditemukan', user: req.user });
        }

        let data = {};
        if (activeTab === 'details') {
            data.items = await projectService.getProjectDetails(projectId, { search: req.query.search });
        } else if (activeTab === 'results') {
            data.results = await projectService.getProjectResults(projectId, { search: req.query.search });
        } else if (activeTab === 'users') {
            data.users = await projectService.getProjectUsers(projectId);
            data.allUsers = await userService.getAllUsers();
            data.allDevices = await deviceService.getAllDevices();
        } else if (activeTab === 'summary') {
            data.summary = await projectService.getProjectSummary(projectId, { search: req.query.search });
        }

        res.render('projects/view', {
            user: req.user,
            project,
            activeTab,
            ...data,
            filters: { search: req.query.search },
            title: `Project: ${project.projectCode}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Assign User to Project
 */
export const assignUser = async (req, res, next) => {
    try {
        const { username, deviceId } = req.body;
        await projectService.assignUser(req.params.id, username, deviceId, req.user.username);
        res.redirect(`/projects/${req.params.id}?tab=users`);
    } catch (error) {
        next(error);
    }
};

/**
 * Remove User from Project
 */
export const removeUser = async (req, res, next) => {
    try {
        const { username, deviceId } = req.body;
        await projectService.removeUser(req.params.id, username, deviceId, req.user.username);
        res.redirect(`/projects/${req.params.id}?tab=users`);
    } catch (error) {
        next(error);
    }
};

/**
 * Download Project Summary as CSV
 */
export const downloadSummary = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const delimiter = req.query.delimiter || ',';
        const project = await projectService.getProjectById(projectId);
        const summary = await projectService.getProjectSummary(projectId, { search: req.query.search });

        if (!project) throw new Error('Project tidak ditemukan.');

        let csvContent = `ItemId${delimiter}Name${delimiter}Article${delimiter}StockSistem${delimiter}HasilScan${delimiter}Selisih\n`;
        summary.forEach(s => {
            const diff = s.totalScanned - s.expectedQty;
            csvContent += `"${s.itemId}"${delimiter}"${s.name}"${delimiter}"${s.article}"${delimiter}${s.expectedQty}${delimiter}${s.totalScanned}${delimiter}${diff}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=summary_${project.projectCode}.csv`);
        res.status(200).send(csvContent);
    } catch (error) {
        next(error);
    }
};

/**
 * Download CSV Template for Project Items (No brandCode)
 */
export const downloadTemplate = (req, res) => {
    const headers = 'barcode,itemId,article,material,color,size,name,description,category,price,sellPrice,discount,isSpecialPrice,stockQty,printQty,pricingId\n';
    const example = '8991234000001,FORM-COT-WHT-S,FORM01,COTTON,WHITE,S,Kemeja Formal Slim Fit,Bahan katun stretch,Baju Formal,250000,250000,0,false,50,0,PRC01\n';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=template_project_item.csv');
    res.status(200).send(headers + example);
};

/**
 * Upload CSV for Project Items
 */
export const uploadCsv = async (req, res) => {
    const projectId = req.params.id;
    const delimiter = req.body.delimiter || ',';

    if (!req.file) {
        return res.status(400).send('File tidak ditemukan.');
    }

    const items = [];
    const delimiterMap = {
        'comma': ',',
        'semicolon': ';',
        'pipe': '|',
        'tab': '\t'
    };

    const separator = delimiterMap[delimiter] || delimiter;

    fs.createReadStream(req.file.path)
        .pipe(csv({
            separator,
            mapHeaders: ({ header }) => header.trim()
        }))
        .on('data', (data) => {
            // Validasi baris kosong atau data cacat
            if (data.itemId && data.barcode) {
                items.push(data);
            }
        })
        .on('end', async () => {
            try {
                if (items.length > 0) {
                    await projectService.bulkImportProjectItems(projectId, items, req.user.username);
                }
                // Clean up
                fs.unlinkSync(req.file.path);
                res.redirect(`/projects/${projectId}?tab=details`);
            } catch (error) {
                console.error(error);
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                res.status(500).send('Gagal mengimpor data: ' + error.message);
            }
        });
};

/**
 * Mark Project as Completed with Webhook
 */
export const markAsCompleted = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { projectCode } = req.body;

        const updatedProject = await projectService.markAsCompleted(projectId, projectCode, req.user.username);

        // Webhook Notification
        if (process.env.ENABLE_PROJECT_COMPLETED_WEBHOOK === 'true') {
            const webhookUrl = process.env.PROJECT_COMPLETED_WEBHOOK_URL;
            const secret = process.env.PROJECT_COMPLETED_WEBHOOK_SECRET || 'ferrine-secret';

            if (webhookUrl) {
                const nonce = crypto.randomBytes(16).toString('hex');
                const timestamp = Math.floor(Date.now() / 1000);
                const payload = JSON.stringify({
                    projectId: updatedProject.projectId,
                    projectCode: updatedProject.projectCode,
                    timestamp
                });

                // Signature: HMAC-SHA256(secret, payload + nonce + timestamp)
                const signature = crypto.createHmac('sha256', secret)
                    .update(payload + nonce + timestamp)
                    .digest('hex');

                try {
                    // Using Node.js built-in fetch (Node 18+)
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Webhook-Nonce': nonce,
                            'X-Webhook-Timestamp': timestamp.toString(),
                            'X-Webhook-Signature': signature
                        },
                        body: payload
                    });
                    console.log(`Webhook sent to ${webhookUrl} for project ${updatedProject.projectCode}`);
                } catch (webhookError) {
                    console.error('Webhook Failure:', webhookError.message);
                }
            }
        }

        res.redirect(`/projects/${projectId}`);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Project
 */
export const remove = async (req, res, next) => {
    try {
        await projectService.deleteProject(req.params.id, req.user.username);
        res.redirect('/projects');
    } catch (error) {
        next(error);
    }
};
