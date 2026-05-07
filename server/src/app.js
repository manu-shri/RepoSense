import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5174",
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the MERN template API" });
});

app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);

export default app;
