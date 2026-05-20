

import { Request, Response } from 'express'
import {  authService } from "./auth.service.ts";
import { sendSuccess, sendError } from "../../utility/sendResponse.ts";

const createUser = (async (req: Request, res: Response) => {
    try {
        const createdUser = await authService.createUserIntoDB(req.body);
        return sendSuccess( res, createdUser, 201, "User created successfully")
    }
    catch (err: any) {
        return sendError(res, err.message, 500, "Failed to create user")
    }
})

export const authController = {
    createUser
}