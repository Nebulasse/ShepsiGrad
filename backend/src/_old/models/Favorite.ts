import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Создаем уникальный составной индекс для предотвращения дублирования
FavoriteSchema.index({ user: 1, property: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema); 