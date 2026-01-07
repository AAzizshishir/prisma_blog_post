import { Request, Response } from "express";
import { commentService } from "./comment.service";
import { CommentStatus } from "../../generated/prisma/enums";

// create post
const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    req.body.authorId = user?.id;
    const result = await commentService.createComment(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Comment creation failed",
      details: error,
    });
  }
};

// get comment by id
const getCommentById = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  try {
    const result = await commentService.getCommentById(commentId as string);
    res.status(200).json({
      success: true,
      data: result,
      message: "Comments retrieved successfull",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCommentByAuthor = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    const result = await commentService.getCommentByAuthor(authorId as string);
    res.status(200).json({
      success: true,
      data: result,
      message: "Comments retrieved successfull",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update comment
const updateComment = async (req: Request, res: Response) => {
  try {
    const user = req?.user;
    const { commentId } = req.params;
    const result = await commentService.updateComment(
      commentId as string,
      user?.id as string,
      req.body
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "Comment updated successfull",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete comment
const deleteComment = async (req: Request, res: Response) => {
  try {
    const user = req?.user;
    const { commentId } = req.params;
    const result = await commentService.deleteComment(
      user?.id as string,
      commentId as string
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "Comment deleted successfull",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// approve or reject comment by admin
const commentControlByAdmin = async (req: Request, res: Response) => {
  try {
    const user = req?.user;
    const { commentId } = req.params;
    console.log(user, commentId);
    const result = await commentService.commentControlByAdmin(
      commentId as string,
      req.body
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "Comment updated successfull",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      description: "Wrong credentials",
    });
  }
};

export const commentController = {
  createComment,
  getCommentById,
  getCommentByAuthor,
  updateComment,
  deleteComment,
  commentControlByAdmin,
};
