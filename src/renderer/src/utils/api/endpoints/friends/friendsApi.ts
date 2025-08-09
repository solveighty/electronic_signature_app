import api from '../../config/axiosConfig';

export function getAllUsers() {
  return api.get('/api/users');
}

export function getFriendsAndRequests(userId: string) {
  return api.get(`/api/friends/${userId}`);
}

export function sendFriendRequest(fromId: string, toId: string) {
  return api.post('/api/friend-request', { fromId, toId });
}

export function acceptFriendRequest(fromId: string, toId: string) {
  return api.post('/api/friend-request/accept', { fromId, toId });
}
