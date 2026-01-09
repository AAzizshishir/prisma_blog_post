import { Request, Response } from "express";
import { postService } from "./post.service";
import helperFuncForSorting from "../../helpers/helperFuncForSorting";
import { UserRole } from "../../middleware/auth";

// create post
const createPost = async (req: Request, res: Response) => {
  // console.log(req.user);
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    const result = await postService.createPost(req.body, user.id as string);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Post creation failed",
      details: error,
    });
  }
};

// get all post
const getAllpost = async (req: Request, res: Response) => {
  const { search } = req.query;
  const searchString = typeof search === "string" ? search : undefined;
  const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
  const isFeatured = req.query.isFeatured
    ? req.query.isFeatured === "true"
      ? true
      : req.query.isFeatured === "false"
      ? false
      : undefined
    : undefined;

  const { page, limit, skip, sortBy, sortOrder } = helperFuncForSorting(
    req.query
  );

  try {
    const result = await postService.getPosts({
      search: searchString,
      tags,
      isFeatured,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      succes: false,
      message: error.message,
    });
  }
};

// get single post
const getSinglePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await postService.getPostById(id as string);

    res.status(200).json({
      success: true,
      data: result,
      message: "Post retrieved successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      description: "this message from postId",
    });
  }
};

// get own post
const getOwnPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log(user);
    // if (!user) {
    //   throw new Error("unauthorized");
    // }
    console.log("user", user);
    const result = await postService.getOwnPost(user?.id as string);
    res.status(200).json({
      success: true,
      data: result,
      message: "Post retrieved successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update post
const updatePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const result = await postService.updatePost(
      id as string,
      req.body,
      userId as string,
      isAdmin
    );
    res.status(200).json({
      succes: true,
      data: result,
      message: "Post updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      succes: false,
      message: error.message,
    });
  }
};

// delete post
const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === UserRole.ADMIN;
    const result = await postService.deletePost(
      id as string,
      userId as string,
      isAdmin as boolean
    );
    res.status(200).json({
      succes: true,
      data: result,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      succes: false,
      message: error.message,
    });
  }
};

const stats = async (req: Request, res: Response) => {
  try {
    const result = await postService.stats();
    res.status(200).json({
      succes: true,
      data: result,
      message: "stats retrived successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      succes: false,
      message: error.message,
    });
  }
};

export const postController = {
  createPost,
  getAllpost,
  getSinglePost,
  getOwnPost,
  updatePost,
  deletePost,
  stats,
};
