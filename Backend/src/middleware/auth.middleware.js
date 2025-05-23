
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request - No token provided");
        }
        
        console.log("Verifying token:", token.substring(0, 15) + "...");
        
        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log("Token verified successfully for user ID:", decodedToken?._id);
            
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
            if (!user) {
                console.log("User not found for ID:", decodedToken?._id);
                throw new ApiError(401, "Invalid access token - User not found");
            }
        
            req.user = user;
            next();
            
        } catch (jwtError) {
            console.error("JWT verification failed:", jwtError.message);
            throw new ApiError(401, `Token verification failed: ${jwtError.message}`);
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
