import crypto from "crypto";
import { existsSync, readFileSync } from "fs-extra";

export class CertificateManager {
  static deriveKey(password: string, salt: string) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        1000000,
        32,
        "sha256",
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey);
        }
      );
    });
  }

  static async encryptAndStoreCertificate(
    filepath: string,
    password: string,
    userId: string
  ) {
    if (!existsSync(filepath)) {
      throw new Error("The file .p12 doesnt exist.");
    }

    const salt = crypto.randomBytes(16);
    const derivedKey = await this.deriveKey(password, salt.toString("hex"));

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-ocb", derivedKey, iv);

    const fileBuffer = readFileSync(filepath);

    let encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
  }
}
