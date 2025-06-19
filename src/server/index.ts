import express from "express";
import cors from "cors";
import router from "./routes/auth";
import uploads from "./routes/uploads";
import { connectToMongoDB } from "./utils/mongoConnect";

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectToMongoDB().catch(console.error);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", router);
app.use("/api", uploads);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
