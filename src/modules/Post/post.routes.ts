import { Router } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

// create post
router.post("/post", auth(UserRole.USER), postController.createPost);

// get all post
router.get("/post", auth(UserRole.USER), postController.getAllpost);

// get specific
router.get("/post/:id", postController.getSinglePost);

// update post
router.put("/post/:id", auth(UserRole.USER), postController.updatePost);

// delete post
router.delete("/post/:id", postController.deletePost);

export const postRoutes = router;
