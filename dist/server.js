

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20),
      email VARCHAR(20) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(15) DEFAULT 'contributor',

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(16) NOT NULL,
      status VARCHAR(13) DEFAULT 'open',
      reporter_id INT REFERENCES users(id) ON DELETE CASCADE,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("DB connected !");
  } catch (error) {
    console.log(error);
  }
};

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var signupUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role)
    VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
         SELECT * FROM users WHERE email = $1
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("You are not registered !");
  }
  const user = userData.rows[0];
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    throw new Error("Your password is incorrect !");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = jwt.sign(jwtPayload, config_default.jwt_secret, { expiresIn: "1d" });
  return {
    "token": accessToken,
    "user": {
      "id": user.id,
      "name": user.name,
      "email": user.email,
      "role": user.role,
      "created_at": user.created_at,
      "updated_at": user.updated_at
    }
  };
};
var authService = {
  signupUserIntoDB,
  loginUserIntoDB
};

// src/modules/auth/auth.controller.ts
var signupUser = async (req, res) => {
  try {
    const result = await authService.signupUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  signupUser,
  loginUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signupUser);
router.post("/login", authController.loginUser);
var authRoute = router;

// src/app.ts
import CookieParser from "cookie-parser";
import cors from "cors";

// src/middlewares/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
var createIssueIntoDB = async (payload, id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [title, description, type, id]
  );
  return result;
};
var getAllIssuesFromDB = async () => {
  const issues = await pool.query(`
      SELECT * FROM issues
      `);
  const reporterIdFromIssues = issues.rows.map((issue) => issue.reporter_id);
  const reporters = await pool.query(`
      SELECT id, name, role FROM users
      WHERE id IN (${reporterIdFromIssues.join(",")})
      `);
  const targetedIssues = issues.rows.map((issue) => {
    const reporter = reporters.rows.find(
      (r) => r.id === issue.reporter_id
    );
    const result = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: {
        id: reporter?.id,
        name: reporter?.name,
        role: reporter?.role
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
    return result;
  });
  return targetedIssues;
};
var getSingleIssueFromDB = async (id) => {
  const issueResult = await pool.query(
    `
      SELECT * FROM issues
      WHERE id = $1
      `,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found !");
  }
  const reporterResult = await pool.query(`
      SELECT id, name, role FROM users
      WHERE id IN (${issue.reporter_id})
      `);
  const reporter = reporterResult.rows[0];
  const result = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: {
      id: reporter?.id,
      name: reporter?.name,
      role: reporter?.role
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return result;
};
var updateIssueIntoDB = async (payload, id) => {
  const { title, description, type } = payload;
  const updatedResult = await pool.query(
    `
    UPDATE issues 
    SET 
    title = COALESCE($1, title),
    description = COALESCE($2, description),
    type = COALESCE($3, type),
    updated_at = NOW()
    WHERE id = $4
    RETURNING *
    `,
    [title, description, type, id]
  );
  return updatedResult;
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(`
      DELETE FROM issues
      WHERE id = $1
      `, [id]);
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const result = await issueService.createIssueIntoDB(req.body, req?.user?.id);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssuesFromDB();
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully !",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully !",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.updateIssueIntoDB(req.body, id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    if (result.rowCount === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found !"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middlewares/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access (Not logged in) !"
        });
      }
      const decoded = jwt2.verify(token, config_default.jwt_secret);
      const userData = await pool.query(`
            SELECT * FROM users WHERE id = $1
            `, [decoded.id]);
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User not found (Not registered) !"
        });
      }
      const user = userData.rows[0];
      if (!roles.includes(user.role)) {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden access !"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/user.types.ts
var User_Role = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/middlewares/verifyUpdateIssue.ts
var verifyUpdateIssue = (...roles) => {
  return async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
    try {
      const issueResult = await pool.query(`
                SELECT * FROM issues
                WHERE id = $1
                `, [id]);
      const issue = issueResult.rows[0];
      if (!issue) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "Issue not found"
        });
      }
      if (user?.role === roles[1]) {
        return next();
      }
      if (user?.role === roles[0] && issue.reporter_id === user?.id && issue.status === "open") {
        return next();
      }
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden access !"
      });
    } catch (error) {
      next(error);
    }
  };
};
var verifyUpdateIssue_default = verifyUpdateIssue;

// src/modules/issue/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default(User_Role.contributor, User_Role.maintainer), issueController.createIssue);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default(User_Role.contributor, User_Role.maintainer), verifyUpdateIssue_default(User_Role.contributor, User_Role.maintainer), issueController.updateIssue);
router2.delete("/:id", auth_default(User_Role.maintainer), issueController.deleteIssue);
var issueRoute = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(CookieParser());
app.use(cors({ origin: `http://localhost:${config_default.port}` }));
app.get("/", (req, res) => {
  res.status(200).json({
    message: "DevPulse Server",
    author: "Fardin Ahmed"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//! Signup User
//! Login User
//! Create Issue
//! Get All Issues
//! Get a Single Issue
//! Update Issue
//! Delete Issue
//# sourceMappingURL=server.js.map