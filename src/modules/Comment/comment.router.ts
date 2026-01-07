import { Router } from "express";
import { commentController } from "./comment.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = Router();

// get comment by id
router.get("/comment/:commentId", commentController.getCommentById);

// get comment by author
router.get("/comment/author/:authorId", commentController.getCommentByAuthor);

// create post
router.post(
  "/comment",
  auth(UserRole.USER, UserRole.ADMIN),
  commentController.createComment
);

router.put(
  "/comment/:commentId",
  auth(UserRole.ADMIN, UserRole.USER),
  commentController.updateComment
);

router.delete(
  "/comment/:commentId",
  auth(UserRole.USER, UserRole.ADMIN),
  commentController.deleteComment
);

// approve or reject comment by admin
router.patch(
  "/comment/:commentId/commentControlByAdmin",
  auth(UserRole.ADMIN),
  commentController.commentControlByAdmin
);

export const commentRoutes = router;
