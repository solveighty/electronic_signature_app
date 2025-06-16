interface Certificate {
  userId: string;
  filename: string;
  certificateData: Buffer;
  encryptionSalt: string;
  encryptionKey: string;
}
export type { Certificate as default };
