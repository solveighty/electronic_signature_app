import mongoose, { Document, Schema } from 'mongoose';

export interface ISignatureRequest extends Document {
  documentId: string; // ID del documento a firmar
  fromUserId: string; // Quien solicita la firma
  toUserId: string;   // Quien debe firmar
  status: 'pending' | 'signed';
  createdAt: Date;
  signedAt?: Date;
}

const SignatureRequestSchema: Schema = new Schema({
  documentId: { type: String, required: true },
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'signed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  signedAt: { type: Date },
});

const SignatureRequest = mongoose.model<ISignatureRequest>('SignatureRequest', SignatureRequestSchema, 'signature_requests');

export default SignatureRequest;
