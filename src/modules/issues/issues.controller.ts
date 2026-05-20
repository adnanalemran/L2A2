import { issuesService } from "./issues.service.js";
import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utility/sendResponse.js";

const createIssue = (async (req: Request, res: Response) => {
    try {
        req.body.reporter_id = req.decodedToken?.id

        const data = await issuesService.createIssueIntoDB(req.body);

        return sendSuccess(res, { createdIssue: data }, 201, "Issue created successfully");
 
    }
    catch (err: any) {
        return sendError (res, err.message, 500, "Failed to create issue")
    }
})

export const issuesController = {
    createIssue,

}