import { issuesService } from "./issues.service.ts";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { sendSuccess } from "../../utility/sendResponse.ts";
import config from "../../config/index.ts";

const createIssue = (async (req: Request, res: Response) => {
    try {

        const token = req.headers.authorization;

        let decodedToken: JwtPayload;
        try {
            decodedToken = jwt.verify(token as string, config.jwtSecretKey as string) as JwtPayload;

        } catch {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        

        req.body.reporter_id = decodedToken.id

        const data = await issuesService.createIssueIntoDB(req.body);

        return sendSuccess(res, { createdIssue: data }, 201, "Issue created successfully");

        // const createdIssue = await issuesService.createIssueIntoDB(req.body);
        // return sendSuccess(res, createdIssue, 201, "Issue created successfully")
    }
    catch (err: any) {
        // return sendError(res, err.message, 500, "Failed to create issue ")
    }
})

export const issuesController = {
    createIssue,

}