import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const options = {
        page,
        limit,
        query,
        sortBy,
        sortType,
    }

    const aggregate = Video.aggregate([{
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id) 
            }
        },
        {$sort: {createdAt: -1}}
    ])

    const video = await Video.aggregatePaginate(aggregate, options)

    if (!video) {
        throw new ApiError(400, "videos not available")
    }

    return res.status(200).json(new ApiResponse(200, video, "all videos fetched successfully"))
})

const getAllUserVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortType = -1 } = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: parseInt(sortType) }
    };

    const aggregate = Video.aggregate([
        { $sort: options.sort }
    ]);

    const videos = await Video.aggregatePaginate(aggregate, options);

    if (!videos) {
        throw new ApiError(400, "Videos not available");
    }

    return res.status(200).json(new ApiResponse(200, videos, "All user's videos fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
    
    // TODO: get video, upload to cloudinary, create video

    //title,description , ]]{{thumbnail, video}}--through multer , async await]] leke object banalo

    //take title,description from frontend
    //take video, thumbnail through multer, 
    //check for video and thumbnail then get cloudinary url
    //create object video add in db
    //return response

    const { title, description} = req.body

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "both fields are req")
    }
    
    console.log("REQ.FILES----------------", req.files);

    //video upload
    
    
    const videoArray = req.files?.videoFile;

    const videoFileLocalPath = videoArray?.[0]?.path;
    if (!videoFileLocalPath) {
        throw new ApiError(400, "video file is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "video file is required for cloudinary")
    }

    console.log("tiiiiiiiiiime",videoFile.duration)

    //thumbnail upload

    const thumbnailArray = req.files?.thumbnail;
    const thumbnailLocalPath = thumbnailArray?.[0]?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail file is required for cloudinary")
    }

    const video = await Video.create(
        {
            title,
            description,
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            duration: videoFile.duration,
            owner: req.user?._id
        }
    )
    
    const createdVideo = await Video.findById(video._id)

    if (!createdVideo) {
            throw new ApiError(500, "something went wrong while uploading video")
        }
    

    return res.status(200).json(new ApiResponse(200, createdVideo , "video uploaded successfully"))
        
    

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const checkVideoId = await Video.findById(videoId)

    if (!checkVideoId) {
        throw new ApiError(400, "video not found")
    }

    return res.status(200).json(new ApiResponse(200, checkVideoId , "video found successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body
    //thumbnail upload

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail file is required for cloudinary")
    }

    const video =await Video.findByIdAndUpdate(
        videoId,
    {
        $set: {
            title,
            description,
            thumbnail: thumbnail.url
        }
    },
    {new: true})
    //======================================what is new: true??

    return res.status(200).json(new ApiResponse(200, video, "details updated successfully"))


})
const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json(new ApiResponse(404, null, 'Video not found'));
    }

    // Delete video file and thumbnail from Cloudinary
    if (video.videoPublicId) {
      await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: 'video' });
    }
    if (video.thumbnailPublicId) {
      await cloudinary.uploader.destroy(video.thumbnailPublicId, { resource_type: 'image' });
    }

    // Delete associated comments
    await Comment.deleteMany({ videoId });

    // Delete associated likes
    await Like.deleteMany({ videoId });

    // Delete views, if you have such a model
    // await View.deleteMany({ videoId });

    // Delete the video document itself
    await video.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, 'Video and all associated data deleted successfully'));

  } catch (error) {
    console.error('Error deleting video:', error);
    return res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
  }
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
    }   

    const newStatus = !video.isPublished;

    const videoToggledPublish = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                isPublished: newStatus
            } 
        }
    ) 

    return res.status(200).json(new ApiResponse(200, videoToggledPublish, "Publish button Toggled Successfully"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllUserVideos
}