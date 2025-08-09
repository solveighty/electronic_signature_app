import mongoose, { Document, Schema } from 'mongoose';

export interface IUserMongo extends Document {
  id: string; // ID de Supabase
  friendRequestsSent: string[]; // IDs de usuarios a los que envió solicitud
  friendRequestsReceived: string[]; // IDs de usuarios que le enviaron solicitud
  friends: string[]; // IDs de amigos confirmados
}

const UserMongoSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  friendRequestsSent: { type: [String], default: [] },
  friendRequestsReceived: { type: [String], default: [] },
  friends: { type: [String], default: [] },
});

const UserMongo = mongoose.model<IUserMongo>('UserMongo', UserMongoSchema, 'users_mongo');

export default UserMongo;
