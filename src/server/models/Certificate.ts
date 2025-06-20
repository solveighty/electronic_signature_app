import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  userId: string;
  fileName: string;
  hash: string; 
  type?: string;
  createdAt: Date;
}

const certificateSchema: Schema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  hash: { type: String, required: true }, 
  type: { type: String, default: 'p12' },
  createdAt: { type: Date, default: Date.now }
});

const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema, 'certificates');

export default Certificate;
