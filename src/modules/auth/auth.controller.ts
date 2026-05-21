import type { Request, Response } from "express"
import sendResponse from "../../utility/sendResponse";
import { authService } from "./auth.service";


const signUpUser = async (req: Request, res: Response) => {

    try {
        const result = await authService.signUpUserIntoDB(req.body);

        sendResponse(res, {
            statusCode: 201,
            success : true,
            message: "User Signed up successfully !",
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


export const authController = {
    signUpUser,

}