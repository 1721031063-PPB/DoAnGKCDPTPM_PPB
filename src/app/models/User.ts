import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite {
  label: string;
  lat: number;
  lon: number;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  favorites: IFavorite[];
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  label: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
});

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional for OAuth users
    name: { type: String, required: true },
    favorites: { type: [FavoriteSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
