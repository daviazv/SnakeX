import mongoose, { Schema, Document, Model } from 'mongoose'
import type { SkinId } from '@/types'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  username: string
  email: string
  passwordHash: string
  level: number
  xp: number
  highScore: number
  skin: SkinId
  unlockedSkins: SkinId[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, maxlength: 16, uppercase: true },
    email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    level:    { type: Number, default: 1 },
    xp:       { type: Number, default: 0 },
    highScore:{ type: Number, default: 0 },
    skin:     { type: String, default: 'default' },
    unlockedSkins: { type: [String], default: ['default'] },
  },
  { timestamps: true }
)

UserSchema.index({ highScore: -1 })

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
