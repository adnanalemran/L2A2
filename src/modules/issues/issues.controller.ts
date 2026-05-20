import { issuesService } from "./issues.service";
import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utility/sendResponse";

const createIssue = (async (req: Request, res: Response) => {
    try {
        req.body.reporter_id = req.decodedToken?.id

        const data = await issuesService.createIssueIntoDB(req.body);

        return sendSuccess(res, data, 201, "Issue created successfully");

    }
    catch (err: any) {
        return sendError(res, err.message, 500, "Failed to create issue")
    }
})

const singleIssue = (async (req: Request, res: Response) => {
    try {
        const data = await issuesService.getIssueByIdIntoDB(req.params.id as string);
        const { reporter_id: _, ...issueData } = data
        return sendSuccess(res, issueData, 200);
    }
    catch (err: any) {
        return sendError(res, err.message, 500, "Failed to find issue")
    }
})

const getAllIssues = (async (req: Request, res: Response) => {
    try {
        const data = await issuesService.getAllIssuesIntoDB(req.query);
        return sendSuccess(res, data, 200);
    }
    catch (err: any) {
        return sendError(res, err.message, 500, "Failed to find issues")
    }
})

export const issuesController = {
    createIssue,
    singleIssue,
    getAllIssues

}