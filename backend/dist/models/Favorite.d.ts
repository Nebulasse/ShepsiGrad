import mongoose, { Document } from 'mongoose';
export interface IFavorite extends Document {
    user: mongoose.Types.ObjectId;
    property: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IFavorite, {}, {}, {}, mongoose.Document<unknown, {}, IFavorite, {}> & IFavorite & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
