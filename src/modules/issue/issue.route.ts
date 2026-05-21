import { Router } from "express";
import { issueController } from "./issue.controller"
import auth from "../../middlewares/auth";
import { User_Role } from "../../types/user.types";
import verifyUpdateIssue from "../../middlewares/verifyUpdateIssue";

const router = Router();


//! Create Issue
router.post("/", auth(User_Role.contributor, User_Role.maintainer), issueController.createIssue);

//! Get All Issues
router.get("/", issueController.getAllIssues);

//! Get a Single Issue
router.get("/:id", issueController.getSingleIssue);

//! Update Issue
router.patch("/:id", auth(User_Role.contributor, User_Role.maintainer), verifyUpdateIssue(User_Role.contributor, User_Role.maintainer), issueController.updateIssue);

//! Delete Issue
router.delete("/:id", auth(User_Role.maintainer), issueController.deleteIssue);


export const issueRoute = router;