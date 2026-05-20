import type { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    const message = err instanceof Error ? err.message : String(err ?? "Internal Server Error");
    res.status(500).json({
        success: false,
        message,
    });
};

export default globalErrorHandler;