import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    const options = {
        page,
        limit
    }

    const aggregate = Comment.aggregate([{
        $match: {
            video: new mongoose.Types.ObjectId(videoId) 
        }
    },
    {$sort: {createdAt: -1}}
    ])

    const comment = await Comment.aggregatePaginate(aggregate, options)

    if (!comment) {
        throw new ApiError(400, "comments cant be fetched")
    }

    return res.status(200).json(new ApiResponse(200, comment, "comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    console.log(req.params)
    const {content} = req.body

    if (!content) {
        throw new ApiError(400, "content is required")
    }

    if (!videoId) {
        throw new ApiError(400, "video required")
    }

    const comment = await Comment.create(
        {
            video: videoId,
            content,
            owner: req.user?._id
        }
    )

    return res.status(200).json(new ApiResponse(200, comment, "comment added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params


    const {content} = req.body

    if (!content) {
        throw new ApiError(400, "comment is needed")
    }
    const comment = await Comment.findByIdAndUpdate(commentId,{
        $set: {
            content
        }
    },{new: true})

    return res.status(200).json(new ApiResponse(200, comment, "updated comment successfully"))
 
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    try {
        const { commentId } = req.params
        const comment =await Comment.findByIdAndDelete(
            commentId,
            {new: true})
        
            
        return res.status(200).json(new ApiResponse(200, "comment Deleted Successfully"))
        
    } catch (error) {
        throw new ApiError(400, error)
    }
  
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }