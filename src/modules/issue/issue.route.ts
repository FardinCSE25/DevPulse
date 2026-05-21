import { Router } from "express";
import { issueController } from "./issue.controller"
import auth from "../../middlewares/auth";
import { User_Role } from "../../types/user.types";

const router = Router();


//! Create Issue
router.post("/", auth(User_Role.contributor, User_Role.maintainer), issueController.createIssue);

// //! Get All Issues
// router.get("/", issueController.getAllIssues);


export const issueRoute = router;