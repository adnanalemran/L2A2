import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import config from "../config/index";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, config.jwtSecretKey as string) as JwtPayload;
    } catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    req.decodedToken = decoded;
    next();
};