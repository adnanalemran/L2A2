import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import config from "../config/index";
import { pool } from "../db";

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, config.jwtSecretKey as string) as JwtPayload;
        const userID = decoded.id;
        //user find by id from database and attach to req object
        const validateUserData = await pool.query(`SELECT * FROM users WHERE id = $1`, [userID]);
        if (!validateUserData.rows.length) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.decodedToken = { ...decoded, ...validateUserData.rows[0] };
    } catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
};