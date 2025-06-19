import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.VITE_MONGODB_URL;

if (!MONGO_URI) {
  console.error('MONGO_URI no definido en variables de entorno');
  process.exit(1);
}

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado con éxito');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};