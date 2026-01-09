import { CommentStatus, Post, PostStatus } from "../../generated/prisma/client";
import { PostWhereInput } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

// create post
const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });

  return result;
};

// get all post
const getPosts = async ({
  search,
  tags,
  isFeatured,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  tags: string[];
  isFeatured: boolean | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const andCondition: PostWhereInput[] = [];

  if (search) {
    andCondition.push({
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search,
          },
        },
      ],
      tags: {
        hasEvery: tags,
      },
    });
  }
  if (typeof isFeatured === "boolean") {
    andCondition.push({
      isFeatured,
    });
  }

  const result = await prisma.post.findMany({
    skip,
    take: limit,
    where: {
      AND: andCondition,
    },
    orderBy: {
      [sortBy]: sortOrder,
      createdAt: "asc",
    },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  const total = await prisma.post.count({
    where: {
      AND: andCondition,
    },
  });
  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getOwnPost = async (userId: string) => {
  await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  const result = await prisma.post.findMany({
    where: {
      authorId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

// get single post
const getPostById = async (postId: string) => {
  return await prisma.$transaction(async (tx) => {
    const postExists = await tx.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!postExists) {
      throw new Error("Post not found");
    }

    await tx.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const postData = await tx.post.findUnique({
      where: { id: postId },
      include: {
        comments: {
          where: {
            parentId: null,
            status: CommentStatus.APPROVED,
          },
          orderBy: { createdAt: "desc" },
          include: {
            replies: {
              where: { status: CommentStatus.APPROVED },
              include: {
                replies: {
                  where: { status: CommentStatus.APPROVED },
                },
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return postData;
  });
};

// update post
const updatePost = async (
  id: string,
  payload: any,
  authorId: string,
  isAdmin: boolean
) => {
  const postData = await prisma.post.findFirstOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      authorId: true,
    },
  });
  if (postData.authorId !== authorId) {
    throw new Error("This post is not yours");
  }

  if (!isAdmin) {
    delete payload.isFeatured;
  }

  const result = await prisma.post.update({
    where: { id },
    data: payload,
  });
  return result;
};

// delete post
const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean
) => {
  const postData = await prisma.post.findFirstOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("This post is not yours");
  }

  const result = await prisma.post.delete({
    where: { id: postId },
  });
  return result;
};

// stats
const stats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalPost,
      publishedPost,
      archivedPost,
      draftPost,
      totalComment,
      approvedComment,
      totalUser,
      totalAdmin,
      userCount,
      totalViewsInPost,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
      await tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
      await tx.post.count({ where: { status: PostStatus.DRAFT } }),
      await tx.comment.count(),
      await tx.comment.count({ where: { status: CommentStatus.APPROVED } }),
      await tx.user.count(),
      await tx.user.count({ where: { role: "ADMIN" } }),
      await tx.user.count({ where: { role: "USER" } }),
      await tx.post.aggregate({
        _sum: { views: true },
      }),
    ]);
    return {
      totalPost,
      publishedPost,
      archivedPost,
      draftPost,
      totalComment,
      approvedComment,
      totalUser,
      totalAdmin,
      userCount,
      totalViewsInPost: totalViewsInPost._sum.views,
    };
  });
};

export const postService = {
  createPost,
  getPosts,
  getPostById,
  getOwnPost,
  updatePost,
  deletePost,
  stats,
};
