import { Response } from "express";

export type TResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
    status: number; 
    error?: any;
};

const sendResponse = <T>(res: Response, payload: TResponse<T>) => {
    const response: any = {
        success: payload.success,
        message: payload.message,
    };
    if (payload.error === undefined) {
        response.data = payload.data ?? null;
    } else {
        response.error = payload.error;
    }
    res.status(payload.status).json(response);
};

export const sendSuccess = <T>(res: Response, data: T, status = 200, message = "Success") =>
    sendResponse(res, { success: true, status, message, data });

export const sendError = (res: Response, error: any, status = 500, message = "Error") =>
    sendResponse(res, { success: false, status, message, error });

export default sendResponse;