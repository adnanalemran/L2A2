import type { Request, Response } from 'express'
import { authService } from "./auth.service";
import { sendSuccess, sendError } from "../../utility/sendResponse";

const createUser = (async (req: Request, res: Response) => {
    try {
        const createdUser = await authService.createUserIntoDB(req.body);
        return sendSuccess(res, createdUser, 201, "User created successfully")
    }
    catch (err: any) {
        return sendError(res, err.message, 500, "Failed to create user")
    }
})

const loginUser = async (req: Request, res: Response) => {
    try {

        const authResult = await authService.loginUserIntoDB(req.body)
        const { token, ...userData } = authResult

        return sendSuccess(res, { token: token, user: userData }, 200 , "Login successful")

    }
    catch (err: any) {
        const isInvalidCredentials = err.message === "Invalid credentials"
        return sendError(
            res,
            err.message,
            isInvalidCredentials ? 401 : 500,
            isInvalidCredentials ? "Invalid credentials" : "Failed to login user"
        )
    }
}


export const authController = {
    createUser,
    loginUser
}