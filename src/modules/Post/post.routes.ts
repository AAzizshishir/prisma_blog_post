import { Router } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

// create post
router.post(
  "/post",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.createPost
);

// get all post
router.get(
  "/post",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.getAllpost
);

// stats
router.get("/post/stats", auth(UserRole.ADMIN), postController.stats);

// get own post
router.get("/post/my-post", auth(UserRole.USER), postController.getOwnPost);

// get specific
router.get("/post/:id", auth(UserRole.USER), postController.getSinglePost);

// update post
router.put(
  "/post/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.updatePost
);

// delete post
router.delete(
  "/post/:id",
  auth(UserRole.ADMIN, UserRole.USER),
  postController.deletePost
);

export const postRoutes = router;
