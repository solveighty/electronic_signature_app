import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import * as path from "path";
import * as fs from 'fs';

export interface CertificateUserData {
  userId: string;
  country: string;
  state: string;
  locality: string;
  organization: string;
  orgUnit: string;
  commonName: string;
  email: string;
  challengePassword: string;
  optionalCompany?: string;
  filename?:string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapePassword(pass: string): string {
  return pass.replace(/(["$`\\])/g, '\\$1');
}

function execPromise(cmd: string, env?: NodeJS.ProcessEnv): Promise<void> {
  console.log(`Ejecutando: ${cmd}`);
  return new Promise((resolve, reject) => {
    exec(cmd, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando comando: ${cmd}`);
        console.error(stderr || stdout || error);
        reject(stderr || stdout || error);
      } else {
        console.log(`Comando ejecutado correctamente: ${cmd}`);
        resolve();
      }
    });
  });
}

export const generateP12ForUser = async (data: CertificateUserData): Promise<string> => {
  const certDir = path.resolve(__dirname, '../../../files/certificates');
  if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

  const keyPath = path.join(certDir, `${data.userId}-key.pem`);
  const csrPath = path.join(certDir, `${data.userId}-csr.pem`);
  const crtPath = path.join(certDir, `${data.userId}-crt.crt`);
  const p12Path = path.join(certDir, `${data.userId}-cert.p12`);

  const opensslConf = 'C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.cnf'; // Ajusta la ruta según tu instalación
  const pass = escapePassword("");

  let subject = `/C=${data.country}/ST=${data.state}/L=${data.locality}/O=${data.organization}`;
  if (data.orgUnit) subject += `/OU=${data.orgUnit}`;
  subject += `/CN=${data.commonName}/emailAddress=${data.email}`;
  if (data.optionalCompany) subject += `/O=${data.optionalCompany}`;

  const env = {
    ...process.env,
    OPENSSL_CONF: opensslConf
  };

  try {
    await execPromise(`openssl genrsa -aes256 -passout pass:"${pass}" -out "${keyPath}" 2048`, env);
    await execPromise(`openssl req -new -key "${keyPath}" -out "${csrPath}" -subj "${subject}" -passin pass:"${pass}"`, env);
    await execPromise(`openssl x509 -req -in "${csrPath}" -signkey "${keyPath}" -out "${crtPath}" -days 365 -passin pass:"${pass}"`, env);
    await execPromise(`openssl pkcs12 -export -out "${p12Path}" -inkey "${keyPath}" -in "${crtPath}" -passin pass:"${pass}" -passout pass:"${pass}"`, env);

    if (fs.existsSync(p12Path)) {
      console.log(`Archivo P12 generado correctamente en: ${p12Path}`);
    } else {
      throw new Error(`No se pudo generar el archivo .p12 en: ${p12Path}`);
    }

    // Borra solo archivos temporales (key, csr, crt)
    
    [keyPath, csrPath, crtPath].forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          console.log(`Archivo temporal eliminado: ${file}`);
        } catch (e) {
          console.warn(`No se pudo eliminar el archivo temporal: ${file}`, e);
        }
      }
    });

    return p12Path;

  } catch (error) {
    console.error("Error al generar certificado P12:", error);
    throw error;
  }
};
