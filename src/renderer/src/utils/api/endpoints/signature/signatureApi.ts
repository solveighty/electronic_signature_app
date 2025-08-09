import api from '../../config/axiosConfig';

export function createSignatureRequest(documentId: string, fromUserId: string, toUserId: string) {
  return api.post('/api/signature-request', { documentId, fromUserId, toUserId });
}

export function getSignatureRequestsForUser(userId: string) {
  return api.get(`/api/signature-requests/${userId}`);
}

export function completeSignatureRequest(id: string) {
  return api.post(`/api/signature-request/${id}/complete`);
}
