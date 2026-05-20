import { issuesService } from "./issues.service";
import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utility/sendResponse";
import type {
    CreateIssuePayload,
    GetAllIssuesQuery,
    Issue,
    UpdateIssuePayload,
    Reporter,
} from "./issues.interfaces";
import type { JwtPayload } from "jsonwebtoken";
import HttpError from "../../utility/HttpError";

const createIssue = (async (req: Request<{}, Issue, CreateIssuePayload>, res: Response) => {
    try {
        req.body.reporter_id = (req.decodedToken as JwtPayload)?.id as number;

        const data = await issuesService.createIssueIntoDB(req.body);

        return sendSuccess(res, data, 201, "Issue created successfully");

    }
    catch (err: unknown) {
        if (err instanceof HttpError) {
            return sendError(res, err.message, err.status, err.message);
        }
        const message = err instanceof Error ? err.message : String(err);
        return sendError(res, message, 500, "Failed to create issue")
    }
})

const singleIssue = (async (req: Request<{ id: string }>, res: Response) => {
    try {
        const data = await issuesService.getIssueByIdIntoDB(req.params.id as string);

        return sendSuccess(res, data, 200);

    }
    catch (err: unknown) {
        if (err instanceof HttpError) {
            return sendError(res, err.message, err.status, err.message);
        }
        const message = err instanceof Error ? err.message : String(err);
        return sendError(res, message, 500, "Failed to find issue")
    }
})

const getAllIssues = (async (req: Request<{}, Issue[] | Issue, {}, GetAllIssuesQuery>, res: Response) => {
    try {
        const data = await issuesService.getAllIssuesIntoDB(req.query);
        return sendSuccess(res, data, 200);
    }
    catch (err: unknown) {
        if (err instanceof HttpError) {
            return sendError(res, err.message, err.status, err.message);
        }
        const message = err instanceof Error ? err.message : String(err);
        return sendError(res, message, 500, "Failed to find issues")
    }
})

const updateIssue = (async (req: Request<{ id: string }, Issue | string, UpdateIssuePayload>, res: Response) => {
    try {
        const { id } = req.params;

        const user = req.decodedToken as JwtPayload;

        const data = await issuesService.updateIssueInDB(id as string, user as unknown as Reporter , req.body);
       if (data.status === 200) {
            return sendSuccess(res, data.data, data.status);
        } else {
            return sendError(res, data.data, data.status, "Aunthorization error");
        }
    }
    catch (err: unknown) {
        if (err instanceof HttpError) {
            return sendError(res, err.message, err.status, err.message);
        }
        const message = err instanceof Error ? err.message : String(err);
        return sendError(res, message, 500, "Failed to update issue")
    }
})

const deleteIssue = (async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.decodedToken as JwtPayload ;
        const userPayload = user as unknown as Reporter ;
        if (userPayload?.role === "maintainer") {
            await issuesService.deleteIssueFromDB(id as string);

            return sendSuccess(res, undefined, 200, "Issue deleted successfully");
        } else {
            return sendError(res, "You are not a maintainer", 403, "Unauthorized");
        }
    }
    catch (err: unknown) {
        if (err instanceof HttpError) {
            return sendError(res, err.message, err.status, err.message);
        }
        const message = err instanceof Error ? err.message : String(err);
        return sendError(res, message, 404, "not found")
    }
})


export const issuesController = {
    createIssue,
    singleIssue,
    getAllIssues,
    updateIssue,
    deleteIssue

}