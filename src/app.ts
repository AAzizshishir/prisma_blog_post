import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { commentRoutes } from "./modules/Comment/comment.router";
import { postRoutes } from "./modules/Post/post.routes";
import errorHandler from "./middleware/globalErrorHandler";

const app: Application = express();

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:4000",
    credentials: true,
  })
);

app.use(express.json());

// post routes
app.use("/post", postRoutes);

// comment routes
app.use("/", commentRoutes);

app.get("/", (req, res) => {
  res.send("Prisma Blog App");
});

app.use(errorHandler);

export default app;
