import express from "express";
import cors from "cors";
import router from "./routes/auth";
import uploads from "./routes/uploads";
import friendRoutes from "./routes/friend";
import { connectToMongoDB } from "./utils/mongoConnect";

const app = express();
const PORT = process.env.VITE_ENVIRONMENT === "development" ? 3000 : 80;

// Conectar a MongoDB
connectToMongoDB().catch(console.error);

// Redireccionar a HTTPS
/*
app.use((req, res, next) => {
  if (req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});*/

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", router);
app.use("/api", uploads);
app.use("/api", friendRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
