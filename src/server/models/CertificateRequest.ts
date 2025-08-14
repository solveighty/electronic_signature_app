import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificateRequest extends Document {
  userId: string;
  country: string;
  state: string;
  locality: string;
  organization: string;
  orgUnit?: string;
  commonName: string;
  email: string;
  challengePassword: string;
  optionalCompany?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
  certificateId?: string;
  rejectionReason?: string;
}

const CertificateRequestSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  locality: { type: String, required: true },
  organization: { type: String, required: true },
  orgUnit: { type: String },
  commonName: { type: String, required: true },
  email: { type: String, required: true },
  challengePassword: { type: String, required: true },
  optionalCompany: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  certificateId: { type: String },
  rejectionReason: { type: String }
});

export default mongoose.model<ICertificateRequest>('CertificateRequest', CertificateRequestSchema, 'certificate_requests');
