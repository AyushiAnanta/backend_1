//require('dotenv').config()
import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";
import { ApiError } from "./utils/ApiError.js";

dotenv.config({
    path: './.env'
})

connectDb()
.then(() => {

    app.on("error", (error) => {
            console.error("ERROR",error);
            throw error;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`SERVER IS LISTENING AT PORT ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("mongo db con fail", err)
})

/*
import express from "express";
const app = express()

;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.error("ERROR",error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`app is listening on port ${process.env.PORT}`)
        })

    } catch (error) {
        console.error("ERROR",error);
        throw error;
    }
})()


*/