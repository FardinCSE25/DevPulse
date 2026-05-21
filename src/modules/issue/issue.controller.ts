import type { Request, Response } from "express"
import { issueService } from "./issue.service"
import sendResponse from "../../utility/sendResponse";


//! Create Issue
const createIssue = async (req: Request, res: Response) => {

    try {
        const result = await issueService.createIssueIntoDB(req.body, req?.user?.id);

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Issue created successfully",
            data: result.rows[0]
        })

    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}


//! Get All Issues
const getAllIssues = async (req: Request, res: Response) => {

    try {
        const result = await issueService.getAllIssuesFromDB();

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues retrieved successfully !",
            data: result
        })

    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}


//! Get a Single Issue
const getSingleIssue = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await issueService.getSingleIssueFromDB(id as string);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue retrieved successfully !",
            data: result
        })

    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}


//! Update Issue
const updateIssue = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await issueService.updateIssueIntoDB(req.body, id as string);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue updated successfully",
            data: result.rows[0]
        })

    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }

}


//! Delete Issue
const deleteIssue = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await issueService.deleteIssueFromDB(id as string);

        if (result.rowCount === 0) {
            sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Issue not found !",
            })
        }

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue deleted successfully",
        })

    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}


export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}