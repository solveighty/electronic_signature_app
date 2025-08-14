import api from '../../config/axiosConfig';

export type UserInfo = {
  id: string;
  name: string;
  email: string;
};

export async function getUserInfoById(userId: string): Promise<UserInfo | null> {
  try {
    const res = await api.get(`/api/users/${userId}`);
    return res.data;
  } catch (e) {
    return null;
  }
}
