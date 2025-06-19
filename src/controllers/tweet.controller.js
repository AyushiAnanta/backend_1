import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if (!content) {
        throw new ApiError(400, "content is required")
    }

    
    const tweet= await Tweet.create(
        {
            content,
            owner: req.user?._id
            }
        )
    
    return res.status(200).json(new ApiResponse(200, tweet, "tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const tweet = await Tweet.aggregate([{
        $match: {
        owner: new mongoose.Types.ObjectId(req.user._id)
        }
    }])

    if (!tweet) {
        throw new ApiError(400, "tweets could not be fetched")
    }

    return res.status(200).json(new ApiResponse(200, tweet, "all user tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params

    const  { content } = req.body

    if (!content) {
        throw new ApiError(400, "content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set: {
            content
        }
    },{new: true})

    if (!tweet) {
        throw new ApiError(400, "tweet couldnt be updated")
    }

    return res.status(200).json(new ApiResponse(200, tweet, "tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params

    const tweet = await Tweet.findByIdAndDelete(tweetId,{new: true})

    console.log("delete it stupid?????",tweet)

    if (tweet) {
        throw new ApiError(400, "tweet couldnt be deleted")
    }

    return res.status(200).json(new ApiResponse(200,"tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}