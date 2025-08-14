import supabase from './supabase';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

/**
 * Gets user information by user ID from Supabase
 * @param userId - The user ID to look up
 * @returns User information or null if not found
 */
export const getUserById = async (userId: string): Promise<UserInfo | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, isAdmin')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      isAdmin: user.isAdmin || false
    };
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
};
