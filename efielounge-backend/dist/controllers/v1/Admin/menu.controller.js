"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const menu_service_1 = require("../../../services/v1/Admin/menu.service");
const menuController = {
    createMenu: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.createMenu(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    editMenu: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.editMenu(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    archiveMenu: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.archiveMenu(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    createMenuCategory: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.createMenuCategory(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    editMenuCategory: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.editMenuCategory(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    archiveMenuCategory: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.archiveMenuCategory(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    createMenuItem: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.createMenuItem(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    editMenuItem: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.editMenuItem(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    archiveMenuItem: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.archiveMenuItem(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    createMenuItemCategory: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.createMenuItemCategory(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    editMenuItemCategory: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.editMenuItemCategory(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
    archiveMenuItemCategory: async (req, res, next) => {
        try {
            let status = 400;
            const result = await menu_service_1.Menuservice.archiveMenuItemCategory(req);
            if (result)
                status = result.code;
            return res.status(status).json(result);
        }
        catch (error) {
            error.status = 500;
            next(error);
        }
    },
};
exports.default = menuController;
