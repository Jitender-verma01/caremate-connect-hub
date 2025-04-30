
import { Router } from "express";
import { registerUser, loginUser, logout, accessRefreshToken, getCurrentUser, updateAccountDetails, changeCurrentPassword } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Log requests to user routes for debugging
router.use((req, res, next) => {
  console.log(`User API Request: ${req.method} ${req.originalUrl}`);
  next();
});

router.post("/register", registerUser);
router.post("/login", loginUser);

router.route("/logout").post(verifyJWT, logout)
router.route("/refresh-token").post(accessRefreshToken)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails)
router.route("/change-password").patch(verifyJWT,changeCurrentPassword)

// Add error handling for the router
router.use((err, req, res, next) => {
  console.error("User route error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    errors: err.errors || []
  });
});

export default router;
