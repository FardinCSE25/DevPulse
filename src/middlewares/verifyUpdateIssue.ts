import type { NextFunction, Request, Response } from "express";
import { pool } from "../db";
import type { Roles } from "../types/user.types";
import sendResponse from "../utility/sendResponse";


const verifyUpdateIssue = (...roles: Roles[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        const user = req.user
        const { id } = req.params

        try {

            const issueResult = await pool.query(`
                SELECT * FROM issues
                WHERE id = $1
                `, [id])

            const issue = issueResult.rows[0]

            if (!issue) {
                return sendResponse(res, {
                    statusCode: 404,
                    success: false,
                    message: "Issue not found",
                })
            }

            if (user?.role === roles[1]) {
                return next()
            }

            if (user?.role === roles[0] && issue.reporter_id === user?.id && issue.status === "open") {
                return next()
            }

            return sendResponse(res, {
                statusCode: 403,
                success: false,
                message: "Forbidden access !",
            })

        } catch (error) {
            next(error)
        }
    }
}

export default verifyUpdateIssue;