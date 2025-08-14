import mongoose, { Document, Schema } from 'mongoose';

export interface ISignatureRequest extends Document {
  documentId: string; // ID del documento a firmar
  fromUserId: string; // Quien solicita la firma
  toUserId: string;   // Quien debe firmar
  status: 'pending' | 'signed' | 'rejected';
  createdAt: Date;
  signedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

const SignatureRequestSchema: Schema = new Schema({
  documentId: { type: String, required: true },
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'signed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  signedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
});

const SignatureRequest = mongoose.model<ISignatureRequest>('SignatureRequest', SignatureRequestSchema, 'signature_requests');

export default SignatureRequest;
