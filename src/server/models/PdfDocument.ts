import mongoose, { Schema, Document } from 'mongoose';

export interface IPdfDocument extends Document {
  userId: string;
  fileName: string;
  encryptedContent: string;
  createdAt: Date;
  status: string;
}

const PdfDocumentSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  encryptedContent: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Pendiente de firma' }
});

export default mongoose.model<IPdfDocument>('PdfDocument', PdfDocumentSchema);