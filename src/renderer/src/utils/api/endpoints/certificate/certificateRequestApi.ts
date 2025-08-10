import api from '../../config/axiosConfig';

export type CertificateRequestPayload = {
  country: string;
  state: string;
  locality: string;
  organization: string;
  orgUnit?: string;
  commonName: string;
  email: string;
  challengePassword: string;
  optionalCompany?: string;
};

export function submitCertificateRequest(payload: CertificateRequestPayload) {
  return api.post('/api/certificate-requests', payload);
}

export function listCertificateRequests() {
  return api.get('/api/certificate-requests');
}

export function approveCertificateRequest(id: string) {
  return api.post(`/api/certificate-requests/${id}/approve`);
}

export function rejectCertificateRequest(id: string) {
  return api.post(`/api/certificate-requests/${id}/reject`);
}
