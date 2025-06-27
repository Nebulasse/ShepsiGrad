"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const user_model_1 = require("../../models/user.model");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createTable('users', {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            first_name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            last_name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            role: {
                type: sequelize_1.DataTypes.ENUM(...Object.values(user_model_1.UserRole)),
                allowNull: false,
                defaultValue: user_model_1.UserRole.USER,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM(...Object.values(user_model_1.UserStatus)),
                allowNull: false,
                defaultValue: user_model_1.UserStatus.PENDING,
            },
            avatar_url: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            email_verified: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            email_verification_token: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            password_reset_token: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            password_reset_expires: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            last_login_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            created_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            updated_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            deleted_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
        });
        // Добавление индексов
        await queryInterface.addIndex('users', ['email']);
        await queryInterface.addIndex('users', ['role']);
        await queryInterface.addIndex('users', ['status']);
        await queryInterface.addIndex('users', ['email_verified']);
        await queryInterface.addIndex('users', ['deleted_at']);
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('users');
    },
};
