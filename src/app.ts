import express, { type Application, type Request, type Response } from "express"
import { authRoute } from "./modules/auth/auth.route"
// import { profileRoute } from "./modules/profile/profile.route";
// import { authRoute } from "./modules/auth/auth.route";
import CookieParser from "cookie-parser"
import cors from "cors"
import config from "./config";
import globalErrorHandler from "./middlewares/globalErrorHandler";


const app: Application = express()
app.use(express.json());
app.use(CookieParser());
app.use(cors({ origin: `http://localhost:${config.port}` }))

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "DevPulse Server",
        author: "Fardin Ahmed",
    });
});

app.use("/api/auth", authRoute);

app.use(globalErrorHandler)

export default app;
