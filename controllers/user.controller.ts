import ejs from "ejs";
import path from "path";
require("dotenv").config();
import jwt, { Secret } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import sendMail from "../utils/sendMail";
import ErrorHandler from "../utils/ErrorHandler";
import userModel, { IUser } from "../model/user.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";

// Register a user => /api/v1/register

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  //   avatar?: string;
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const isEmailExist = await userModel.findOne({ email });

      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }

      const user: IRegistrationBody = await userModel.create({
        name,
        email,
        password,
      });

      const activationToken = createActivationToken(user);
      const activationcode = activationToken.activationCode;
      const data = { user: { name: user.name }, activationcode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );
      try {
        await sendMail({
          email: user.email,
          subject: "Account Activation",
          template: "activation-mail.ejs",
          data,
        });
        res.status(201).json({
          success: true,
          message: `Account activation email has been sent to your email ${user.email}`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationTOken {
  token: string;
  activationCode: string;
}

// Create token for user
export const createActivationToken = (user: any): IActivationTOken => {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.JWT_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

interface IActivateRequest {
  activation_code: string;
  activation_token: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_code, activation_token } =
        req.body as IActivateRequest;

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.JWT_SECRET as Secret
      ) as { user: IUser; activationCode: string };

      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }
      const { name, email, password } = newUser.user;

      const userExist = await userModel.findOne({ email });

      if (userExist) {
        return next(new ErrorHandler("email already exists", 400));
      }

      const user: IUser = await userModel.create({
        name,
        email,
        password,
      });

      res.status(200).json({
        success: true,
        message: "Account has been activated",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
