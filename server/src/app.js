import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", process.env.CLIENT_URL].filter(Boolean),
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the RepoSense API" });
});

app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);

export default app;
