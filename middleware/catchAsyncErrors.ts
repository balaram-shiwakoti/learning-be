import { NextFunction, Request, Response } from "express";

export const CatchAsyncError =
  (theFunc: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };

//   https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
