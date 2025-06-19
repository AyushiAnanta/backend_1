import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//configuratios!!!!!!!!!!!!!!!!!!1
app.use(express.json({limit: "4kb"}))
app.use(express.urlencoded({extended: true, limit: "4kb"}))
app.use(express.static("public"))
app.use(cookieParser())
//5:47 in the video



//routes import
import userRouter from './routes/user.routes.js'
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import { ApiResponse } from "./utils/ApiResponse.js";

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/healthcheck", (req,res) => {return res.status(200).json(new ApiResponse(200, "everything good"))})

export { app }