import { Router } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

// create post
router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.createPost
);

// get all post
router.get("/", auth(UserRole.USER, UserRole.ADMIN), postController.getAllpost);

// stats
router.get("/stats", auth(UserRole.ADMIN), postController.stats);

// get own post
router.get("/my-post", auth(UserRole.USER), postController.getOwnPost);

// get specific
router.get("/:id", auth(UserRole.USER), postController.getSinglePost);

// update post
router.put(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.updatePost
);

// delete post
router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.USER),
  postController.deletePost
);

export const postRoutes = router;
