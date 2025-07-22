export interface GenerateCertificateData {
  country: string;
  state: string;
  locality: string;
  organization: string;
  orgUnit: string;
  commonName: string;
  email: string;
  challengePassword: string;
  optionalCompany?: string;
}