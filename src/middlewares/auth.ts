import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config";
import { pool } from "../db";
import type { Roles } from "../types/user.types";
import sendResponse from "../utility/sendResponse";


const auth = (...roles: Roles[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            const token = req.headers.authorization

            if (!token) {
                sendResponse(res, {
                    statusCode: 401,
                    success: false,
                    message: "Unauthorized access (Not logged in) !",
                })
            }

            const decoded = jwt.verify(token as string, config.jwt_secret as string) as JwtPayload

            const userData = await pool.query(`
            SELECT * FROM users WHERE id = $1
            `, [decoded.id])

            if (userData.rows.length === 0) {
                sendResponse(res, {
                    statusCode: 404,
                    success: false,
                    message: "User not found (Not registered) !",
                })
            }

            const user = userData.rows[0];

            if (!roles.includes(user.role)) {
                sendResponse(res, {
                    statusCode: 403,
                    success: false,
                    message: "Forbidden access !",
                })
            }

            req.user = decoded;

            next();
        } catch (error) {
            next(error)
        }
    }
}

export default auth;