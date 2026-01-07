import { CommentStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

// create comment
const createComment = async (payload: {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}) => {
  console.log(payload);
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });
  if (payload.parentId) {
    await prisma.comment.findUniqueOrThrow({
      where: {
        id: payload.parentId,
      },
    });
  }
  console.log("comment comming here");
  return await prisma.comment.create({
    data: payload,
  });
};

// get comment by Id
const getCommentById = async (id: string) => {
  const result = await prisma.comment.findUnique({
    where: {
      id,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });

  return result;
};

// get comment by author
const getCommentByAuthor = async (authorId: string) => {
  console.log({ authorId });
  const result = await prisma.comment.findMany({
    where: {
      authorId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });

  return result;
};

// update comment
const updateComment = async (
  commentId: string,
  authorId: string,
  data: { content: string; status: CommentStatus }
) => {
  console.log({ commentId, authorId, data });
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });

  if (!commentData) {
    throw new Error("do not find comment");
  }
  return await prisma.comment.update({
    where: {
      id: commentId,
      authorId,
    },
    data,
  });
};

// Delete comment
const deleteComment = async (authorId: string, commentId: string) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });

  if (!commentData) {
    throw new Error("do not find comment");
  }

  return await prisma.comment.delete({
    where: {
      id: commentData.id,
    },
  });
};

// approve or reject comment by admin
const commentControlByAdmin = async (
  commentId: string,
  data: { status: CommentStatus }
) => {
  await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
    },
  });

  return await prisma.comment.update({
    where: {
      id: commentId,
    },
    data,
  });
};

export const commentService = {
  createComment,
  getCommentById,
  getCommentByAuthor,
  updateComment,
  deleteComment,
  commentControlByAdmin,
};
