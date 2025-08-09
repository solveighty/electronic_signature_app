import supabase from "../utils/supabase";
import UserMongo from "../models/UserMongo";
import { connectToMongoDB } from "../utils/mongoConnect";

// Sincroniza todos los usuarios de Supabase a MongoDB si no existen
const syncSupabaseToMongo = async () => {
  await connectToMongoDB();
  const { data: users, error } = await supabase
    .from("users")
    .select("id, name, email, isAdmin");
  if (error) {
    console.error("Error obteniendo usuarios de Supabase:", error);
    process.exit(1);
  }
  for (const user of users) {
    const exists = await UserMongo.findOne({ id: user.id });
    if (!exists) {
      await UserMongo.create({ id: user.id });
    }
  }
  console.log("Sincronización completa.");
  process.exit(0);
};

syncSupabaseToMongo();
