import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from "../config/index.ts";
import { pool } from "../db/index.ts";
import { ROLES } from "../types/index.ts";


export const auth = (...roles: ROLES[]) => {

    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            const token = req?.headers?.authorization;
            if (!token) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            //validate token here
            const decodedToken = jwt.verify(token as string, config.jwtSecretKey as string) as JwtPayload;

            const userdata = await pool.query(
                `
            SELECT * FROM users WHERE email = $1
            `,
                [decodedToken.email]
            );

            const user = userdata.rows[0]


            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            if (user.is_active === false) {
                return res.status(401).json({ message: 'Forbidden' });
            }


            if (roles.length > 0 && !roles.includes(user.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            req.user = user

            next()
        }
        catch (error) {
            next(error)
        }
    }
}
