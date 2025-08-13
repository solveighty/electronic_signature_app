import UserMongo from "../models/UserMongo";

// Ensure a corresponding Mongo user document exists for the given Supabase user id
export const ensureUserMongoExists = async (userId: string) => {
  if (!userId) return;
  const exists = await UserMongo.findOne({ id: userId });
  if (!exists) {
    await UserMongo.create({ id: userId });
  }
};

export default ensureUserMongoExists;
