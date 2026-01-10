import { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";

function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = error;

  // Prisma Client Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  }
  // Prisma Client Known Request Error
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      (statusCode = 400),
        (errorMessage =
          "An operation failed because it depends on one or more records that were required but not found.");
    } else if (error.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key error";
    } else if (error.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    }
  }
  // Prisma Client Unknown Request Error
  else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution";
  }
  // Prisma Client Rust Panic Error
  else if (error instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    errorMessage =
      "A string detailing the specific panic that occurred in the Rust engine.";
  }
  //
  else if (error instanceof Prisma.PrismaClientInitializationError) {
    if (error.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your creditials!";
    } else if (error.errorCode === "P1001") {
      statusCode = 400;
      errorMessage = "Can't reach database server";
    }
  }

  res.status(statusCode);
  res.json({
    message: errorMessage,
    // error: errorDetails,
  });
}

export default errorHandler;
