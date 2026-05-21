import type { Request, Response } from "express"
import { issueService } from "./issue.service"


const createIssue = async (req: Request, res: Response) => {
console.log(req.user);

    try {
        const result = await issueService.createIssueIntoDB(req.body, req?.user?.id);

        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result.rows[0],
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
}


// const getAllIssues = async (req: Request, res: Response) => {

//     try {
//         const result = await issueService.getAllIssuesFromDB();
//         res.status(200).json({
//             success: true,
//             message: "Issues retrieved successfully !",
//             data: result.rows,
//         });

//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//             error: error
//         });
//     }
// }


// const getSingleIssue = async (req: Request, res: Response) => {
//     const { id } = req.params;

//     try {
//         const result = await issueService.getSingleIssueFromDB(id as string);

//         if (result.rows.length === 0) {
//             res.status(404).json({
//                 success: false,
//                 message: "Issue not found !"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Issue retrieved successfully !",
//             data: result.rows[0],
//         });

//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//             error: error
//         });
//     }
// }


// const updateIssue = async (req: Request, res: Response) => {
//     const { id } = req.params;

//     try {
//         const result = await issueService.updateIssueIntoDB(req.body, id as string);

//         if (result.rows.length === 0) {
//             res.status(404).json({
//                 success: false,
//                 message: "Issue not found !"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Issue updated successfully !",
//             data: result.rows[0],
//         });

//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//             error: error,
//         });
//     }

// }


// const deleteIssue = async (req: Request, res: Response) => {
//     const { id } = req.params;

//     try {
//         const result = await issueService.deleteIssueFromDB(id as string);

//         if (result.rowCount === 0) {
//             res.status(404).json({
//                 success: false,
//                 message: "Issue not found !"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Issue deleted successfully !",
//         });

//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//             error: error
//         });
//     }
// }


export const issueController = {
    createIssue,
    // getAllIssues,
    // getSingleIssue,
    // updateIssue,
    // deleteIssue
}