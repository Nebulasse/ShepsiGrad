import { Sequelize } from 'sequelize';
declare const sequelize: Sequelize;
export declare const initDatabase: () => Promise<void>;
export default sequelize;
