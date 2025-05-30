import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    //naam lenge , saara information lenge, 
    //agar photo hai to usko cloudinary
    //mein multer ke through bhejwange 
    //saari cheeze db mein bejwaenge db se confirmation 
    //leke haa kar denge

    // get user details from frontend 
    // validation - not empty 
    // check if user already exist(username and email) 
    // check for images, check for avatar 
    // upload them to cloudinary, avatar
    // create user object - create entry in db (mongodb is no sql toh object banega)
    // remove password and refresh token feild from response
    // check for user creation
    // return response

    const{fullname, email, username, password } = req.body
    console.log("email: ", email);

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are req")
    }

    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "user with same email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar fields are req")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar fields are req")
    }

    const user = await User.create(
        {
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "somethinf went wrong while registration")
    }

    return res.statue(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})


export  { registerUser }