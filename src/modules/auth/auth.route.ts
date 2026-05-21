import { Router } from "express";
import { authController } from "./auth.controller"
// import auth from "../../middlewares/auth";
// import { User_Role } from "../../types";

const router = Router();


//! Create User
router.post("/", authController.signUpUser);

// //! Get All Users
// router.get("/", auth(User_Role.admin, User_Role.agent), userController.getAllUsers);

// //! Get Single User
// router.get("/:id", userController.getSingleUser);

// //! Update User
// router.put("/:id", userController.updateUser);

// //! Delete User
// router.delete("/:id", userController.deleteUser);


export const authRoute = router;