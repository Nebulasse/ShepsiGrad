"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserRole = void 0;
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connection_1 = __importDefault(require("../database/connection"));
// Роли пользователей
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["LANDLORD"] = "landlord";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
// Статусы пользователей
var UserStatus;
(function (UserStatus) {
    UserStatus["PENDING"] = "pending";
    UserStatus["ACTIVE"] = "active";
    UserStatus["BLOCKED"] = "blocked";
    UserStatus["DELETED"] = "deleted";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// Модель пользователя
class User extends sequelize_1.Model {
    // Валидация пароля
    async validatePassword(password) {
        return bcryptjs_1.default.compare(password, this.password);
    }
    // Получение полного имени пользователя
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    // Получение публичных данных пользователя (без чувствительной информации)
    toPublic() {
        const { password, emailVerificationToken, passwordResetToken, passwordResetExpires, ...publicData } = this.toJSON();
        return publicData;
    }
}
// Инициализация модели
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: false,
        defaultValue: UserRole.USER,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(UserStatus)),
        allowNull: false,
        defaultValue: UserStatus.PENDING,
    },
    avatarUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    emailVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    emailVerificationToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    passwordResetToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    passwordResetExpires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    lastLoginAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    modelName: 'User',
    tableName: 'users',
    paranoid: true, // Включение мягкого удаления
    defaultScope: {
        attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        }
    },
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcryptjs_1.default.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password') && user.password) {
                user.password = await bcryptjs_1.default.hash(user.password, 10);
            }
        },
    },
});
exports.default = User;
